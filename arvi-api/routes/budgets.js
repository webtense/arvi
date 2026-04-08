const { Router } = require('express');
const { prisma } = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const messages = require('../lib/errors');

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
    const { items, ...budgetData } = req.body;
    
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
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar presupuesto' });
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
