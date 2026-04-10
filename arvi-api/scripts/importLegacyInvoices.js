const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const prisma = new PrismaClient();

const FACTURAS_ROOT = path.resolve(__dirname, '../../Facturas ');
const TARGET_FOLDERS = [
  { label: 'FACT_Enero', relative: 'arvi/FACT_Enero' },
  { label: 'FACT_Feb', relative: 'arvi/FACT_Feb' },
  { label: 'Datos_cliente', relative: 'arvi/Datos_cliente' }
];

const SUPPORTED_EXTENSIONS = new Set(['.pdf']);

const padSeq = (value) => value.toString().padStart(3, '0');

const parseYearSuffix = (rawYear) => {
  if (!rawYear) return null;
  const numeric = parseInt(rawYear, 10);
  if (!Number.isFinite(numeric)) return null;
  if (rawYear.length === 4) return numeric;
  if (numeric < 100) return 2000 + numeric;
  if (numeric < 1000) return 2000 + numeric;
  return numeric;
};

const deriveInvoiceNumber = (filename) => {
  const name = filename.replace(/\s+/g, ' ').trim();
  const lower = name.toLowerCase();

  if (!/fra|inv|fv/.test(lower)) return null;

  const fraDual = name.match(/fra[\s_-]*(\d{1,4})[._-](\d{2,4})/i);
  if (fraDual) {
    const seq = parseInt(fraDual[1], 10);
    const year = parseYearSuffix(fraDual[2]);
    if (Number.isFinite(seq) && year) {
      return `${year}/${padSeq(seq)}`;
    }
  }

  const fraYearFirst = name.match(/fra[\s_-]?(\d{4})[\s_-]?(\d{1,4})/i);
  if (fraYearFirst) {
    const year = parseInt(fraYearFirst[1], 10);
    const seq = parseInt(fraYearFirst[2], 10);
    if (Number.isFinite(seq) && Number.isFinite(year)) {
      return `${year}/${padSeq(seq)}`;
    }
  }

  const invPattern = name.match(/inv[\s_-]?(\d{4})(\d{3,6})/i);
  if (invPattern) {
    const year = parseInt(invPattern[1], 10);
    const seq = parseInt(invPattern[2], 10);
    if (Number.isFinite(seq) && Number.isFinite(year)) {
      return `${year}/${padSeq(seq)}`;
    }
  }

  const fvPattern = name.match(/fv[\s_-]?(\d{4})[\s_-]?(\d{1,4})/i);
  if (fvPattern) {
    const year = parseInt(fvPattern[1], 10);
    const seq = parseInt(fvPattern[2], 10);
    if (Number.isFinite(seq) && Number.isFinite(year)) {
      return `${year}/${padSeq(seq)}`;
    }
  }

  return null;
};

const collectPdfFiles = async () => {
  const results = [];
  for (const target of TARGET_FOLDERS) {
    const dirPath = path.join(FACTURAS_ROOT, target.relative);
    if (!fs.existsSync(dirPath)) {
      continue;
    }
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!SUPPORTED_EXTENSIONS.has(ext)) continue;
      results.push({
        folder: target.label,
        filename: entry.name,
        absolutePath: path.join(dirPath, entry.name),
        relativePath: path.join(target.relative, entry.name),
        invoiceNumber: deriveInvoiceNumber(entry.name),
      });
    }
  }
  return results;
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (prompt, defaultValue = '') => new Promise((resolve) => {
  const suffix = defaultValue ? ` [${defaultValue}]` : '';
  rl.question(`${prompt}${suffix}: `, (answer) => {
    resolve(answer && answer.trim() ? answer.trim() : defaultValue);
  });
});

const askNumber = async (prompt, defaultValue = '') => {
  while (true) {
    const answer = await ask(prompt, defaultValue);
    const numeric = parseFloat(answer.replace(',', '.'));
    if (Number.isFinite(numeric)) return numeric;
    console.log('Introduce un número válido (usa punto o coma).');
  }
};

const askDateValue = async (prompt, defaultValue = '') => {
  while (true) {
    const value = await ask(prompt, defaultValue);
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
    console.log('Introduce una fecha válida (YYYY-MM-DD).');
  }
};

const findClientSuggestions = async (name) => {
  if (!name) return [];
  return prisma.client.findMany({
    where: { name: { contains: name, mode: 'insensitive' } },
    take: 5,
    orderBy: { name: 'asc' },
  });
};

const createInvoice = async (record) => {
  const defaultClientName = record.filename
    .replace(/Fra\s*\d+[._-]\d+\s*/i, '')
    .replace(/\.pdf$/i, '')
    .trim();
  const defaultYear = record.invoiceNumber ? record.invoiceNumber.slice(0, 4) : '2017';
  const defaultDate = `${defaultYear}-01-01`;

  console.log('\n---------------------------');
  console.log(`Archivo: ${record.relativePath}`);
  console.log(`Número sugerido: ${record.invoiceNumber || 'N/A'}`);

  const shouldProcess = await ask('¿Importar esta factura? (s/N)', 's');
  if (!/^s/i.test(shouldProcess)) {
    console.log('Saltada.');
    return false;
  }

  const invoiceNumber = await ask('Número de factura', record.invoiceNumber || '');
  const dateValue = await askDateValue('Fecha (YYYY-MM-DD)', defaultDate);
  let dueDate = null;
  const dueDateValue = await ask('Fecha de vencimiento (opcional YYYY-MM-DD)', '');
  if (dueDateValue) {
    const parsed = new Date(dueDateValue);
    if (Number.isNaN(parsed.getTime())) {
      console.log('Vencimiento inválido, se omite.');
    } else {
      dueDate = parsed;
    }
  }
  const clientName = await ask('Nombre de cliente', defaultClientName || 'Cliente');

  const matches = await findClientSuggestions(clientName);
  if (matches.length > 0) {
    console.log('Coincidencias de cliente:');
    matches.forEach((client) => {
      console.log(`- ID ${client.id} · ${client.name} · ${client.cif || 'sin CIF'}`);
    });
  }
  const clientIdRaw = await ask('ID de cliente existente (enter si no aplica)', '');
  const clientId = clientIdRaw ? parseInt(clientIdRaw, 10) : null;

  const description = await ask('Descripción', `Importado desde ${record.relativePath}`);
  const itemDescription = await ask('Descripción de línea', 'Servicios facturados');
  const subtotal = await askNumber('Subtotal (sin IVA)', '0');
  const taxRate = await askNumber('IVA %', '21');
  const taxTotal = Number(((subtotal * taxRate) / 100).toFixed(2));
  const total = Number((subtotal + taxTotal).toFixed(2));

  const invoiceData = {
    invoiceNumber,
    date: dateValue,
    dueDate,
    clientName,
    clientId: Number.isFinite(clientId) ? clientId : null,
    description,
    notes: `Documento original: ${record.relativePath}`,
    status: 'finalized',
    type: 'definitive',
    subtotal,
    taxTotal,
    total,
    items: {
      create: [
        {
          description: itemDescription,
          quantity: 1,
          unit: 'ud',
          unitPrice: subtotal,
          tax: taxRate,
          total,
        },
      ],
    },
  };

  const created = await prisma.invoice.create({ data: invoiceData, include: { items: true } });
  console.log(`Factura ${created.invoiceNumber} creada con ID ${created.id}.`);
  return true;
};

const main = async () => {
  try {
    const pdfFiles = await collectPdfFiles();
    const existingInvoices = await prisma.invoice.findMany({ select: { invoiceNumber: true } });
    const existingSet = new Set(existingInvoices.map((inv) => inv.invoiceNumber));

    const pending = pdfFiles.filter((record) => record.invoiceNumber && !existingSet.has(record.invoiceNumber));

    if (pending.length === 0) {
      console.log('No hay facturas pendientes de importar.');
      return;
    }

    console.log(`Se han encontrado ${pending.length} facturas pendientes.`);

    for (const record of pending) {
      try {
        await createInvoice(record);
      } catch (error) {
        console.error(`Error importando ${record.filename}:`, error.message);
      }
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
};

main().catch((error) => {
  console.error('Fallo en la importación:', error);
  process.exit(1);
});
