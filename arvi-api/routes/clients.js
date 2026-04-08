const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');

const router = Router();
const prisma = new PrismaClient();

// GET /api/clients - List all clients (with optional search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const where = search 
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { cif: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {};
    
    const clients = await prisma.client.findMany({
      where,
      orderBy: { name: 'asc' }
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// GET /api/clients/:id - Get single client with invoices
router.get('/:id', async (req, res) => {
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
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

// POST /api/clients - Create new client
router.post('/', async (req, res) => {
  try {
    const { name, cif, email, phone, address, iban, contactPerson, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    // Check if CIF already exists
    if (cif) {
      const existing = await prisma.client.findUnique({
        where: { cif }
      });
      if (existing) {
        return res.status(400).json({ error: 'Ya existe un cliente con este CIF' });
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
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// PUT /api/clients/:id - Update client
router.put('/:id', async (req, res) => {
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
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// DELETE /api/clients/:id - Delete client
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if client has invoices
    const invoiceCount = await prisma.invoice.count({
      where: { client: { id: parseInt(id) } }
    });
    
    if (invoiceCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el cliente porque tiene facturas asociadas' 
      });
    }
    
    await prisma.client.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

module.exports = router;