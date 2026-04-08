const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = Router();
const prisma = new PrismaClient();
const authorizeRoles = authMiddleware.authorizeRoles;

router.use(authMiddleware, authorizeRoles('admin'));

router.get('/', async (req, res) => {
  try {
    const parts = await prisma.part.findMany({
      include: { items: true, project: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(parts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener partes' });
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
