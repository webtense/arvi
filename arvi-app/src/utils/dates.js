const pad = (value) => value.toString().padStart(2, '0');

export const formatDate = (input, fallback = '') => {
  if (!input) return fallback;
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return fallback;
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  return `${day}/${month}/${date.getFullYear()}`;
};

export const parseDateInput = (value) => {
  if (typeof value !== 'string') return '';
  const cleaned = value.replace(/[.\-]/g, '/').replace(/\s+/g, '');
  if (!cleaned) return '';
  const parts = cleaned.split('/');
  if (parts.length !== 3) return '';
  const [dayStr, monthStr, yearStr] = parts;
  if (yearStr.length !== 4) return '';
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return '';
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return '';
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return '';
  return date.toISOString().split('T')[0];
};

export const getTodayISO = () => new Date().toISOString().split('T')[0];
