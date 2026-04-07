const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener activos' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const asset = await prisma.asset.create({
      data: req.body
    });
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear activo' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
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

router.delete('/:id', authMiddleware, async (req, res) => {
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
