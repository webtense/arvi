const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Security middleware
const { helmetConfig, apiLimiter, authLimiter } = require('./middleware/security');
app.use(helmetConfig);

// CORS - configurable from environment
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting - global for API
app.use('/api', apiLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
  });
}

// Routes
const authRoutes = require('./routes/auth');
const invoicesRoutes = require('./routes/invoices');
const budgetsRoutes = require('./routes/budgets');
const partsRoutes = require('./routes/parts');
const assetsRoutes = require('./routes/assets');
const ticketsRoutes = require('./routes/tickets');
const projectsRoutes = require('./routes/projects');
const subcontractorsRoutes = require('./routes/subcontractors');
const clientsRoutes = require('./routes/clients');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// API Routes - auth uses specific limiter
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/parts', partsRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/subcontractors', subcontractorsRoutes);
app.use('/api/clients', clientsRoutes);

// Static files (uploads)
app.use('/api/storage', express.static(path.join(__dirname, 'storage')));

// Swagger documentation
const { swaggerDocs } = require('./lib/swagger');
if (process.env.NODE_ENV !== 'production') {
  swaggerDocs(app);
}

// Error handling
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║         ARVI API v2.0.0                    ║
║         Port: ${PORT}                        ║
║         Environment: ${process.env.NODE_ENV || 'development'}            ║
╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;