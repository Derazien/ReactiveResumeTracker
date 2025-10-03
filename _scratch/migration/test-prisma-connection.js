const { PrismaClient } = require('@prisma/client');

console.log(' Prisma Connection Diagnostics');
console.log('================================');
console.log('');
console.log('DATABASE_URL from process.env:');
console.log(process.env.DATABASE_URL || '(not set)');
console.log('');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function test() {
  try {
    console.log('Attempting to connect...');
    await prisma.$connect();
    console.log(' Connection successful!');
    await prisma.$disconnect();
  } catch (error) {
    console.error(' Connection failed:');
    console.error(error.message);
  }
}

test();
