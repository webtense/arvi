const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('P1pigr@n!', 10);
  
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@arvi.com',
      role: 'admin'
    }
  });

  // Create test client user
  const clientPassword = await bcrypt.hash('1234', 10);
  await prisma.user.upsert({
    where: { username: 'vecino' },
    update: {},
    create: {
      username: 'vecino',
      password: clientPassword,
      email: 'vecino@arvi.com',
      role: 'client'
    }
  });

  console.log('Users created successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
