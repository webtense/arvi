const { Router } = require('express');
const { prisma } = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const messages = require('../lib/errors');

const router = Router();
const authorizeRoles = authMiddleware.authorizeRoles;

router.use(authMiddleware, authorizeRoles('admin'));

router.get('/', async (req, res, next) => {
  try {
    const { status, clientName, projectId, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) where.status = status;
    if (clientName) where.client = { contains: clientName, mode: 'insensitive' };
    if (projectId) where.projectId = parseInt(projectId);

    const [parts, total] = await Promise.all([
      prisma.part.findMany({
        where,
        include: { items: true, project: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.part.count({ where })
    ]);

    res.json({
      data: parts,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res) => {
  try {
    const { items = [], ...partData } = req.body;
    const year = new Date().getFullYear();
    const count = await prisma.part.count({
      where: { partNumber: { startsWith: `PT-${year}-` } }
    });

    const part = await prisma.part.create({
      data: {
        ...partData,
        partNumber: partData.partNumber || `PT-${year}-${String(count + 1).padStart(4, '0')}`,
        items: {
          create: items.map(item => ({
            material: item.material || item.description || 'Material',
            quantity: item.quantity || 1,
            unit: item.unit || 'ud',
            unitPrice: item.unitPrice || 0,
            total: item.total || (item.unitPrice || 0) * (item.quantity || 1)
          }))
        }
      },
      include: { items: true }
    });
    res.status(201).json(part);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear parte' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { items, ...partData } = req.body;

    if (items) {
      await prisma.partItem.deleteMany({ where: { partId: parseInt(id) } });
      const part = await prisma.part.update({
        where: { id: parseInt(id) },
        data: {
          ...partData,
          items: {
            create: items.map(item => ({
              material: item.material || item.description || 'Material',
              quantity: item.quantity || 1,
              unit: item.unit || 'ud',
              unitPrice: item.unitPrice || 0,
              total: item.total || (item.unitPrice || 0) * (item.quantity || 1)
            }))
          }
        },
        include: { items: true }
      });
      return res.json(part);
    }

    const part = await prisma.part.update({
      where: { id: parseInt(id) },
      data: partData
    });
    res.json(part);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar parte' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.part.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Parte eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar parte' });
  }
});

module.exports = router;
