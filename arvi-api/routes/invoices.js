const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, type, client, startDate, endDate, projectId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (client) where.client = { contains: client, mode: 'insensitive' };
    if (projectId) where.projectId = parseInt(projectId);
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: { items: true, project: true },
      orderBy: { date: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { year } = req.query;
    const startDate = new Date(`${year || new Date().getFullYear()}-01-01`);
    const endDate = new Date(`${year || new Date().getFullYear()}-12-31`);
    
    const invoices = await prisma.invoice.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        status: { in: ['finalized'] }
      },
      select: { total: true, date: true }
    });

    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      amount: 0
    }));

    invoices.forEach(inv => {
      const month = new Date(inv.date).getMonth();
      monthly[month].amount += inv.total;
    });

    const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const pending = await prisma.invoice.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'pending' }
    });

    res.json({ total, monthly, pendingAmount: pending._sum.total || 0, count: invoices.length });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

router.get('/next-number', authMiddleware, async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count({
      where: { invoiceNumber: { startsWith: `${year}/` } }
    });
    res.json({ nextNumber: `${year}/${(count + 1).toString().padStart(4, '0')}` });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener número' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: { items: true, project: true }
    });
    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener factura' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, ...invoiceData } = req.body;
    
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const taxTotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.tax / 100), 0);
    const total = subtotal + taxTotal;

    const year = new Date().getFullYear();
    const count = await prisma.invoice.count({
      where: { invoiceNumber: { startsWith: `${year}/` } }
    });

    const invoice = await prisma.invoice.create({
      data: {
        ...invoiceData,
        invoiceNumber: invoiceData.invoiceNumber || `${year}/${(count + 1).toString().padStart(4, '0')}`,
        date: new Date(invoiceData.date),
        dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : null,
        subtotal,
        taxTotal,
        total,
        items: {
          create: items.map(item => ({
            description: item.description,
            quantity: item.quantity || 1,
            unit: item.unit || 'ud',
            unitPrice: item.unitPrice,
            tax: item.tax || 21,
            total: item.unitPrice * (item.quantity || 1) * (1 + item.tax / 100)
          }))
        }
      },
      include: { items: true }
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Error al crear factura' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { items, ...invoiceData } = req.body;

    if (items) {
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: parseInt(id) } });
      
      const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const taxTotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.tax / 100), 0);
      const total = subtotal + taxTotal;

      const invoice = await prisma.invoice.update({
        where: { id: parseInt(id) },
        data: {
          ...invoiceData,
          subtotal,
          taxTotal,
          total,
          items: {
            create: items.map(item => ({
              description: item.description,
              quantity: item.quantity || 1,
              unit: item.unit || 'ud',
              unitPrice: item.unitPrice,
              tax: item.tax || 21,
              total: item.unitPrice * (item.quantity || 1) * (1 + item.tax / 100)
            }))
          }
        },
        include: { items: true }
      });
      res.json(invoice);
    } else {
      const invoice = await prisma.invoice.update({
        where: { id: parseInt(id) },
        data: invoiceData
      });
      res.json(invoice);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar factura' });
  }
});

router.post('/:id/finalize', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const lastInvoice = await prisma.invoice.findFirst({
      where: { status: { in: ['finalized'] } },
      orderBy: { finalDate: 'desc' }
    });
    const prevHash = lastInvoice?.hash || '0000000000000000000000000000000';
    
    const newHash = Buffer.from(`${id}${prevHash}${Date.now()}`).toString('base64').slice(0, 32);

    const invoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: {
        status: 'finalized',
        type: 'invoice',
        hash: newHash,
        prevHash: prevHash,
        finalDate: new Date()
      }
    });

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Error al finalizar factura' });
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