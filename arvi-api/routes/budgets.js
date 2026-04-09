const { Router } = require('express');
const { prisma } = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const messages = require('../lib/errors');
const { sanitizeString, validateEmail } = require('../lib/validation');
const { sendMail } = require('../lib/mailer');

const router = Router();
const authorizeRoles = authMiddleware.authorizeRoles;

router.use(authMiddleware, authorizeRoles('admin'));

router.get('/', async (req, res, next) => {
  try {
    const { status, clientName, projectId, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) where.status = status;
    if (clientName) where.client = { contains: clientName, mode: 'insensitive' };
    if (projectId) where.projectId = parseInt(projectId);

    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
        where,
        include: { items: true, project: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.budget.count({ where })
    ]);

    res.json({
      data: budgets,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res) => {
  try {
    const draft = await prisma.budget.count({ where: { status: 'draft' } });
    const sent = await prisma.budget.count({ where: { status: 'sent' } });
    const accepted = await prisma.budget.count({ where: { status: 'accepted' } });
    const invoiced = await prisma.budget.count({ where: { status: 'invoiced' } });
    const rejected = await prisma.budget.count({ where: { status: 'rejected' } });
    
    const totalAmount = await prisma.budget.aggregate({
      _sum: { total: true },
      where: { status: { in: ['sent', 'accepted'] } }
    });

    res.json({ draft, sent, accepted, invoiced, rejected, totalAmount: totalAmount._sum.total || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

router.get('/next-number', async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const count = await prisma.budget.count({
      where: { budgetNumber: { startsWith: `P${year}` } }
    });
    res.json({ nextNumber: `P${year}${(count + 1).toString().padStart(4, '0')}` });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener número' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await prisma.budget.findUnique({
      where: { id: parseInt(id) },
      include: { items: true, project: true }
    });
    if (!budget) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener presupuesto' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { items, clientId, ...budgetData } = req.body;

    let resolvedClient = null;
    if (clientId) {
      resolvedClient = await prisma.client.findUnique({ where: { id: parseInt(clientId, 10) } });
    }

    if (!resolvedClient && budgetData.client) {
      const normalizedEmail = budgetData.clientEmail ? budgetData.clientEmail.toLowerCase() : null;
      resolvedClient = await prisma.client.findFirst({
        where: {
          OR: [
            { name: { equals: budgetData.client, mode: 'insensitive' } },
            ...(normalizedEmail ? [{ email: { equals: normalizedEmail, mode: 'insensitive' } }] : []),
          ],
        },
      });
    }

    if (!resolvedClient && budgetData.client) {
      resolvedClient = await prisma.client.create({
        data: {
          name: sanitizeString(budgetData.client),
          cif: budgetData.clientCif || null,
          email: budgetData.clientEmail ? budgetData.clientEmail.toLowerCase() : null,
          phone: budgetData.clientPhone || null,
          address: budgetData.clientAddress || null,
        },
      });
    }
    
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const taxTotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.tax / 100), 0);
    const total = subtotal + taxTotal;

    const year = new Date().getFullYear();
    const count = await prisma.budget.count({
      where: { budgetNumber: { startsWith: `P${year}` } }
    });

    const budget = await prisma.budget.create({
      data: {
        ...budgetData,
        client: resolvedClient?.name || budgetData.client,
        clientCif: resolvedClient?.cif || budgetData.clientCif || null,
        clientEmail: resolvedClient?.email || budgetData.clientEmail || null,
        clientPhone: resolvedClient?.phone || budgetData.clientPhone || null,
        clientAddress: resolvedClient?.address || budgetData.clientAddress || null,
        budgetNumber: budgetData.budgetNumber || `P${year}${(count + 1).toString().padStart(4, '0')}`,
        date: new Date(budgetData.date),
        subtotal,
        taxTotal,
        total,
        items: {
          create: items.map(item => ({
            category: item.category,
            description: item.description,
            quantity: item.quantity || 1,
            unit: item.unit || 'ud',
            unitPrice: item.unitPrice,
            tax: item.tax || 21,
            total: item.unitPrice * (item.quantity || 1)
          }))
        }
      },
      include: { items: true }
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Error al crear presupuesto' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { items, ...budgetData } = req.body;

    if (items) {
      await prisma.budgetItem.deleteMany({ where: { budgetId: parseInt(id) } });
      
      const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const taxTotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.tax / 100), 0);
      const total = subtotal + taxTotal;

      const budget = await prisma.budget.update({
        where: { id: parseInt(id) },
        data: {
          ...budgetData,
          subtotal,
          taxTotal,
          total,
          items: {
            create: items.map(item => ({
              category: item.category,
              description: item.description,
              quantity: item.quantity || 1,
              unit: item.unit || 'ud',
              unitPrice: item.unitPrice,
              tax: item.tax || 21,
              total: item.unitPrice * (item.quantity || 1)
            }))
          }
        },
        include: { items: true }
      });
      res.json(budget);
    } else {
      const budget = await prisma.budget.update({
        where: { id: parseInt(id) },
        data: budgetData
      });
      res.json(budget);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar presupuesto' });
  }
});

router.post('/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await prisma.budget.update({
      where: { id: parseInt(id) },
      data: {
        status: 'sent',
        sentAt: new Date()
      }
    });

    const recipients = [budget.clientEmail, process.env.ADMIN_EMAIL || 'info@arvimanteniment.com'].filter(Boolean);

    if (budget.clientEmail && validateEmail(budget.clientEmail)) {
      return res.status(400).json({ error: 'El cliente no tiene email valido para envio' });
    }

    if (recipients.length > 0) {
      await sendMail({
        to: recipients.join(','),
        subject: `Presupuesto ${budget.budgetNumber}`,
        text: `Hola ${budget.client},

Adjuntamos el presupuesto ${budget.budgetNumber}.
Total estimado: ${Number(budget.total || 0).toFixed(2)} EUR.

Gracias,
ARVI`,
      });
    }

    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar presupuesto' });
  }
});

router.post('/:id/to-invoice', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const budget = await prisma.budget.findUnique({ where: { id }, include: { items: true } });
    if (!budget) return res.status(404).json({ error: 'Presupuesto no encontrado' });

    const year = new Date().getFullYear();
    const count = await prisma.invoice.count({ where: { invoiceNumber: { startsWith: `${year}/` } } });

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `${year}/${String(count + 1).padStart(4, '0')}`,
        date: new Date(),
        clientName: budget.client,
        clientCif: budget.clientCif,
        clientAddress: budget.clientAddress,
        description: `Generada desde presupuesto ${budget.budgetNumber}`,
        subtotal: budget.subtotal,
        taxRate: budget.taxRate,
        taxTotal: budget.taxTotal,
        total: budget.total,
        status: 'draft',
        type: 'draft',
        items: {
          create: budget.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            tax: item.tax,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });

    await prisma.budget.update({ where: { id }, data: { status: 'invoiced' } });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Error al convertir presupuesto en factura' });
  }
});

router.post('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await prisma.budget.update({
      where: { id: parseInt(id) },
      data: {
        status: 'accepted',
        acceptedAt: new Date()
      }
    });
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Error al aceptar presupuesto' });
  }
});

router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await prisma.budget.update({
      where: { id: parseInt(id) },
      data: { status: 'rejected' }
    });
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Error al rechazar presupuesto' });
  }
});

router.delete('/:id', async (req, res) => {
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
