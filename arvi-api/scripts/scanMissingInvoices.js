const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const FACTURAS_ROOT = path.resolve(__dirname, '../../Facturas ');

const TARGET_FOLDERS = [
  { label: 'FACT_Enero', relative: 'arvi/FACT_Enero' },
  { label: 'FACT_Feb', relative: 'arvi/FACT_Feb' },
  { label: 'Datos_cliente', relative: 'arvi/Datos_cliente' }
];

const SUPPORTED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.odt', '.rtf']);

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

  if (!/fra|inv|fv|fact|rep/.test(lower)) return null;

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

  const genericYearSeq = name.match(/(\d{4})[^\d]{0,2}(\d{1,4})/);
  if (genericYearSeq) {
    const year = parseInt(genericYearSeq[1], 10);
    const seq = parseInt(genericYearSeq[2], 10);
    if (Number.isFinite(seq) && Number.isFinite(year) && year >= 2000 && year <= 2100) {
      return `${year}/${padSeq(seq)}`;
    }
  }

  return null;
};

const collectFiles = async () => {
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
      if (ext && !SUPPORTED_EXTENSIONS.has(ext)) continue;
      results.push({
        folder: target.label,
        filename: entry.name,
        relativePath: path.join(target.relative, entry.name),
        invoiceNumber: deriveInvoiceNumber(entry.name),
      });
    }
  }
  return results;
};

const buildMarkdown = (missing, unknown, totals) => {
  const lines = [];
  lines.push('# Facturas pendientes de importar');
  lines.push('');
  lines.push(`Generado el ${new Date().toLocaleString('es-ES')}.`);
  lines.push('');
  lines.push('## Resumen');
  lines.push(`- Archivos analizados: **${totals.totalFiles}**`);
  lines.push(`- Con número reconocible: **${totals.recognized}**`);
  lines.push(`- Facturas reconocidas que no están en la BBDD: **${missing.length}**`);
  lines.push(`- Archivos sin patrón identificable: **${unknown.length}**`);
  lines.push('');

  if (missing.length > 0) {
    lines.push('## Facturas con número válido que faltan en la BBDD');
    lines.push('| Carpeta | Archivo | Número |');
    lines.push('| --- | --- | --- |');
    missing.forEach((item) => {
      lines.push(`| ${item.folder} | ${item.filename} | ${item.invoiceNumber} |`);
    });
    lines.push('');
  } else {
    lines.push('No se detectaron facturas reconocibles pendientes de importar.');
    lines.push('');
  }

  if (unknown.length > 0) {
    lines.push('## Archivos que necesitan revisión manual');
    lines.push('| Carpeta | Archivo | Motivo |');
    lines.push('| --- | --- | --- |');
    unknown.forEach((item) => {
      const reason = item.invoiceNumber ? 'Formato duplicado' : 'No se detectó número en el nombre';
      lines.push(`| ${item.folder} | ${item.filename} | ${reason} |`);
    });
    lines.push('');
  }

  return lines.join('\n');
};

const numbersCachePath = path.resolve(__dirname, '../../DOC/invoice_numbers.txt');

const loadExistingNumbers = async () => {
  if (fs.existsSync(numbersCachePath)) {
    const content = await fs.promises.readFile(numbersCachePath, 'utf8');
    const numbers = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    return new Set(numbers);
  }

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const existingInvoices = await prisma.invoice.findMany({
      select: { invoiceNumber: true }
    });
    return new Set(
      existingInvoices
        .map((inv) => (inv.invoiceNumber || '').trim())
        .filter(Boolean)
    );
  } catch (error) {
    console.warn('No se pudo conectar a la base de datos para obtener las facturas existentes.', error.message);
    return new Set();
  } finally {
    try {
      await prisma.$disconnect();
    } catch (error) {
      // ignore
    }
  }
};

const main = async () => {
  const existingSet = await loadExistingNumbers();

  const files = await collectFiles();
  const recognized = files.filter((item) => Boolean(item.invoiceNumber));
  const missing = recognized
    .filter((item) => !existingSet.has(item.invoiceNumber))
    .sort((a, b) => a.invoiceNumber.localeCompare(b.invoiceNumber));

  const unknown = files.filter((item) => !item.invoiceNumber);

  const markdown = buildMarkdown(missing, unknown, {
    totalFiles: files.length,
    recognized: recognized.length,
  });

  const outputPath = path.resolve(__dirname, '../../DOC/FACTURAS_PENDIENTES.md');
  await fs.promises.writeFile(outputPath, markdown, 'utf8');
  console.log(`Reporte generado en ${outputPath}`);
};

main().catch((error) => {
  console.error('Error analizando facturas:', error);
  process.exitCode = 1;
});
