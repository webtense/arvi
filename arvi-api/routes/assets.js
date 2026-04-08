const { Router } = require('express');
const { prisma } = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = Router();
const authorizeRoles = authMiddleware.authorizeRoles;

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
    const asset = await prisma.asset.create({
      data: req.body
    });
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear activo' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await prisma.asset.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar activo' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.asset.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Activo eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar activo' });
  }
});

module.exports = router;
