const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const COMPANY_LINES = [
  'ARVI MANTENIMENTS INTEGRALS S.L.',
  'C/ Sentmenat, 5 · Sabadell BCN 08203',
  'Tel. +34 669 47 55 83 · vendes@arvimanteniment.com',
];

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('es-ES');
};

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} EUR`;

const writeHeader = (doc, title) => {
  doc.fontSize(11).fillColor('#111827');
  doc.text('Reparem el passat | Mantenim el present | Instal·lem el futur', { align: 'right' });
  doc.moveDown(0.3);
  doc.fontSize(28).font('Helvetica-Bold').text('ARVI', 40, 45);
  doc.moveTo(40, 40).lineTo(150, 40).lineWidth(4).stroke('#9DCE15');
  doc.moveTo(40, 75).lineTo(150, 75).lineWidth(4).stroke('#111827');
  doc.fontSize(16).fillColor('#111827').text(title, 40, 100);
  doc.moveDown();
};

const writeCompanyAndClient = (doc, rightBlock = []) => {
  doc.fontSize(10).font('Helvetica');
  COMPANY_LINES.forEach((line, index) => doc.text(line, 40, 140 + index * 14));
  rightBlock.forEach((line, index) => doc.text(line || '', 330, 140 + index * 14, { width: 220, align: 'right' }));
};

const drawTable = (doc, rows, startY) => {
  let currentY = startY;
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Descripcion', 40, currentY, { width: 220 });
  doc.text('Cant.', 275, currentY, { width: 45, align: 'center' });
  doc.text('Ud.', 325, currentY, { width: 40, align: 'center' });
  doc.text('Precio', 375, currentY, { width: 70, align: 'right' });
  doc.text('IVA', 450, currentY, { width: 40, align: 'right' });
  doc.text('Total', 495, currentY, { width: 60, align: 'right' });
  currentY += 18;
  doc.moveTo(40, currentY).lineTo(555, currentY).stroke('#CBD5E1');
  currentY += 8;

  doc.font('Helvetica');
  rows.forEach((item) => {
    const rowHeight = Math.max(doc.heightOfString(item.description || '-', { width: 220 }), 16);
    doc.text(item.description || '-', 40, currentY, { width: 220 });
    doc.text(String(item.quantity || 1), 275, currentY, { width: 45, align: 'center' });
    doc.text(item.unit || 'ud', 325, currentY, { width: 40, align: 'center' });
    doc.text(formatMoney(item.unitPrice), 375, currentY, { width: 70, align: 'right' });
    doc.text(`${Number(item.tax || 0).toFixed(0)}%`, 450, currentY, { width: 40, align: 'right' });
    doc.text(formatMoney(item.total), 495, currentY, { width: 60, align: 'right' });
    currentY += rowHeight + 12;
    doc.moveTo(40, currentY - 6).lineTo(555, currentY - 6).stroke('#E2E8F0');
  });
  return currentY;
};

const writeTotals = (doc, data, startY) => {
  const baseX = 375;
  doc.font('Helvetica').fontSize(10);
  doc.text('Subtotal', baseX, startY, { width: 90 });
  doc.text(formatMoney(data.subtotal), 465, startY, { width: 90, align: 'right' });
  doc.text('IVA', baseX, startY + 18, { width: 90 });
  doc.text(formatMoney(data.taxTotal), 465, startY + 18, { width: 90, align: 'right' });
  doc.font('Helvetica-Bold');
  doc.text('Total', baseX, startY + 42, { width: 90 });
  doc.text(formatMoney(data.total), 465, startY + 42, { width: 90, align: 'right' });
};

const createPdf = async (filePath, render) => {
  ensureDir(path.dirname(filePath));
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    render(doc);
    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
  return filePath;
};

const generateInvoicePdf = async (invoice, outputDir) => {
  const filePath = path.join(outputDir, `${invoice.invoiceNumber || `factura-${invoice.id}`}.pdf`);
  return createPdf(filePath, (doc) => {
    writeHeader(doc, invoice.status === 'draft' ? 'Factura borrador' : 'Factura');
    writeCompanyAndClient(doc, [invoice.clientName, invoice.clientCif, invoice.clientAddress].filter(Boolean));

    doc.fontSize(11).font('Helvetica-Bold');
    doc.text(`Numero: ${invoice.invoiceNumber}`, 40, 220);
    doc.text(`Fecha: ${formatDate(invoice.finalDate || invoice.date)}`, 40, 236);
    doc.text(`Estado: ${invoice.status}`, 40, 252);
    if (invoice.description) doc.font('Helvetica').text(`Concepto: ${invoice.description}`, 40, 278, { width: 515 });

    const endY = drawTable(doc, invoice.items || [], invoice.description ? 315 : 300);
    writeTotals(doc, invoice, endY + 20);

    if (invoice.notes) {
      doc.font('Helvetica').fontSize(9).text(`Notas: ${invoice.notes}`, 40, endY + 95, { width: 515 });
    }
  });
};

const generateBudgetPdf = async (budget, outputDir) => {
  const filePath = path.join(outputDir, `${budget.budgetNumber || `proforma-${budget.id}`}.pdf`);
  return createPdf(filePath, (doc) => {
    writeHeader(doc, 'Proforma / Presupuesto');
    writeCompanyAndClient(doc, [budget.client, budget.clientCif, budget.clientAddress].filter(Boolean));

    doc.fontSize(11).font('Helvetica-Bold');
    doc.text(`Numero: ${budget.budgetNumber}`, 40, 220);
    doc.text(`Fecha: ${formatDate(budget.date)}`, 40, 236);
    doc.text(`Estado: ${budget.status}`, 40, 252);
    if (budget.notes) doc.font('Helvetica').text(`Notas: ${budget.notes}`, 40, 278, { width: 515 });

    const rows = (budget.items || []).map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      tax: item.tax,
      total: item.total || Number(item.unitPrice || 0) * Number(item.quantity || 1) * (1 + Number(item.tax || 0) / 100),
    }));

    const endY = drawTable(doc, rows, budget.notes ? 315 : 300);
    writeTotals(doc, budget, endY + 20);
  });
};

const generatePartPdf = async (part, outputDir) => {
  const filePath = path.join(outputDir, `${part.partNumber || `parte-${part.id}`}.pdf`);

  let signatureMeta = {};
  try {
    signatureMeta = part.clientSignature ? JSON.parse(part.clientSignature) : {};
  } catch (error) {
    signatureMeta = {};
  }

  const totalBase = Number(part.serviceFee || 0) + Number(part.materialCost || 0) + Number(part.hours || 0) * Number(process.env.TECH_HOUR_RATE || 45);
  const totalWithTax = totalBase * 1.21;

  return createPdf(filePath, (doc) => {
    doc.fontSize(20).text('Parte de Seguro - ARVI', { align: 'center' });
    doc.moveDown();
    doc.fontSize(11);
    doc.text(`Numero: ${part.partNumber || part.id}`);
    doc.text(`Cliente: ${part.client || '-'}`);
    doc.text(`Email cliente: ${signatureMeta.email || '-'}`);
    doc.text(`Trabajo: ${part.work || '-'}`);
    doc.text(`Fecha: ${formatDate(part.date)}`);
    doc.text(`Estado: ${part.status || '-'}`);
    doc.moveDown();
    doc.text('Descripcion de trabajo realizado:', { underline: true });
    doc.text(signatureMeta.workDone || 'Sin descripcion.');
    doc.moveDown();
    doc.text('Costes', { underline: true });
    doc.text(`Desplazamiento: ${Number(part.serviceFee || 0).toFixed(2)} EUR`);
    doc.text(`Horas tecnico: ${Number(part.hours || 0).toFixed(2)}`);
    doc.text(`Coste material: ${Number(part.materialCost || 0).toFixed(2)} EUR`);
    doc.text(`Total sin IVA: ${Number(totalBase || 0).toFixed(2)} EUR`);
    doc.text(`Total con IVA: ${Number(totalWithTax || 0).toFixed(2)} EUR`);
    if (part.signedAt) {
      doc.moveDown();
      doc.text(`Firmado por cliente: ${new Date(part.signedAt).toLocaleString('es-ES')}`);
    }
  });
};

module.exports = {
  generateInvoicePdf,
  generateBudgetPdf,
  generatePartPdf,
};
