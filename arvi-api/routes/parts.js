const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const parts = await prisma.part.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(parts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener partes' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const part = await prisma.part.create({
      data: req.body
    });
    res.status(201).json(part);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear parte' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const part = await prisma.part.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(part);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar parte' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
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
