const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Security middleware
const { helmetConfig, apiLimiter, authLimiter, contactLimiter } = require('./middleware/security');
app.use(helmetConfig);

// CORS - configurable from environment
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['https://arvimanteniment.com', 'https://www.arvimanteniment.com', 'http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
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
const contactRoutes = require('./routes/contact');
const documentsRoutes = require('./routes/documents');

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
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/documents', documentsRoutes);

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
