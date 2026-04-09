const { Router } = require('express');
const { prisma } = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const { sanitizeString } = require('../lib/validation');

const router = Router();
const authorizeRoles = authMiddleware.authorizeRoles;

const deletedHistoryFile = path.join(__dirname, '..', 'storage', 'deleted-assets.json');
const ensureDeletedHistory = () => {
  if (!fs.existsSync(path.dirname(deletedHistoryFile))) fs.mkdirSync(path.dirname(deletedHistoryFile), { recursive: true });
  if (!fs.existsSync(deletedHistoryFile)) fs.writeFileSync(deletedHistoryFile, JSON.stringify([], null, 2));
};

const appendDeletedAsset = (asset, reason) => {
  ensureDeletedHistory();
  const data = JSON.parse(fs.readFileSync(deletedHistoryFile, 'utf8'));
  data.unshift({ deletedAt: new Date().toISOString(), reason, asset });
  fs.writeFileSync(deletedHistoryFile, JSON.stringify(data, null, 2));
};

router.use(authMiddleware, authorizeRoles('admin'));

router.get('/', async (req, res, next) => {
  try {
    const { status, location, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) where.status = status;
    if (location) where.location = { contains: location, mode: 'insensitive' };

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.asset.count({ where })
    ]);

    res.json({
      data: assets,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res) => {
  try {
    const metadata = {
      estimatedCost: Number(req.body.estimatedCost || 0),
      category: sanitizeString(req.body.category || ''),
      criticality: sanitizeString(req.body.criticality || 'medium'),
      projectId: req.body.projectId || null,
    };

    const asset = await prisma.asset.create({
      data: {
        ...req.body,
        notes: JSON.stringify({
          source: 'backoffice',
          metadata,
          notes: sanitizeString(req.body.notes || ''),
        }),
      }
    });
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear activo' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const previous = await prisma.asset.findUnique({ where: { id: parseInt(id) } });
    let parsedNotes = {};
    try {
      parsedNotes = previous?.notes ? JSON.parse(previous.notes) : {};
    } catch (error) {
      parsedNotes = { notes: previous?.notes || '' };
    }

    const metadata = {
      ...parsedNotes.metadata,
      estimatedCost: Number(req.body.estimatedCost ?? parsedNotes.metadata?.estimatedCost ?? 0),
      category: sanitizeString(req.body.category || parsedNotes.metadata?.category || ''),
      criticality: sanitizeString(req.body.criticality || parsedNotes.metadata?.criticality || 'medium'),
      projectId: req.body.projectId ?? parsedNotes.metadata?.projectId ?? null,
    };

    const asset = await prisma.asset.update({
      where: { id: parseInt(id) },
      data: {
        ...req.body,
        notes: JSON.stringify({
          ...parsedNotes,
          metadata,
          notes: sanitizeString(req.body.notes || parsedNotes.notes || ''),
        }),
      }
    });
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar activo' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reason = sanitizeString(req.body?.reason || '');
    if (!reason) {
      return res.status(400).json({ error: 'Debes indicar el motivo de eliminacion del activo' });
    }

    const asset = await prisma.asset.findUnique({ where: { id: parseInt(id) } });
    await prisma.asset.delete({
      where: { id: parseInt(id) }
    });
    if (asset) appendDeletedAsset(asset, reason);
    res.json({ message: 'Activo eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar activo' });
  }
});

module.exports = router;
