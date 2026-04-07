const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  // Seed Invoices
  const invoices = await prisma.invoice.findMany();
  if (invoices.length === 0) {
    await prisma.invoice.createMany({
      data: [
        {
          invoiceNumber: '2023/150',
          date: new Date('2023-12-20'),
          client: 'Fontanería Paco',
          description: 'Servicios varios',
          items: JSON.stringify([{ id: 1, description: 'Servicios varios', quantity: 1, price: 450, tax: 21, total: 450 }]),
          subtotal: 450,
          taxTotal: 94.5,
          total: 544.5,
          status: 'imported',
          type: 'definitive',
          hash: 'H1SH_HIST_01',
          finalDate: new Date('2023-12-20')
        },
        {
          invoiceNumber: '2023/151',
          date: new Date('2023-12-28'),
          client: 'Talleres BCN',
          description: 'Monthly maintenance',
          items: JSON.stringify([{ id: 1, description: 'Mantenimiento', quantity: 1, price: 800, tax: 21, total: 800 }]),
          subtotal: 800,
          taxTotal: 168,
          total: 968,
          status: 'imported',
          type: 'definitive',
          hash: 'H1SH_HIST_02',
          prevHash: 'H1SH_HIST_01',
          finalDate: new Date('2023-12-28')
        }
      ]
    });
    console.log('Invoices seeded');
  }

  // Seed Budgets
  const budgets = await prisma.budget.findMany();
  if (budgets.length === 0) {
    await prisma.budget.createMany({
      data: [
        { client: 'Comunidad Almogàvar', total: 1250.50, status: 'pending', date: new Date('2024-03-15') },
        { client: 'Liquid Gas S.L.', total: 539.94, status: 'pending', date: new Date('2024-03-18') },
        { client: 'Hotel Sabadell', total: 2450.00, status: 'pending', date: new Date('2024-03-19') }
      ]
    });
    console.log('Budgets seeded');
  }

  // Seed Parts
  const parts = await prisma.part.findMany();
  if (parts.length === 0) {
    await prisma.part.createMany({
      data: [
        { client: 'Xavi Santiveri', work: 'Reparación tubería bidet', status: 'completed', date: new Date('2024-03-19') },
        { client: 'Comunidad Centro', work: 'Revisión técnica ascensores', status: 'completed', date: new Date('2024-03-20') }
      ]
    });
    console.log('Parts seeded');
  }

  // Seed Assets
  const assets = await prisma.asset.findMany();
  if (assets.length === 0) {
    await prisma.asset.createMany({
      data: [
        { name: 'Ascensor Principal', description: 'Ascensor del portal principal', location: 'Portal A', status: 'active' },
        { name: 'Caldera comunitaria', description: 'Caldera de gas natural', location: 'Sótano', status: 'active' },
        { name: 'Sistema de riego', description: 'Riego automático jardín', location: 'Exterior', status: 'maintenance' }
      ]
    });
    console.log('Assets seeded');
  }

  // Seed Tickets
  const tickets = await prisma.ticket.findMany();
  if (tickets.length === 0) {
    await prisma.ticket.createMany({
      data: [
        { client: 'The Fresh Poke', amount: 15.90, category: 'Comida', description: 'Almuerzo equipo', date: new Date('2024-03-18'), status: 'verified' },
        { client: 'Ferretería Industrial', amount: 84.20, category: 'Material', description: 'Tornillos y tuercas', date: new Date('2024-03-17'), status: 'processing' },
        { client: 'Estación Repsol', amount: 65.00, category: 'Gasoil', description: 'Combustible furgo', date: new Date('2024-03-15'), status: 'verified' }
      ]
    });
    console.log('Tickets seeded');
  }

  console.log('Seed completed!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
