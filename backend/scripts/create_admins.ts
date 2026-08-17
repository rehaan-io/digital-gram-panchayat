import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // First, delete the old ones to avoid clutter
  await prisma.user.deleteMany({
    where: {
      username: {
        in: ['anand_rao', 'sunita_reddy', 'kiran_varma']
      }
    }
  });

  const admins = [
    {
      username: 'sai_sanjay',
      email: 'sai.sanjay@panchayat.gov.in',
      phone: '9848011111',
      fullName: 'Sai Sanjay',
      password: 'Secure#Sai2026',
    },
    {
      username: 'samatha',
      email: 'samatha@panchayat.gov.in',
      phone: '9848022222',
      fullName: 'Samatha',
      password: 'Admin!Samatha99',
    },
    {
      username: 'kamala_bai',
      email: 'kamala.bai@panchayat.gov.in',
      phone: '9848033333',
      fullName: 'Kamala bai',
      password: 'Kamala$Gov88',
    }
  ];

  for (const admin of admins) {
    const existing = await prisma.user.findUnique({ where: { username: admin.username } });
    if (existing) {
      console.log(`Admin ${admin.username} already exists.`);
      continue;
    }
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
    console.log(`Created admin: ${admin.username} (Pass: ${admin.password})`);
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
