const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.official.updateMany({
    where: { name: 'Guruswamy' },
    data: { name: 'U. Guruswamy' }
  });
  console.log('Updated records:', result);
}
main().finally(() => prisma.$disconnect());
