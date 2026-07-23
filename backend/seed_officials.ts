import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const officials = [
  {
    name: 'Kamala Bai',
    nameTe: 'కమలా బాయి',
    designation: 'MPDO',
    designationTe: 'ఎం.పి.డి.ఓ',
    phoneNumber: '-',
    photo: 'Kamala_Bai.jpg',
    office: 'Mandal Parishad',
    responsibilities: 'Mandal Development',
    status: 'ACTIVE'
  },
  {
    name: 'Guruswamy',
    nameTe: 'గురుస్వామి',
    designation: 'GPDO',
    designationTe: 'జి.పి.డి.ఓ',
    phoneNumber: '-',
    photo: 'Guruswamy.jpg',
    office: 'Gram Panchayat',
    responsibilities: 'Panchayat Development',
    status: 'ACTIVE'
  },
  {
    name: 'G. Sai Charan',
    nameTe: 'జి. సాయి చరణ్',
    designation: 'Bill Collector',
    designationTe: 'బిల్ కలెక్టర్',
    phoneNumber: '-',
    photo: 'G_Sai_Charan.jpg',
    office: 'Gram Panchayat',
    responsibilities: 'Official Duties',
    status: 'ACTIVE'
  },
  {
    name: 'Sai Sanjay',
    nameTe: 'సాయి సంజయ్',
    designation: 'Jr.Assistant',
    designationTe: 'జూనియర్ అసిస్టెంట్',
    phoneNumber: '-',
    photo: 'Sai_Sanjay.jpg',
    office: 'Gram Panchayat',
    responsibilities: 'Official Duties',
    status: 'ACTIVE'
  },
  {
    name: 'Y.Samatha',
    nameTe: 'వై. సమత',
    designation: 'District Panchayat Officer',
    designationTe: 'జిల్లా పంచాయితీ అధికారి',
    phoneNumber: '-',
    photo: 'Y_Samatha.jpg',
    office: 'District Office',
    responsibilities: 'District Level Administration',
    status: 'ACTIVE'
  },
  {
    name: 'B.Haseena Begum',
    nameTe: 'బి. హసీనా బేగం',
    designation: 'Jr.Assistant',
    designationTe: 'జూనియర్ అసిస్టెంట్',
    phoneNumber: '-',
    photo: 'B_Haseena_Begum.png',
    office: 'Gram Panchayat',
    responsibilities: 'Official Duties',
    status: 'ACTIVE'
  },
  {
    name: 'B.Sudhakar',
    nameTe: 'బి. సుధాకర్',
    designation: 'Bill Collector',
    designationTe: 'బిల్ కలెక్టర్',
    phoneNumber: '-',
    photo: 'B_Sudhakar.png',
    office: 'Gram Panchayat',
    responsibilities: 'Official Duties',
    status: 'ACTIVE'
  },
  { name: 'Smt Chandrakala', designation: 'Revenue Officer', phoneNumber: '9000044444', photo: null, office: 'Revenue Office', responsibilities: 'Cess and collections', status: 'ACTIVE' },
  { name: 'Sri Lakshinarayana', designation: 'Revenue Officer', phoneNumber: '9000055555', photo: null, office: 'Revenue Office', responsibilities: 'Taxes & audits', status: 'ACTIVE' },
  { name: 'ASWINI GERVI', designation: 'Sericulture Assistant', phoneNumber: '7815892900', photo: null, office: 'Sachivalayam 01', responsibilities: 'Sericulture management', status: 'ACTIVE' },
  { name: 'VANITHA BAI MUDE', designation: 'Mahila Police', phoneNumber: '9666031163', photo: null, office: 'Sachivalayam 01', responsibilities: 'Anganwadi inspection, awareness, law & order', status: 'ACTIVE' },
  { name: 'GOWTHAMI KIMAVATH', designation: 'Welfare Assistant', phoneNumber: '7993136103', photo: null, office: 'Sachivalayam 01', responsibilities: 'Pensions, social schemes, SHGs, school inspection', status: 'ACTIVE' },
  { name: 'HARIKRISHNA CHANGALA', designation: 'Village Surveyor', phoneNumber: '996631270', photo: null, office: 'Sachivalayam 01', responsibilities: 'Survey and land records', status: 'ACTIVE' },
  { name: 'ANANTHALA SWATHI', designation: 'Engineering Assistant', phoneNumber: '8328686429', photo: null, office: 'Sachivalayam 01', responsibilities: 'Buildings, CC roads, housing, RWS works', status: 'ACTIVE' }
];

async function main() {
  await prisma.official.deleteMany({});
  console.log('Cleared existing officials');

  for (const official of officials) {
    await prisma.official.create({
      data: official
    });
    console.log(`Added ${official.name}`);
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
