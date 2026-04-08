const messages = require('./errors');

const validateEmail = (email) => {
  if (!email) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : messages.FIELD_INVALID('email');
};

const validatePhone = (phone) => {
  if (!phone) return null;
  const phoneRegex = /^[+]?[\d\s()-]{9,}$/;
  return phoneRegex.test(phone.replace(/\s/g, '')) ? null : messages.FIELD_INVALID('teléfono');
};

const validateCifNif = (cif) => {
  if (!cif) return null;
  const cifRegex = /^[A-Z0-9][0-9]{7}[A-Z0-9]$/i;
  const nifRegex = /^[0-9]{8}[A-Z]$/i;
  return (cifRegex.test(cif) || nifRegex.test(cif)) ? null : messages.FIELD_INVALID('CIF/NIF');
};

const validateIban = (iban) => {
  if (!iban) return null;
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/;
  return ibanRegex.test(cleanIban) ? null : messages.FIELD_INVALID('IBAN');
};

const validatePositiveNumber = (value, field) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) {
    return messages.FIELD_INVALID(field);
  }
  return null;
};

const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

const validateRequired = (obj, fields) => {
  const missing = [];
  fields.forEach(field => {
    if (!obj[field]) {
      missing.push(field);
    }
  });
  return missing.length > 0 ? messages.FIELD_REQUIRED(missing.join(', ')) : null;
};

module.exports = {
  validateEmail,
  validatePhone,
  validateCifNif,
  validateIban,
  validatePositiveNumber,
  sanitizeString,
  validateRequired
};