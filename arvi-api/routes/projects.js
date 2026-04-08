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

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          _count: { select: { tickets: true, budgets: true, parts: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.project.count({ where })
    ]);

    res.json({
      data: projects,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res) => {
  try {
    const active = await prisma.project.count({ where: { status: 'active' } });
    const completed = await prisma.project.count({ where: { status: 'completed' } });
    const totalBudget = await prisma.project.aggregate({
      _sum: { budget: true },
      where: { status: 'active' }
    });
    res.json({ active, completed, totalBudget: totalBudget._sum.budget || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        tickets: true,
        budgets: true,
        parts: { include: { items: true } },
        invoices: true
      }
    });
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proyecto' });
  }
});

router.post('/', async (req, res) => {
  try {
    const project = await prisma.project.create({
      data: req.body
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear proyecto' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar proyecto' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Proyecto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar proyecto' });
  }
});

module.exports = router;
