import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Find all current admins
  const adminsToDelete = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true }
  });
  
  const adminIds = adminsToDelete.map(a => a.id);

  if (adminIds.length > 0) {
    // 1. Delete their timeline entries
    await prisma.ticketTimeline.deleteMany({
      where: { actorId: { in: adminIds } }
    });

    // 2. Unassign them from tickets (if they have an employee profile)
    const employeeProfiles = await prisma.employee.findMany({
      where: { userId: { in: adminIds } },
      select: { id: true }
    });
    const empIds = employeeProfiles.map(e => e.id);
    
    if (empIds.length > 0) {
      await prisma.ticket.updateMany({
        where: { employeeId: { in: empIds } },
        data: { employeeId: null }
      });
    }

    // 3. Delete the admins
    const deleted = await prisma.user.deleteMany({
      where: { id: { in: adminIds } }
    });
    console.log(`Deleted ${deleted.count} existing admin accounts from the database.`);
  }

  const admins = [
    {
      username: 'samatha',
      email: 'samatha@grampanchayat.digital',
      phone: '9848011111',
      fullName: 'Y. Samatha',
      password: 'Samatha@Admin2026',
    },
    {
      username: 'haseena',
      email: 'haseena@grampanchayat.digital',
      phone: '9848022222',
      fullName: 'B. Haseena Begum',
      password: 'Haseena#Admin26',
    },
    {
      username: 'sudhakar',
      email: 'sudhakar@grampanchayat.digital',
      phone: '9848033333',
      fullName: 'B. Sudhakar',
      password: 'Sudhakar$Admin26',
    },
    {
      username: 'ravindra',
      email: 'ravindra@grampanchayat.digital',
      phone: '9848044444',
      fullName: 'Ravindra Kumar P',
      password: 'Ravindra%Admin26',
    },
    {
      username: 'ashok',
      email: 'ashok@grampanchayat.digital',
      phone: '9848055555',
      fullName: 'Ashok Kumar',
      password: 'Ashok*Admin2026',
    }
  ];

  for (const admin of admins) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    
    await prisma.user.create({
      data: {
        username: admin.username,
        email: admin.email,
        phone: admin.phone,
        fullName: admin.fullName,
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
      }
    });
    console.log(`Created new admin: ${admin.fullName} (${admin.email}) | Password: ${admin.password}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
