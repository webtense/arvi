const { Router } = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const { sanitizeString, validateEmail, validatePhone } = require('../lib/validation');

const router = Router();
const authorizeRoles = authMiddleware.authorizeRoles;

const messagesFile = path.join(__dirname, '..', 'storage', 'contact-messages.json');

const ensureMessagesFile = () => {
  if (!fs.existsSync(path.dirname(messagesFile))) {
    fs.mkdirSync(path.dirname(messagesFile), { recursive: true });
  }
  if (!fs.existsSync(messagesFile)) {
    fs.writeFileSync(messagesFile, JSON.stringify([], null, 2));
  }
};

const readMessages = () => {
  ensureMessagesFile();
  const raw = fs.readFileSync(messagesFile, 'utf8');
  return JSON.parse(raw);
};

const writeMessages = (messages) => {
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
};

router.post('/', async (req, res, next) => {
  try {
    const name = sanitizeString(req.body.name);
    const email = sanitizeString(req.body.email);
    const phone = sanitizeString(req.body.phone || '');
    const subject = sanitizeString(req.body.subject || 'Solicitud de presupuesto');
    const message = sanitizeString(req.body.message);
    const service = sanitizeString(req.body.service || 'general');

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nombre, email y mensaje son obligatorios' });
    }

    const emailError = validateEmail(email);
    if (emailError) return res.status(400).json({ error: emailError });

    const phoneError = validatePhone(phone);
    if (phoneError) return res.status(400).json({ error: phoneError });

    const newMessage = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      name,
      email,
      phone,
      subject,
      message,
      service,
      status: 'new'
    };

    const messages = readMessages();
    messages.unshift(newMessage);
    writeMessages(messages);

    res.status(201).json({
      success: true,
      message: 'Tu solicitud ha sido recibida. Te contactaremos pronto.',
      id: newMessage.id
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', authMiddleware, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const messages = readMessages();
    res.json({ data: messages, total: messages.length });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/read', authMiddleware, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const messages = readMessages();
    const index = messages.findIndex((entry) => entry.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    messages[index].status = 'read';
    messages[index].readAt = new Date().toISOString();
    writeMessages(messages);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
