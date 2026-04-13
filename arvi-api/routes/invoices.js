const { Router } = require('express');
const crypto = require('crypto');
const path = require('path');
const { prisma } = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const { generateInvoicePdf } = require('../lib/pdf');

const router = Router();
const authorizeRoles = authMiddleware.authorizeRoles;

const ARVI_DESCRIPTION = [
  'Reparem el passat | Mantenim el present | Instal·lem el futur',
  'ARVI MANTENIMENTS INTEGRALS S.L.',
  'C/ Sentmenat, 5 · Sabadell BCN 08203',
  'Tel. +34 669 47 55 83 · vendes@arvimanteniment.com',
].join('\n');

const LIST_SELECT = {
  id: true,
  invoiceNumber: true,
  date: true,
  dueDate: true,
  clientName: true,
  clientCif: true,
  clientAddress: true,
  description: true,
  subtotal: true,
  taxRate: true,
  taxTotal: true,
  total: true,
  status: true,
  type: true,
  hash: true,
  prevHash: true,
  finalDate: true,
  notes: true,
  paymentMethod: true,
  paymentStatus: true,
  createdAt: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      name: true,
    },
  },
};

const isStandardInvoiceNumber = (value = '') => /^\d{4}\/\d{3,}$/.test(value);
const isHistoricalInvoice = (invoiceNumber = '', notes = '') => /^H\d{4}\//i.test(invoiceNumber) || (notes || '').toUpperCase().includes('IMPORT_HISTORICO');
const isDraftNumber = (value = '') => /^DRAFT-\d{4}-/i.test(value);

const ensureArviBranding = (invoice) => {
  if (!invoice) return invoice;
  if (isHistoricalInvoice(invoice.invoiceNumber, invoice.notes)) {
    const hasBranding = typeof invoice.description === 'string' && invoice.description.toLowerCase().includes('arvi');
    if (!hasBranding) return { ...invoice, description: ARVI_DESCRIPTION };
  }
  return invoice;
};

const brandInvoices = (records) => (Array.isArray(records) ? records.map(ensureArviBranding) : ensureArviBranding(records));

const buildDraftNumber = (referenceDate = new Date(), seed = Date.now()) => {
  const date = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  const year = Number.isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
  return `DRAFT-${year}-${String(seed).padStart(6, '0')}`;
};

const buildInvoiceWhere = ({
  status,
  type,
  clientName,
  startDate,
  endDate,
  projectId,
  search,
  paymentStatus,
  minTotal,
  maxTotal,
  historical,
}) => {
  const where = {};

  if (status) where.status = status;
  if (type) where.type = type;
  if (clientName) where.clientName = { contains: clientName, mode: 'insensitive' };
  if (projectId) where.projectId = parseInt(projectId, 10);
  if (paymentStatus) where.paymentStatus = paymentStatus;

  if (startDate || endDate) {
    where.date = {
      ...(startDate ? { gte: new Date(startDate) } : {}),
      ...(endDate ? { lte: new Date(endDate) } : {}),
    };
  }

  const min = minTotal !== undefined && minTotal !== '' ? Number(minTotal) : null;
  const max = maxTotal !== undefined && maxTotal !== '' ? Number(maxTotal) : null;
  if (Number.isFinite(min) || Number.isFinite(max)) {
    where.total = {
      ...(Number.isFinite(min) ? { gte: min } : {}),
      ...(Number.isFinite(max) ? { lte: max } : {}),
    };
  }

  if (historical === 'true') {
    where.OR = [{ invoiceNumber: { startsWith: 'H' } }, { notes: { contains: 'IMPORT_HISTORICO' } }];
  } else if (historical === 'false') {
    where.NOT = [{ invoiceNumber: { startsWith: 'H' } }, { notes: { contains: 'IMPORT_HISTORICO' } }];
  }

  if (search) {
    const searchGroup = {
      OR: [
        { clientName: { contains: search, mode: 'insensitive' } },
        { clientCif: { contains: search, mode: 'insensitive' } },
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ],
    };

    where.AND = [...(where.AND || []), searchGroup];
  }

  return where;
};

const buildOrderBy = (sort = 'date_desc') => {
  switch (sort) {
    case 'date_asc':
      return [{ date: 'asc' }];
    case 'total_desc':
      return [{ total: 'desc' }];
    case 'total_asc':
      return [{ total: 'asc' }];
    case 'client_asc':
      return [{ clientName: 'asc' }];
    case 'client_desc':
      return [{ clientName: 'desc' }];
    case 'number_asc':
      return [{ invoiceNumber: 'asc' }];
    case 'number_desc':
      return [{ invoiceNumber: 'desc' }];
    default:
      return [{ date: 'desc' }, { createdAt: 'desc' }];
  }
};

const getNextSequentialInvoiceNumber = async (inputDate) => {
  const date = inputDate ? new Date(inputDate) : new Date();
  const targetDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const year = targetDate.getFullYear();
  const prefix = `${year}/`;
  const existing = await prisma.invoice.findMany({
    where: {
      invoiceNumber: { startsWith: prefix },
      status: { not: 'draft' },
    },
    select: { invoiceNumber: true },
  });

  const maxSequential = existing.reduce((max, invoice) => {
    const match = invoice.invoiceNumber?.match(/^(\d{4})\/(\d+)/);
    if (!match) return max;
    const number = parseInt(match[2], 10);
    return Number.isFinite(number) && number > max ? number : max;
  }, 0);

  return `${year}/${String(maxSequential + 1).padStart(3, '0')}`;
};

const buildInvoicePayload = (invoiceData, items) => {
  const subtotal = items.reduce((sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 0), 0);
  const taxTotal = items.reduce((sum, item) => sum + (Number(item.unitPrice || 0) * Number(item.quantity || 0) * Number(item.tax || 0)) / 100, 0);
  const total = subtotal + taxTotal;
  const invoiceDate = invoiceData.date ? new Date(invoiceData.date) : new Date();
  const normalizedDate = Number.isNaN(invoiceDate.getTime()) ? new Date() : invoiceDate;
  const dueDateValue = invoiceData.dueDate ? new Date(invoiceData.dueDate) : null;
  const normalizedDueDate = dueDateValue && !Number.isNaN(dueDateValue.getTime()) ? dueDateValue : null;

  return {
    clientName: invoiceData.clientName || invoiceData.client || 'Cliente',
    clientCif: invoiceData.clientCif || null,
    clientAddress: invoiceData.clientAddress || null,
    clientId: invoiceData.clientId ? parseInt(invoiceData.clientId, 10) : null,
    description: invoiceData.description || null,
    notes: invoiceData.notes || null,
    paymentMethod: invoiceData.paymentMethod || null,
    paymentStatus: invoiceData.paymentStatus || 'pending',
    projectId: invoiceData.projectId ? parseInt(invoiceData.projectId, 10) : null,
    status: invoiceData.status || 'draft',
    type: invoiceData.type || 'draft',
    date: normalizedDate,
    dueDate: normalizedDueDate,
    subtotal,
    taxTotal,
    total,
    items: {
      create: items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity || 1),
        unit: item.unit || 'ud',
        unitPrice: Number(item.unitPrice || 0),
        tax: Number(item.tax || 21),
        total: Number(item.unitPrice || 0) * Number(item.quantity || 1) * (1 + Number(item.tax || 21) / 100),
      })),
    },
  };
};

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
      limit = '50',
      search,
      paymentStatus,
      minTotal,
      maxTotal,
      historical,
      sort = 'date_desc',
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 50, 100);
    const skip = (pageNum - 1) * limitNum;
    const where = buildInvoiceWhere({ status, type, clientName, startDate, endDate, projectId, search, paymentStatus, minTotal, maxTotal, historical });
    const orderBy = buildOrderBy(sort);

    const [rows, total] = await Promise.all([
      prisma.invoice.findMany({ where, select: LIST_SELECT, orderBy, skip, take: limitNum }),
      prisma.invoice.count({ where }),
    ]);

    res.json({
      data: brandInvoices(rows),
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const { year } = req.query;
    const currentYear = parseInt(year, 10) || new Date().getFullYear();
    const startDate = new Date(`${currentYear}-01-01`);
    const endDate = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    const [finalizedInvoices, pendingInvoices, draftCount] = await Promise.all([
      prisma.invoice.findMany({
        where: { date: { gte: startDate, lte: endDate }, status: 'finalized' },
        select: { total: true, date: true },
      }),
      prisma.invoice.aggregate({ _sum: { total: true }, where: { paymentStatus: 'pending', status: 'finalized' } }),
      prisma.invoice.count({ where: { status: 'draft' } }),
    ]);

    const monthly = Array.from({ length: 12 }, (_, index) => ({ month: index + 1, amount: 0 }));
    finalizedInvoices.forEach((invoice) => {
      const month = new Date(invoice.date).getMonth();
      monthly[month].amount += Number(invoice.total || 0);
    });

    res.json({
      total: finalizedInvoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0),
      monthly,
      pendingAmount: Number(pendingInvoices._sum.total) || 0,
      count: finalizedInvoices.length,
      draftCount,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/next-number', async (req, res) => {
  try {
    const nextNumber = await getNextSequentialInvoiceNumber(req.query.date || new Date());
    res.json({ nextNumber });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener número' });
  }
});

router.get('/historical-imports', async (req, res, next) => {
  try {
    const payload = await prisma.invoice.groupBy({
      by: ['invoiceNumber'],
      where: { OR: [{ invoiceNumber: { startsWith: 'H' } }, { notes: { contains: 'IMPORT_HISTORICO' } }] },
      _count: { invoiceNumber: true },
    });

    const years = {};
    payload.forEach((entry) => {
      const year = String(entry.invoiceNumber || '').match(/^H(\d{4})\//)?.[1];
      if (year) years[year] = (years[year] || 0) + entry._count.invoiceNumber;
    });

    const { page = '1', limit = '50', ...rest } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 50, 100);
    const skip = (pageNum - 1) * limitNum;
    const where = buildInvoiceWhere({ ...rest, historical: 'true', minTotal: req.query.minAmount, maxTotal: req.query.maxAmount, search: req.query.search });

    const [rows, total] = await Promise.all([
      prisma.invoice.findMany({ where, select: LIST_SELECT, orderBy: [{ date: 'desc' }], skip, take: limitNum }),
      prisma.invoice.count({ where }),
    ]);

    res.json({
      data: brandInvoices(rows),
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
      years,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id(\d+)/pdf', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true, project: true },
    });

    if (!invoice) return res.status(404).json({ error: 'Factura no encontrada' });

    const pdfPath = await generateInvoicePdf(ensureArviBranding(invoice), path.join(__dirname, '..', 'storage', 'invoices-pdf'));
    return res.download(pdfPath, `${invoice.invoiceNumber || `factura-${invoice.id}`}.pdf`);
  } catch (error) {
    return res.status(500).json({ error: 'Error al generar PDF de factura' });
  }
});

router.get('/:id(\d+)', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true, project: true },
    });
    if (!invoice) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json(ensureArviBranding(invoice));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener factura' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { items = [], ...invoiceData } = req.body;
    const payload = buildInvoicePayload(invoiceData, items);
    const incomingNumber = invoiceData.invoiceNumber;
    const keepIncoming = incomingNumber && (isHistoricalInvoice(incomingNumber, invoiceData.notes) || isStandardInvoiceNumber(incomingNumber));
    const normalizedDate = payload.date || new Date();
    const invoiceNumber = keepIncoming ? incomingNumber : buildDraftNumber(normalizedDate, Date.now());

    const invoice = await prisma.invoice.create({
      data: {
        ...payload,
        invoiceNumber,
        status: keepIncoming && isStandardInvoiceNumber(invoiceNumber) ? payload.status : 'draft',
        type: keepIncoming && isHistoricalInvoice(invoiceNumber, invoiceData.notes) ? 'definitive' : 'draft',
      },
      include: { items: true },
    });

    res.status(201).json(ensureArviBranding(invoice));
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Error al crear factura' });
  }
});

router.put('/:id(\d+)', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { items, ...invoiceData } = req.body;

    if (items) {
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
      const payload = buildInvoicePayload(invoiceData, items);

      const invoice = await prisma.invoice.update({
        where: { id },
        data: {
          ...payload,
          status: invoiceData.status || payload.status,
          type: invoiceData.type || payload.type,
        },
        include: { items: true },
      });

      return res.json(ensureArviBranding(invoice));
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...(invoiceData.clientName || invoiceData.client ? { clientName: invoiceData.clientName || invoiceData.client } : {}),
        ...(invoiceData.clientCif !== undefined ? { clientCif: invoiceData.clientCif } : {}),
        ...(invoiceData.clientAddress !== undefined ? { clientAddress: invoiceData.clientAddress } : {}),
        ...(invoiceData.clientId !== undefined ? { clientId: invoiceData.clientId ? parseInt(invoiceData.clientId, 10) : null } : {}),
        ...(invoiceData.description !== undefined ? { description: invoiceData.description } : {}),
        ...(invoiceData.notes !== undefined ? { notes: invoiceData.notes } : {}),
        ...(invoiceData.paymentMethod !== undefined ? { paymentMethod: invoiceData.paymentMethod } : {}),
        ...(invoiceData.paymentStatus !== undefined ? { paymentStatus: invoiceData.paymentStatus } : {}),
        ...(invoiceData.projectId !== undefined ? { projectId: invoiceData.projectId ? parseInt(invoiceData.projectId, 10) : null } : {}),
        ...(invoiceData.status !== undefined ? { status: invoiceData.status } : {}),
        ...(invoiceData.type !== undefined ? { type: invoiceData.type } : {}),
        ...(invoiceData.date ? { date: new Date(invoiceData.date) } : {}),
        ...(invoiceData.dueDate !== undefined ? { dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : null } : {}),
      },
      include: { items: true },
    });

    return res.json(ensureArviBranding(invoice));
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar factura' });
  }
});

router.post('/:id(\d+)/finalize', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existingInvoice = await prisma.invoice.findUnique({ where: { id } });
    if (!existingInvoice) return res.status(404).json({ error: 'Factura no encontrada' });
    if (existingInvoice.status === 'finalized') return res.status(400).json({ error: 'La factura ya está finalizada' });

    const lastInvoice = await prisma.invoice.findFirst({ where: { status: 'finalized' }, orderBy: { finalDate: 'desc' } });
    const prevHash = lastInvoice?.hash || '0000000000000000000000000000000';
    const definitiveNumber = isHistoricalInvoice(existingInvoice.invoiceNumber, existingInvoice.notes)
      ? existingInvoice.invoiceNumber
      : await getNextSequentialInvoiceNumber(existingInvoice.date || new Date());

    const hashInput = `${definitiveNumber}${existingInvoice.total}${prevHash}${Date.now()}`;
    const newHash = crypto.createHash('sha256').update(hashInput).digest('hex').toUpperCase();

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        invoiceNumber: definitiveNumber,
        status: 'finalized',
        type: 'definitive',
        hash: newHash,
        prevHash,
        finalDate: new Date(),
      },
      include: { items: true },
    });

    return res.json(ensureArviBranding(invoice));
  } catch (error) {
    return res.status(500).json({ error: 'Error al finalizar factura' });
  }
});

router.post('/:id(\d+)/cancel', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { reason } = req.body;
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return res.status(404).json({ error: 'Factura no encontrada' });
    if (invoice.status !== 'finalized') return res.status(400).json({ error: 'Solo se pueden cancelar facturas finalizadas' });

    const canceled = await prisma.invoice.update({
      where: { id },
      data: {
        status: 'cancelled',
        notes: invoice.notes ? `${invoice.notes}\nCancelada: ${reason}` : `Cancelada: ${reason}`,
      },
      include: { items: true },
    });

    return res.json(ensureArviBranding(canceled));
  } catch (error) {
    return res.status(500).json({ error: 'Error al cancelar factura' });
  }
});

router.post('/:id(\d+)/duplicate', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const original = await prisma.invoice.findUnique({ where: { id }, include: { items: true } });
    if (!original) return res.status(404).json({ error: 'Factura no encontrada' });

    const duplicate = await prisma.invoice.create({
      data: {
        invoiceNumber: buildDraftNumber(new Date(), Date.now()),
        date: new Date(),
        dueDate: original.dueDate,
        clientName: original.clientName,
        clientCif: original.clientCif,
        clientAddress: original.clientAddress,
        clientId: original.clientId,
        description: original.description,
        subtotal: original.subtotal,
        taxRate: original.taxRate,
        taxTotal: original.taxTotal,
        total: original.total,
        status: 'draft',
        type: 'draft',
        paymentMethod: original.paymentMethod,
        paymentStatus: 'pending',
        notes: `Duplicada de: ${original.invoiceNumber}`,
        items: {
          create: original.items.map((item) => ({
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

    return res.status(201).json(ensureArviBranding(duplicate));
  } catch (error) {
    return res.status(500).json({ error: 'Error al duplicar factura' });
  }
});

router.delete('/:id(\d+)', async (req, res) => {
  try {
    await prisma.invoice.delete({ where: { id: parseInt(req.params.id, 10) } });
    res.json({ message: 'Factura eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar factura' });
  }
});

module.exports = router;
