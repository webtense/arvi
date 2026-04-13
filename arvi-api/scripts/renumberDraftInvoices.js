const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

const prisma = new PrismaClient();

const buildDraftInvoiceNumber = (referenceDate = new Date(), seed = 0) => {
  const date = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  const year = Number.isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
  return `DRAFT-${year}-${String(seed).padStart(6, '0')}`;
};

async function main() {
  const allDrafts = await prisma.invoice.findMany({
    where: { status: 'draft' },
    select: { id: true, invoiceNumber: true, notes: true, date: true },
    orderBy: { id: 'asc' },
  });
  const drafts = allDrafts.filter((invoice) => /^\d{4}\/\d{3,}$/.test(invoice.invoiceNumber || ''));

  if (drafts.length === 0) {
    console.log('No hay borradores antiguos que renumerar.');
    return;
  }

  for (const draft of drafts) {
    const nextNumber = buildDraftInvoiceNumber(draft.date || new Date(), draft.id);
    const notes = draft.notes
      ? `${draft.notes}\nRenumerada a ${nextNumber}. Numero anterior: ${draft.invoiceNumber}`
      : `Renumerada a ${nextNumber}. Numero anterior: ${draft.invoiceNumber}`;

    await prisma.invoice.update({
      where: { id: draft.id },
      data: {
        invoiceNumber: nextNumber,
        notes,
      },
    });
  }

  console.log(`Renumeradas ${drafts.length} facturas en borrador.`);
}

main()
  .catch((error) => {
    console.error('Error renumerando borradores:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
