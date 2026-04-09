const { Router } = require('express');
const path = require('path');
const { prisma } = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const { sanitizeString, validateEmail } = require('../lib/validation');
const { generatePartPdf } = require('../lib/pdf');
const { sendMail } = require('../lib/mailer');

const router = Router();
const authorizeRoles = authMiddleware.authorizeRoles;

router.use(authMiddleware, authorizeRoles('admin'));

const calcTotals = (partData) => {
  const laborCost = Number(partData.laborCost || 0);
  const base = Number(partData.serviceFee || 0) + Number(partData.materialCost || 0) + laborCost;
  const taxRate = Number(partData.taxRate || 21);
  const withTax = base + base * (taxRate / 100);
  return {
    totalBase: Number(base.toFixed(2)),
    totalWithTax: Number(withTax.toFixed(2)),
  };
};

router.get('/', async (req, res, next) => {
  try {
    const { status, clientName, projectId, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) where.status = status;
    if (clientName) where.client = { contains: clientName, mode: 'insensitive' };
    if (projectId) where.projectId = parseInt(projectId, 10);

    const [parts, total] = await Promise.all([
      prisma.part.findMany({
        where,
        include: { items: true, project: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.part.count({ where }),
    ]);

    res.json({
      data: parts,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { items = [], ...partData } = req.body;
    const year = new Date().getFullYear();
    const count = await prisma.part.count({ where: { partNumber: { startsWith: `PT-${year}-` } } });

    const part = await prisma.part.create({
      data: {
        projectId: partData.projectId ? parseInt(partData.projectId, 10) : null,
        client: sanitizeString(partData.client),
        work: sanitizeString(partData.work),
        status: partData.status || 'open',
        partNumber: partData.partNumber || `PT-${year}-${String(count + 1).padStart(4, '0')}`,
        date: partData.date ? new Date(partData.date) : new Date(),
        startTime: partData.startTime || null,
        endTime: partData.endTime || null,
        technicians: Number(partData.technicians || 1),
        hours: partData.hours !== undefined ? Number(partData.hours) : null,
        materialCost: partData.materialCost !== undefined ? Number(partData.materialCost) : null,
        serviceFee: partData.serviceFee !== undefined ? Number(partData.serviceFee) : null,
        items: {
          create: items.map((item) => ({
            material: sanitizeString(item.material || item.description || 'Material'),
            quantity: Number(item.quantity || 1),
            unit: sanitizeString(item.unit || 'ud'),
            unitPrice: Number(item.unitPrice || 0),
            total: Number(item.total || (item.unitPrice || 0) * (item.quantity || 1)),
          })),
        },
      },
      include: { items: true, project: true },
    });

    res.status(201).json(part);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items, ...partData } = req.body;
    const numericId = parseInt(id, 10);
    if (items) {
      await prisma.partItem.deleteMany({ where: { partId: numericId } });
    }

    const part = await prisma.part.update({
      where: { id: numericId },
      data: {
        ...(partData.projectId !== undefined ? { projectId: partData.projectId ? parseInt(partData.projectId, 10) : null } : {}),
        ...(partData.startTime !== undefined ? { startTime: partData.startTime || null } : {}),
        ...(partData.endTime !== undefined ? { endTime: partData.endTime || null } : {}),
        ...(partData.technicians !== undefined ? { technicians: Number(partData.technicians || 1) } : {}),
        ...(partData.hours !== undefined ? { hours: partData.hours === null ? null : Number(partData.hours) } : {}),
        ...(partData.materialCost !== undefined ? { materialCost: partData.materialCost === null ? null : Number(partData.materialCost) } : {}),
        ...(partData.serviceFee !== undefined ? { serviceFee: partData.serviceFee === null ? null : Number(partData.serviceFee) } : {}),
        ...(partData.client ? { client: sanitizeString(partData.client) } : {}),
        ...(partData.work ? { work: sanitizeString(partData.work) } : {}),
        ...(partData.status ? { status: partData.status } : {}),
        ...(items
          ? {
              items: {
                create: items.map((item) => ({
                  material: sanitizeString(item.material || item.description || 'Material'),
                  quantity: Number(item.quantity || 1),
                  unit: sanitizeString(item.unit || 'ud'),
                  unitPrice: Number(item.unitPrice || 0),
                  total: Number(item.total || (item.unitPrice || 0) * (item.quantity || 1)),
                })),
              },
            }
          : {}),
      },
      include: { items: true, project: true },
    });

    res.json(part);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/complete', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { workDone, signatureImage, clientEmail } = req.body;

    if (!signatureImage) {
      return res.status(400).json({ error: 'La firma del cliente es obligatoria para cerrar el parte' });
    }

    if (!clientEmail) {
      return res.status(400).json({ error: 'El email del cliente es obligatorio para enviar el parte' });
    }

    const emailError = validateEmail(clientEmail);
    if (emailError) {
      return res.status(400).json({ error: emailError });
    }

    const part = await prisma.part.update({
      where: { id },
      data: {
        status: 'signed',
        signatureImage,
        clientSignature: JSON.stringify({
          email: clientEmail.toLowerCase(),
          workDone: sanitizeString(workDone),
        }),
        signedAt: new Date(),
      },
      include: { items: true, project: true },
    });

    const totals = calcTotals({
      serviceFee: part.serviceFee,
      materialCost: part.materialCost,
      laborCost: Number(part.hours || 0) * Number(process.env.TECH_HOUR_RATE || 45),
      taxRate: 21,
    });

    const pdfPath = await generatePartPdf(part, path.join(__dirname, '..', 'storage', 'parts-pdf'));

    const to = [part.clientEmail, process.env.ADMIN_EMAIL || 'info@arvimanteniment.com'].filter(Boolean).join(',');

    await sendMail({
      to,
      subject: `Parte ${part.partNumber} firmado - ${part.client}`,
      text: `Adjuntamos parte firmado por cliente. Numero: ${part.partNumber}`,
      attachments: [{ filename: `${part.partNumber}.pdf`, path: pdfPath }],
    });

    res.json({ success: true, part: { ...part, ...totals }, pdfPath: `/api/storage/parts-pdf/${path.basename(pdfPath)}` });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.part.delete({ where: { id: parseInt(id, 10) } });
    res.json({ message: 'Parte eliminado' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
