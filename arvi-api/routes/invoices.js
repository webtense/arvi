const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const invoice = await prisma.invoice.create({
      data: req.body
    });
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear factura' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar factura' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.invoice.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Factura eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar factura' });
  }
});

module.exports = router;
