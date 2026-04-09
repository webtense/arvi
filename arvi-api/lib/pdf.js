const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const generatePartPdf = async (part, outputDir) => {
  ensureDir(outputDir);
  const filePath = path.join(outputDir, `${part.partNumber || `parte-${part.id}`}.pdf`);

  let signatureMeta = {};
  try {
    signatureMeta = part.clientSignature ? JSON.parse(part.clientSignature) : {};
  } catch (error) {
    signatureMeta = {};
  }

  const totalBase = Number(part.serviceFee || 0) + Number(part.materialCost || 0) + Number(part.hours || 0) * Number(process.env.TECH_HOUR_RATE || 45);
  const totalWithTax = totalBase * 1.21;

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(20).text('Parte de Seguro - ARVI', { align: 'center' });
    doc.moveDown();
    doc.fontSize(11);
    doc.text(`Numero: ${part.partNumber || part.id}`);
    doc.text(`Cliente: ${part.client || '-'}`);
    doc.text(`Email cliente: ${signatureMeta.email || '-'}`);
    doc.text(`Trabajo: ${part.work || '-'}`);
    doc.text(`Fecha: ${new Date(part.date).toLocaleDateString('es-ES')}`);
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

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return filePath;
};

module.exports = {
  generatePartPdf,
};
