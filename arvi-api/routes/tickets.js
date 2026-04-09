const { Router } = require('express');
const { prisma } = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = Router();
const authorizeRoles = authMiddleware.authorizeRoles;
const storageDir = path.join(__dirname, '..', 'storage');
const ticketDir = path.join(storageDir, 'tickets');
const closeDir = path.join(storageDir, 'monthly-close');

if (!fs.existsSync(ticketDir)) fs.mkdirSync(ticketDir, { recursive: true });
if (!fs.existsSync(closeDir)) fs.mkdirSync(closeDir, { recursive: true });

router.use(authMiddleware, authorizeRoles('admin'));

const detectCategory = (text = '') => {
  const lowerText = text.toLowerCase();
  if (/gasoil|diesel|gasolina|repsol|cepsa|bp|shell/.test(lowerText)) return 'gasolina';
  if (/restaurante|menu|cafe|cafeteria|comida|cena|bar|poke|burger|pizza/.test(lowerText)) return 'restauracion';
  if (/amazon|carrefour|mercadona|ferreteria|leroy|bauhaus|ikea|compra|super/.test(lowerText)) return 'compras';
  return 'otros';
};

const saveImageFromDataUrl = (dataUrl, filenamePrefix) => {
  const match = (dataUrl || '').match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1];
  const b64 = match[2];
  const ext = mime.includes('png') ? 'png' : 'jpg';
  const fileName = `${filenamePrefix}.${ext}`;
  const filePath = path.join(ticketDir, fileName);
  fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
  return `/api/tickets/download/${fileName}`;
};

router.get('/', async (req, res, next) => {
  try {
    const { category, status, projectId, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (projectId) where.projectId = parseInt(projectId);

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: { project: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.ticket.count({ where })
    ]);

    res.json({
      data: tickets,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = { ...req.body };
    const scanText = payload.description || '';
    if (!payload.category) {
      payload.category = detectCategory(scanText);
    }
    if (payload.imageData) {
      payload.imageUrl = saveImageFromDataUrl(payload.imageData, `ticket-${Date.now()}`);
      delete payload.imageData;
    }

    const ticket = await prisma.ticket.create({
      data: payload
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear ticket' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.imageData) {
      payload.imageUrl = saveImageFromDataUrl(payload.imageData, `ticket-${id}-${Date.now()}`);
      delete payload.imageData;
    }

    const ticket = await prisma.ticket.update({
      where: { id: parseInt(id) },
      data: payload
    });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar ticket' });
  }
});

router.post('/assign-project', async (req, res) => {
  try {
    const { ticketIds = [], projectId } = req.body;
    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({ error: 'Debes indicar tickets para asignar' });
    }

    await prisma.ticket.updateMany({
      where: { id: { in: ticketIds.map((id) => parseInt(id, 10)).filter(Boolean) } },
      data: { projectId: projectId ? parseInt(projectId, 10) : null },
    });

    res.json({ success: true, updated: ticketIds.length });
  } catch (error) {
    res.status(500).json({ error: 'Error al asignar proyecto a tickets' });
  }
});

router.post('/ocr-hints', async (req, res) => {
  try {
    const rawText = String(req.body.text || '').replace(/\s+/g, ' ').trim();
    if (!rawText) return res.status(400).json({ error: 'Texto OCR vacio' });

    const amountMatch = rawText.match(/(\d+[,.]\d{2})\s?(€|eur|euro)/i) || rawText.match(/total\s*[:]?\s*(\d+[,.]\d{2})/i);
    const dateMatch = rawText.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/);
    const vendor = rawText.split(' ').slice(0, 6).join(' ').substring(0, 90);
    const amount = amountMatch ? Number(amountMatch[1].replace(',', '.')) : null;

    res.json({
      vendor,
      amount,
      date: dateMatch ? dateMatch[1] : null,
      category: detectCategory(rawText),
      confidence: {
        amount: amount ? 0.8 : 0.2,
        date: dateMatch ? 0.75 : 0.2,
      },
      sourceText: rawText,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error procesando OCR' });
  }
});

router.get('/download/:file', async (req, res) => {
  try {
    const { file } = req.params;
    const fullPath = path.join(ticketDir, path.basename(file));
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    res.download(fullPath);
  } catch (error) {
    res.status(500).json({ error: 'Error al descargar ticket' });
  }
});

router.post('/close-month/:year/:month', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const tickets = await prisma.ticket.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: 'asc' }
    });

    const targetDir = path.join(closeDir, `${year}-${String(month).padStart(2, '0')}`);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const referencePdfPath = path.join(targetDir, 'referencia.pdf');
    const monthTag = `${year}-${String(month).padStart(2, '0')}`;
    const flatPdfName = `${monthTag}-referencia.pdf`;
    const flatPdfPath = path.join(closeDir, flatPdfName);
    const refContent = `%PDF-1.4\n1 0 obj<<>>endobj\n2 0 obj<</Length 120>>stream\nBT /F1 12 Tf 72 760 Td (Cierre mensual ${year}-${String(month).padStart(2, '0')}) Tj ET\nendstream\nendobj\n3 0 obj<</Type /Page /Parent 4 0 R /Contents 2 0 R>>endobj\n4 0 obj<</Type /Pages /Count 1 /Kids [3 0 R]>>endobj\n5 0 obj<</Type /Catalog /Pages 4 0 R>>endobj\nxref\n0 6\n0000000000 65535 f\n0000000010 00000 n\n0000000030 00000 n\n0000000230 00000 n\n0000000290 00000 n\n0000000350 00000 n\ntrailer<</Root 5 0 R /Size 6>>\nstartxref\n410\n%%EOF`;
    fs.writeFileSync(referencePdfPath, refContent);
    fs.writeFileSync(flatPdfPath, refContent);

    const manifestPath = path.join(targetDir, 'tickets.json');
    fs.writeFileSync(manifestPath, JSON.stringify(tickets, null, 2));

    const zipPath = path.join(closeDir, `${monthTag}.zip`);
    execFile('zip', ['-j', zipPath, referencePdfPath, manifestPath], async (zipErr) => {
      const totalAmount = tickets.reduce((sum, t) => sum + (t.amount || 0), 0);
      const closeData = {
        year,
        month,
        ticketCount: tickets.length,
        totalAmount,
        pdfUrl: `/api/tickets/close-download/${flatPdfName}`,
        zipUrl: zipErr ? null : `/api/tickets/close-download/${monthTag}.zip`,
        status: zipErr ? 'ready_no_zip' : 'ready'
      };

      const existing = await prisma.monthlyClose.findFirst({ where: { year, month } });
      if (existing) {
        await prisma.monthlyClose.update({ where: { id: existing.id }, data: closeData });
      } else {
        await prisma.monthlyClose.create({ data: closeData });
      }

      res.json({
        message: 'Cierre mensual generado',
        ...closeData
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al cerrar mes' });
  }
});

router.get('/close-download/:file', async (req, res) => {
  try {
    const { file } = req.params;
    const base = path.basename(file);
    const fullPath = path.join(closeDir, base);
    if (fs.existsSync(fullPath)) {
      return res.download(fullPath);
    }
    return res.status(404).json({ error: 'Archivo no encontrado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al descargar cierre' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.ticket.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Ticket eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar ticket' });
  }
});

module.exports = router;
