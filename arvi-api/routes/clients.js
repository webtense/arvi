const { Router } = require('express');
const { prisma } = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const messages = require('../lib/errors');

const router = Router();

router.use(authMiddleware);

// GET /api/clients - List all clients (with optional search and pagination)
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

// GET /api/clients/:id - Get single client with invoices
router.get('/:id', async (req, res, next) => {
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

// POST /api/clients - Create new client
router.post('/', async (req, res, next) => {
  try {
    const { name, cif, email, phone, address, iban, contactPerson, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: messages.CLIENT_NAME_REQUIRED });
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
    
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
});

// PUT /api/clients/:id - Update client
router.put('/:id', async (req, res, next) => {
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
router.delete('/:id', async (req, res, next) => {
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