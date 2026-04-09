const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { prisma } = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const messages = require('../lib/errors');
const { sanitizeString, validateEmail } = require('../lib/validation');

const router = Router();
const resetRequestsFile = path.join(__dirname, '..', 'storage', 'password-reset-requests.json');

const ensureResetRequestsFile = () => {
  if (!fs.existsSync(path.dirname(resetRequestsFile))) {
    fs.mkdirSync(path.dirname(resetRequestsFile), { recursive: true });
  }

  if (!fs.existsSync(resetRequestsFile)) {
    fs.writeFileSync(resetRequestsFile, JSON.stringify([], null, 2));
  }
};

const readResetRequests = () => {
  ensureResetRequestsFile();
  return JSON.parse(fs.readFileSync(resetRequestsFile, 'utf8'));
};

const writeResetRequests = (requests) => {
  fs.writeFileSync(resetRequestsFile, JSON.stringify(requests, null, 2));
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: messages.FIELD_REQUIRED('username y password') });
    }
    
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: messages.AUTH_INVALID_CREDENTIALS });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: messages.AUTH_INVALID_CREDENTIALS });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: messages.FIELD_REQUIRED('username y password') });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: messages.AUTH_WEAK_PASSWORD });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ error: messages.AUTH_USER_ALREADY_EXISTS });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        role: 'client'
      }
    });

    res.status(201).json({ message: 'Usuario creado correctamente', userId: user.id });
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const identifier = sanitizeString(req.body.identifier).toLowerCase();

    if (!identifier) {
      return res.status(400).json({ error: messages.FIELD_REQUIRED('usuario o email') });
    }

    if (identifier.includes('@')) {
      const emailError = validateEmail(identifier);
      if (emailError) {
        return res.status(400).json({ error: emailError });
      }
    }

    let user = null;
    if (identifier.includes('@')) {
      user = await prisma.user.findFirst({ where: { email: identifier } });
    } else {
      user = await prisma.user.findUnique({ where: { username: identifier } });
    }

    if (user) {
      const requests = readResetRequests();
      requests.unshift({
        id: Date.now().toString(),
        requestedAt: new Date().toISOString(),
        userId: user.id,
        username: user.username,
        email: user.email,
        status: 'pending'
      });
      writeResetRequests(requests);
    }

    return res.json({
      success: true,
      message: 'Si los datos son correctos, recibiras instrucciones de recuperacion pronto.'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: messages.AUTH_USER_NOT_FOUND });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
