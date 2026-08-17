import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.ticket.deleteMany({});
  console.log(`Successfully deleted ${result.count} tickets from the database.`);
  console.log('Note: Associated timelines and notifications were also automatically removed via cascading deletes.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
