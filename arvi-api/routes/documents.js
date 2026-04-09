const { Router } = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const { sanitizeString } = require('../lib/validation');

const router = Router();
const authorizeRoles = authMiddleware.authorizeRoles;

const docsDir = path.join(__dirname, '..', 'storage', 'documents');
const dbFile = path.join(__dirname, '..', 'storage', 'documents.json');

if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify([], null, 2));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, docsDir),
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}-${safe}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

const readDocs = () => JSON.parse(fs.readFileSync(dbFile, 'utf8'));
const writeDocs = (items) => fs.writeFileSync(dbFile, JSON.stringify(items, null, 2));

router.use(authMiddleware, authorizeRoles('admin'));

router.get('/', (req, res) => {
  const { projectId, clientId, search } = req.query;
  let docs = readDocs();

  if (projectId) docs = docs.filter((d) => String(d.projectId || '') === String(projectId));
  if (clientId) docs = docs.filter((d) => String(d.clientId || '') === String(clientId));
  if (search) {
    const q = String(search).toLowerCase();
    docs = docs.filter((d) => [d.title, d.tags, d.fileName].join(' ').toLowerCase().includes(q));
  }

  res.json({ data: docs, total: docs.length });
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });

  const docs = readDocs();
  const entry = {
    id: Date.now().toString(),
    title: sanitizeString(req.body.title || req.file.originalname),
    projectId: req.body.projectId ? parseInt(req.body.projectId, 10) : null,
    clientId: req.body.clientId ? parseInt(req.body.clientId, 10) : null,
    category: sanitizeString(req.body.category || 'general'),
    tags: sanitizeString(req.body.tags || ''),
    fileName: req.file.originalname,
    filePath: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    createdAt: new Date().toISOString(),
  };

  docs.unshift(entry);
  writeDocs(docs);
  res.status(201).json(entry);
});

router.get('/download/:id', (req, res) => {
  const docs = readDocs();
  const doc = docs.find((d) => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });
  const full = path.join(docsDir, doc.filePath);
  if (!fs.existsSync(full)) return res.status(404).json({ error: 'Archivo no disponible' });
  res.download(full, doc.fileName);
});

router.delete('/:id', (req, res) => {
  const docs = readDocs();
  const idx = docs.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Documento no encontrado' });
  const [doc] = docs.splice(idx, 1);
  writeDocs(docs);
  const full = path.join(docsDir, doc.filePath);
  if (fs.existsSync(full)) fs.unlinkSync(full);
  res.json({ success: true });
});

module.exports = router;
