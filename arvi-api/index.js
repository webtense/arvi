const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('./routes/auth');
const invoicesRoutes = require('./routes/invoices');
const budgetsRoutes = require('./routes/budgets');
const partsRoutes = require('./routes/parts');
const assetsRoutes = require('./routes/assets');
const ticketsRoutes = require('./routes/tickets');
const projectsRoutes = require('./routes/projects');
const subcontractorsRoutes = require('./routes/subcontractors');
const clientsRoutes = require('./routes/clients');

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/parts', partsRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/subcontractors', subcontractorsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/storage', express.static(path.join(__dirname, 'storage')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ARVI API running on port ${PORT}`);
});
