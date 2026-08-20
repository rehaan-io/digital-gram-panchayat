import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching all CITIZEN accounts...');
  const citizens = await prisma.user.findMany({
    where: { role: 'CITIZEN' },
    select: { id: true, email: true }
  });

  if (citizens.length === 0) {
    console.log("No citizens found to delete.");
    return;
  }

  const citizenIds = citizens.map(c => c.id);
  console.log(`Found ${citizens.length} citizens. Cleaning up related data...`);

  // 1. Delete notifications for these citizens
  await prisma.notification.deleteMany({
    where: { userId: { in: citizenIds } }
  });

  // 2. Delete TicketTimelines where actor is a citizen to prevent foreign key errors
  await prisma.ticketTimeline.deleteMany({
    where: { actorId: { in: citizenIds } }
  });

  // 3. Delete Tickets created by these citizens
  await prisma.ticket.deleteMany({
    where: { citizenId: { in: citizenIds } }
  });

  // 4. Finally, delete the citizen accounts
  const deleted = await prisma.user.deleteMany({
    where: { role: 'CITIZEN' }
  });

  console.log('--- Deleted the following Citizen Emails ---');
  citizens.forEach(c => console.log(c.email));
  console.log(`\nSuccessfully deleted ${deleted.count} citizens. Admins have been left alone.`);
}

main()
  .catch(e => {
    console.error('Error deleting citizens:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
