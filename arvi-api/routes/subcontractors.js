const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = Router();
const prisma = new PrismaClient();
const authorizeRoles = authMiddleware.authorizeRoles;

router.use(authMiddleware, authorizeRoles('admin'));

router.get('/', async (req, res) => {
  try {
    const subcontractors = await prisma.subcontractor.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(subcontractors);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener subcontratas' });
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
