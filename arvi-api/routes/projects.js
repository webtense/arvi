const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: { tickets: true, budgets: true, parts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
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

router.get('/:id', authMiddleware, async (req, res) => {
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

router.post('/', authMiddleware, async (req, res) => {
  try {
    const project = await prisma.project.create({
      data: req.body
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear proyecto' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
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

router.delete('/:id', authMiddleware, async (req, res) => {
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