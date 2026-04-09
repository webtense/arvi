const { Router } = require('express');
const { prisma } = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const messages = require('../lib/errors');
const { validateEmail, validatePhone, validateCifNif, validateIban, sanitizeString } = require('../lib/validation');
const fs = require('fs');
const path = require('path');

const router = Router();

router.use(authMiddleware);

const normalizeName = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Listar clientes
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, CIF o email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Client'
 *                 pagination:
 *                   type: object
 */
router.get('/', async (req, res, next) => {
  try {
    const { search, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const where = search 
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { cif: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {};

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limitNum
      }),
      prisma.client.count({ where })
    ]);

    res.json({
      data: clients,
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

router.get('/quality/duplicates', async (req, res, next) => {
  try {
    const clients = await prisma.client.findMany({ orderBy: { name: 'asc' } });

    const byCif = new Map();
    const byName = new Map();

    clients.forEach((client) => {
      if (client.cif) {
        const key = client.cif.toUpperCase().trim();
        if (!byCif.has(key)) byCif.set(key, []);
        byCif.get(key).push(client);
      }

      const n = normalizeName(client.name);
      if (n) {
        if (!byName.has(n)) byName.set(n, []);
        byName.get(n).push(client);
      }
    });

    const cifDuplicates = [...byCif.entries()]
      .filter(([, rows]) => rows.length > 1)
      .map(([cif, rows]) => ({ type: 'cif', key: cif, count: rows.length, clients: rows }));

    const nameDuplicates = [...byName.entries()]
      .filter(([, rows]) => rows.length > 1)
      .map(([nameKey, rows]) => ({ type: 'name', key: nameKey, count: rows.length, clients: rows }));

    res.json({
      totalClients: clients.length,
      duplicates: [...cifDuplicates, ...nameDuplicates],
      duplicateGroups: cifDuplicates.length + nameDuplicates.length,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/quality/reconcile', async (req, res, next) => {
  try {
    const clients = await prisma.client.findMany();
    const byId = new Map(clients.map((c) => [c.id, c]));
    const byCif = new Map();
    const byName = new Map();

    clients.forEach((client) => {
      if (client.cif) byCif.set(client.cif.toUpperCase().trim(), client);
      byName.set(normalizeName(client.name), client);
    });

    const invoices = await prisma.invoice.findMany();
    let updated = 0;
    const sample = [];

    for (const invoice of invoices) {
      let target = null;

      if (invoice.clientId && byId.has(invoice.clientId)) {
        continue;
      }

      if (invoice.clientCif) {
        target = byCif.get(invoice.clientCif.toUpperCase().trim()) || null;
      }

      if (!target && invoice.clientName) {
        target = byName.get(normalizeName(invoice.clientName)) || null;
      }

      if (target) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            clientId: target.id,
            clientName: target.name,
            clientCif: target.cif || invoice.clientCif,
            clientAddress: target.address || invoice.clientAddress,
          },
        });
        updated += 1;
        if (sample.length < 20) {
          sample.push({ invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber, clientId: target.id, clientName: target.name });
        }
      }
    }

    res.json({
      success: true,
      invoicesScanned: invoices.length,
      invoicesReconciled: updated,
      sample,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/clients/:id - Get single client with invoices
router.get('/:id(\\d+)', async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      where: { id: parseInt(id) },
      include: {
        invoices: {
          orderBy: { date: 'desc' },
          take: 10
        }
      }
    });
    
    if (!client) {
      return res.status(404).json({ error: messages.CLIENT_NOT_FOUND });
    }
    
    res.json(client);
  } catch (error) {
    next(error);
  }
});

router.get('/:id(\\d+)/ledger', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return res.status(404).json({ error: messages.CLIENT_NOT_FOUND });
    }

    const [invoices, budgets] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          OR: [
            { clientId: id },
            { clientName: { equals: client.name, mode: 'insensitive' } },
          ],
        },
        orderBy: { date: 'desc' },
      }),
      prisma.budget.findMany({
        where: { client: { equals: client.name, mode: 'insensitive' } },
        orderBy: { date: 'desc' },
      }),
    ]);

    const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
    const pendingAmount = invoices
      .filter((inv) => inv.paymentStatus !== 'paid')
      .reduce((sum, inv) => sum + Number(inv.total || 0), 0);

    res.json({
      client,
      totals: {
        totalInvoiced,
        pendingAmount,
        invoicesCount: invoices.length,
        budgetsCount: budgets.length,
      },
      invoices,
      budgets,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/import-facturas', async (req, res, next) => {
  try {
    const baseDir = process.env.FACTURAS_DIR || '/home/asanchez/Documentos/@PERSONAL/Proyectos/ARVI/Facturas ';
    if (!fs.existsSync(baseDir)) {
      return res.status(400).json({ error: `No existe el directorio de facturas: ${baseDir}` });
    }

    const files = [];
    const walk = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      entries.forEach((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(full);
        if (/\.(pdf|doc|docx|xls|xlsx)$/i.test(entry.name)) files.push(full);
      });
    };
    walk(baseDir);

    const importedClients = [];
    for (const filePath of files) {
      const baseName = path.basename(filePath, path.extname(filePath));
      const normalized = baseName.replace(/[_-]+/g, ' ').trim();
      const possibleCif = normalized.match(/\b[ABCDEFGHJKLMNPQRSUVW]\d{7}[0-9A-J]\b/i)?.[0] || null;
      const withoutFactura = normalized.replace(/factura|fra\.?/ig, '').trim();
      const clientName = withoutFactura
        .replace(/\b\d{2,6}[./-]?\d{0,4}\b/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim()
        .slice(0, 120);

      if (!clientName || clientName.length < 3) continue;

      let existing = await prisma.client.findFirst({
        where: {
          OR: [
            { name: { equals: clientName, mode: 'insensitive' } },
            ...(possibleCif ? [{ cif: possibleCif.toUpperCase() }] : []),
          ],
        },
      });

      if (!existing) {
        existing = await prisma.client.create({
          data: {
            name: clientName,
            cif: possibleCif ? possibleCif.toUpperCase() : null,
            notes: `Importado de historico local: ${filePath}`,
          },
        });
        importedClients.push(existing);
      }
    }

    res.json({
      scannedFiles: files.length,
      importedClients: importedClients.length,
      clients: importedClients,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/clients - Create new client
/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Crear cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               cif:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente creado
 *       400:
 *         description: Error de validación
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, cif, email, phone, address, iban, contactPerson, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: messages.CLIENT_NAME_REQUIRED });
    }

    const validationErrors = [];
    if (cif) {
      const cifError = validateCifNif(cif);
      if (cifError) validationErrors.push(cifError);
    }
    if (email) {
      const emailError = validateEmail(email);
      if (emailError) validationErrors.push(emailError);
    }
    if (phone) {
      const phoneError = validatePhone(phone);
      if (phoneError) validationErrors.push(phoneError);
    }
    if (iban) {
      const ibanError = validateIban(iban);
      if (ibanError) validationErrors.push(ibanError);
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(', ') });
    }
    
    if (cif) {
      const existing = await prisma.client.findUnique({
        where: { cif }
      });
      if (existing) {
        return res.status(400).json({ error: messages.CLIENT_CIF_EXISTS });
      }
    }
    
    const client = await prisma.client.create({
      data: {
        name: sanitizeString(name),
        cif: cif ? cif.toUpperCase() : null,
        email: email ? email.toLowerCase() : null,
        phone,
        address: sanitizeString(address),
        iban: iban ? iban.replace(/\s/g, '').toUpperCase() : null,
        contactPerson: sanitizeString(contactPerson),
        notes: sanitizeString(notes)
      }
    });
    
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
});

// PUT /api/clients/:id - Update client
router.put('/:id(\\d+)', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, cif, email, phone, address, iban, contactPerson, notes } = req.body;
    
    const client = await prisma.client.update({
      where: { id: parseInt(id) },
      data: {
        name,
        cif,
        email,
        phone,
        address,
        iban,
        contactPerson,
        notes
      }
    });
    
    res.json(client);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/clients/:id - Delete client
router.delete('/:id(\\d+)', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id);
    
    const invoiceCount = await prisma.invoice.count({
      where: { clientId: parsedId }
    });
    
    if (invoiceCount > 0) {
      return res.status(400).json({ error: messages.CLIENT_HAS_INVOICES });
    }
    
    await prisma.client.delete({
      where: { id: parsedId }
    });
    
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
