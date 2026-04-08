const { Router } = require('express');
const { prisma } = require('../lib/prisma');
const fs = require('fs');
const path = require('path');

const router = Router();

const messagesFile = path.join(__dirname, '..', 'storage', 'contact-messages.json');

const ensureMessagesFile = () => {
  if (!fs.existsSync(path.dirname(messagesFile))) {
    fs.mkdirSync(path.dirname(messagesFile), { recursive: true });
  }
  if (!fs.existsSync(messagesFile)) {
    fs.writeFileSync(messagesFile, JSON.stringify([], null, 2));
  }
};

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, service } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nombre, email y mensaje son obligatorios' });
    }

    const newMessage = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      name,
      email,
      phone: phone || '',
      subject: subject || 'Solicitud de presupuesto',
      message,
      service: service || 'general',
      status: 'new'
    };

    ensureMessagesFile();
    const messages = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
    messages.unshift(newMessage);
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));

    console.log(`📧 Nuevo mensaje de contacto: ${name} (${email})`);
    console.log(`   Asunto: ${subject || 'Solicitud de presupuesto'}`);

    res.status(201).json({ 
      success: true, 
      message: 'Tu solicitud ha sido recibida. Te contactaremos pronto.',
      id: newMessage.id 
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Acceso no autorizado' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores' });
    }

    ensureMessagesFile();
    const messages = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
    
    res.json({ data: messages, total: messages.length });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Acceso no autorizado' });
    }

    ensureMessagesFile();
    const messages = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
    const index = messages.findIndex(m => m.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    messages[index].status = 'read';
    messages[index].readAt = new Date().toISOString();
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;