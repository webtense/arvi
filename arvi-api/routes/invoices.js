const { Router } = require('express');
const { prisma } = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const messages = require('../lib/errors');

const router = Router();
const authorizeRoles = authMiddleware.authorizeRoles;

router.use(authMiddleware, authorizeRoles('admin'));

router.get('/', async (req, res, next) => {
  try {
    const { 
      status, 
      type, 
      clientName, 
      startDate, 
      endDate, 
      projectId,
      page = '1',
      limit = '50'
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (clientName) where.clientName = { contains: clientName, mode: 'insensitive' };
    if (projectId) where.projectId = parseInt(projectId);
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: { items: true, project: true },
        orderBy: { date: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.invoice.count({ where })
    ]);

    res.json({
      data: invoices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const { year } = req.query;
    const currentYear = parseInt(year) || new Date().getFullYear();
    const startDate = new Date(`${currentYear}-01-01`);
    const endDate = new Date(`${currentYear}-12-31`);
    
    const [finalizedInvoices, pendingInvoices, draftCount] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
          status: 'finalized'
        },
        select: { total: true, date: true }
      }),
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'pending', status: 'finalized' }
      }),
      prisma.invoice.count({ where: { status: 'draft' } })
    ]);

    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      amount: 0
    }));

    finalizedInvoices.forEach(inv => {
      const month = new Date(inv.date).getMonth();
      monthly[month].amount += Number(inv.total);
    });

    const total = finalizedInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

    res.json({ 
      total, 
      monthly, 
      pendingAmount: Number(pendingInvoices._sum.total) || 0, 
      count: finalizedInvoices.length,
      draftCount
    });
  } catch (error) {
    next(error);
  }
});

router.get('/next-number', async (req, res) => {
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

router.get('/historical-imports', async (req, res, next) => {
  try {
    const { year, clientId, search, minAmount, maxAmount, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      OR: [{ invoiceNumber: { startsWith: 'H' } }, { notes: { contains: 'IMPORT_HISTORICO' } }],
    };

    if (year) {
      where.invoiceNumber = { startsWith: `H${year}/` };
    }

    if (clientId) where.clientId = parseInt(clientId, 10);
    if (search) {
      where.AND = [
        {
          OR: [
            { clientName: { contains: search, mode: 'insensitive' } },
            { invoiceNumber: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const min = minAmount !== undefined ? Number(minAmount) : null;
    const max = maxAmount !== undefined ? Number(maxAmount) : null;
    if (min !== null || max !== null) {
      where.total = {
        ...(min !== null && Number.isFinite(min) ? { gte: min } : {}),
        ...(max !== null && Number.isFinite(max) ? { lte: max } : {}),
      };
    }

    const [rows, total, grouped] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: { items: true, client: true },
        orderBy: { date: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.invoice.count({ where }),
      prisma.invoice.groupBy({
        by: ['invoiceNumber'],
        where: { OR: [{ invoiceNumber: { startsWith: 'H' } }, { notes: { contains: 'IMPORT_HISTORICO' } }] },
        _count: { invoiceNumber: true },
      }),
    ]);

    const years = {};
    grouped.forEach((entry) => {
      const y = String(entry.invoiceNumber || '').match(/^H(\d{4})\//)?.[1];
      if (y) years[y] = (years[y] || 0) + entry._count.invoiceNumber;
    });

    res.json({
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      years,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res) => {
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

router.post('/', async (req, res) => {
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
        clientName: invoiceData.clientName || invoiceData.client || 'Cliente',
        clientCif: invoiceData.clientCif || null,
        clientAddress: invoiceData.clientAddress || null,
        clientId: invoiceData.clientId ? parseInt(invoiceData.clientId, 10) : null,
        description: invoiceData.description || null,
        notes: invoiceData.notes || null,
        paymentMethod: invoiceData.paymentMethod || null,
        projectId: invoiceData.projectId ? parseInt(invoiceData.projectId, 10) : null,
        status: invoiceData.status || 'draft',
        type: invoiceData.type || 'draft',
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

router.put('/:id', async (req, res) => {
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
          clientName: invoiceData.clientName || invoiceData.client || undefined,
          clientCif: invoiceData.clientCif,
          clientAddress: invoiceData.clientAddress,
          clientId: invoiceData.clientId ? parseInt(invoiceData.clientId, 10) : null,
          description: invoiceData.description,
          notes: invoiceData.notes,
          paymentMethod: invoiceData.paymentMethod,
          projectId: invoiceData.projectId ? parseInt(invoiceData.projectId, 10) : null,
          status: invoiceData.status,
          type: invoiceData.type,
          date: invoiceData.date ? new Date(invoiceData.date) : undefined,
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
      res.json(invoice);
    } else {
      const invoice = await prisma.invoice.update({
        where: { id: parseInt(id) },
        data: {
          ...(invoiceData.clientName || invoiceData.client ? { clientName: invoiceData.clientName || invoiceData.client } : {}),
          ...(invoiceData.clientCif !== undefined ? { clientCif: invoiceData.clientCif } : {}),
          ...(invoiceData.clientAddress !== undefined ? { clientAddress: invoiceData.clientAddress } : {}),
          ...(invoiceData.clientId !== undefined ? { clientId: invoiceData.clientId ? parseInt(invoiceData.clientId, 10) : null } : {}),
          ...(invoiceData.description !== undefined ? { description: invoiceData.description } : {}),
          ...(invoiceData.notes !== undefined ? { notes: invoiceData.notes } : {}),
          ...(invoiceData.paymentMethod !== undefined ? { paymentMethod: invoiceData.paymentMethod } : {}),
          ...(invoiceData.projectId !== undefined ? { projectId: invoiceData.projectId ? parseInt(invoiceData.projectId, 10) : null } : {}),
          ...(invoiceData.status !== undefined ? { status: invoiceData.status } : {}),
          ...(invoiceData.type !== undefined ? { type: invoiceData.type } : {}),
          ...(invoiceData.date ? { date: new Date(invoiceData.date) } : {}),
          ...(invoiceData.dueDate !== undefined ? { dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : null } : {}),
        }
      });
      res.json(invoice);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar factura' });
  }
});

router.post('/:id/finalize', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la factura existe y está en estado draft
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingInvoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    if (existingInvoice.status === 'finalized') {
      return res.status(400).json({ error: 'La factura ya está finalizada' });
    }
    
    // Obtener la última factura finalizada para el hash
    const lastInvoice = await prisma.invoice.findFirst({
      where: { status: 'finalized' },
      orderBy: { finalDate: 'desc' }
    });
    const prevHash = lastInvoice?.hash || '0000000000000000000000000000000';
    
    // Generar hash Verifactu (simulación - en producción usar algoritmo real AEAT)
    const invoiceData = `${existingInvoice.invoiceNumber}${existingInvoice.total}${prevHash}${Date.now()}`;
    const newHash = require('crypto').createHash('sha256').update(invoiceData).digest('hex').toUpperCase();

    const invoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: {
        status: 'finalized',
        type: 'definitive',
        hash: newHash,
        prevHash: prevHash,
        finalDate: new Date()
      },
      include: { items: true }
    });

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Error al finalizar factura' });
  }
});

// Cancelar factura
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    if (invoice.status !== 'finalized') {
      return res.status(400).json({ error: 'Solo se pueden cancelar facturas finalizadas' });
    }
    
    // En Verifactu real, las facturas canceladas se sustituyen por rectificativa
    const canceled = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: {
        status: 'cancelled',
        notes: invoice.notes ? `${invoice.notes}\nCancelada: ${reason}` : `Cancelada: ${reason}`
      },
      include: { items: true }
    });
    
    res.json(canceled);
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar factura' });
  }
});

// Duplicar factura
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    
    const original = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: { items: true }
    });
    
    if (!original) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count({
      where: { invoiceNumber: { startsWith: `${year}/` } }
    });
    
    const duplicate = await prisma.invoice.create({
      data: {
        invoiceNumber: `${year}/${(count + 1).toString().padStart(4, '0')}`,
        date: new Date(),
        dueDate: original.dueDate,
        client: original.client,
        clientCif: original.clientCif,
        clientAddress: original.clientAddress,
        description: original.description,
        subtotal: original.subtotal,
        taxRate: original.taxRate,
        taxTotal: original.taxTotal,
        total: original.total,
        status: 'draft',
        type: 'draft',
        notes: `Duplicada de: ${original.invoiceNumber}`,
        items: {
          create: original.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            tax: item.tax,
            total: item.total
          }))
        }
      },
      include: { items: true }
    });
    
    res.status(201).json(duplicate);
  } catch (error) {
    res.status(500).json({ error: 'Error al duplicar factura' });
  }
});

router.delete('/:id', async (req, res) => {
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
