const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener presupuestos' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const budget = await prisma.budget.create({
      data: req.body
    });
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear presupuesto' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await prisma.budget.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar presupuesto' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.budget.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Presupuesto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar presupuesto' });
  }
});

module.exports = router;
