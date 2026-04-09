const { Router } = require('express');
const { prisma } = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const { sanitizeString } = require('../lib/validation');

const router = Router();
const authorizeRoles = authMiddleware.authorizeRoles;

const assignmentsFile = path.join(__dirname, '..', 'storage', 'subcontractor-assignments.json');
if (!fs.existsSync(path.dirname(assignmentsFile))) fs.mkdirSync(path.dirname(assignmentsFile), { recursive: true });
if (!fs.existsSync(assignmentsFile)) fs.writeFileSync(assignmentsFile, JSON.stringify([], null, 2));
const readAssignments = () => JSON.parse(fs.readFileSync(assignmentsFile, 'utf8'));
const writeAssignments = (rows) => fs.writeFileSync(assignmentsFile, JSON.stringify(rows, null, 2));

router.use(authMiddleware, authorizeRoles('admin'));

router.get('/', async (req, res, next) => {
  try {
    const { status, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) where.status = status;

    const [subcontractors, total] = await Promise.all([
      prisma.subcontractor.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limitNum
      }),
      prisma.subcontractor.count({ where })
    ]);

    const assignments = readAssignments();
    const enriched = subcontractors.map((sub) => {
      const related = assignments.filter((a) => a.subcontractorId === sub.id);
      const totalInvoiced = related.reduce((sum, item) => sum + Number(item.invoiceAmount || 0), 0);
      const projectCount = new Set(related.map((r) => r.projectId).filter(Boolean)).size;
      return { ...sub, totalInvoiced, projectCount };
    });

    res.json({
      data: enriched,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subcontractor = await prisma.subcontractor.findUnique({
      where: { id: parseInt(id) }
    });
    if (!subcontractor) {
      return res.status(404).json({ error: 'Subcontrata no encontrada' });
    }
    const assignments = readAssignments().filter((a) => a.subcontractorId === parseInt(id));
    res.json({ ...subcontractor, assignments });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener subcontrata' });
  }
});

router.post('/:id/assignments', async (req, res) => {
  try {
    const subcontractorId = parseInt(req.params.id, 10);
    const { projectId, cost = 0, invoiceAmount = 0, notes = '' } = req.body;

    const rows = readAssignments();
    const entry = {
      id: Date.now().toString(),
      subcontractorId,
      projectId: projectId ? parseInt(projectId, 10) : null,
      cost: Number(cost),
      invoiceAmount: Number(invoiceAmount),
      notes: sanitizeString(notes),
      createdAt: new Date().toISOString(),
    };
    rows.unshift(entry);
    writeAssignments(rows);
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Error al asignar subcontrata al proyecto' });
  }
});

router.post('/', async (req, res) => {
  try {
    const subcontractor = await prisma.subcontractor.create({
      data: req.body
    });
    res.status(201).json(subcontractor);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear subcontrata' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subcontractor = await prisma.subcontractor.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(subcontractor);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar subcontrata' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.subcontractor.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Subcontrata eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar subcontrata' });
  }
});

module.exports = router;
