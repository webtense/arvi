const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const ticket = await prisma.ticket.create({
      data: req.body
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear ticket' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await prisma.ticket.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar ticket' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.ticket.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Ticket eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar ticket' });
  }
});

module.exports = router;
