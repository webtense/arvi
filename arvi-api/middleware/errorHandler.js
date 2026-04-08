const messages = require('./errors');

const errorHandler = (err, req, res, next) => {
  // Log del error
  console.error({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Errores de Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Ya existe un registro con estos datos' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: messages.NOT_FOUND });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: messages.AUTH_TOKEN_INVALID });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expirado' });
  }

  // Errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: messages.VALIDATION_ERROR,
      details: err.details 
    });
  }

  // Error por defecto
  const statusCode = err.statusCode || 500;
  const message = err.message || messages.SERVER_ERROR;

  res.status(statusCode).json({ 
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ error: messages.NOT_FOUND });
};

module.exports = { errorHandler, notFoundHandler };