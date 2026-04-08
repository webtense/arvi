const { PrismaClient } = require('@prisma/client');

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

let prisma;

if (typeof global !== 'undefined' && global.prisma) {
  prisma = global.prisma;
} else {
  prisma = prismaClientSingleton();
}

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

module.exports = { prisma };