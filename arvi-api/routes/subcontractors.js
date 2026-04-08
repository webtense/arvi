const { Router } = require('express');
const { prisma } = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = Router();
const authorizeRoles = authMiddleware.authorizeRoles;

router.use(authMiddleware, authorizeRoles('admin'));

router.get('/', async (req, res, next) => {
  try {
    const { status, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) where.status = status;

    const [subcontractors, total] = await Promise.all([
      prisma.subcontractor.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limitNum
      }),
      prisma.subcontractor.count({ where })
    ]);

    res.json({
      data: subcontractors,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subcontractor = await prisma.subcontractor.findUnique({
      where: { id: parseInt(id) }
    });
    if (!subcontractor) {
      return res.status(404).json({ error: 'Subcontrata no encontrada' });
    }
    res.json(subcontractor);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener subcontrata' });
  }
});

router.post('/', async (req, res) => {
  try {
    const subcontractor = await prisma.subcontractor.create({
      data: req.body
    });
    res.status(201).json(subcontractor);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear subcontrata' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subcontractor = await prisma.subcontractor.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(subcontractor);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar subcontrata' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.subcontractor.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Subcontrata eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar subcontrata' });
  }
});

module.exports = router;
