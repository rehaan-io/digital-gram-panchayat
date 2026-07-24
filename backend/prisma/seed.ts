import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to upsert a record in single-row settings tables
async function upsertSingleRow(model: any, data: any) {
  const existing = await model.findFirst();
  if (existing) {
    return await model.update({
      where: { id: existing.id },
      data,
    });
  } else {
    return await model.create({
      data,
    });
  }
}

// Helper to upsert list records by a unique/identifying text field
async function upsertByKey(model: any, keyField: string, keyValue: string, data: any) {
  const existing = await model.findFirst({
    where: { [keyField]: keyValue },
  });
  if (existing) {
    return await model.update({
      where: { id: existing.id },
      data,
    });
  } else {
    return await model.create({
      data: {
        [keyField]: keyValue,
        ...data,
      },
    });
  }
}

async function main() {
  console.log('Running database seed...');

  // 1. Create Default Admin User
  const adminEmail = 'admin@panchayat.gov.in';
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: adminEmail,
        phone: '9999999999',
        password: hashedPassword,
        fullName: 'Gram Panchayat Admin',
        role: 'ADMIN',
        isVerified: true,
      },
    });
    console.log('Default Admin user created.');
  } else {
    console.log('Admin user already exists.');
  }

  // 2. Create Default Citizen User (Only if not existing)
  const citizenEmail = 'citizen@example.com';
  const existingCitizen = await prisma.user.findUnique({
    where: { email: citizenEmail },
  });
  if (!existingCitizen) {
    const hashedPassword = await bcrypt.hash('Citizen@123', 10);
    await prisma.user.create({
      data: {
        username: 'citizen_test',
        email: citizenEmail,
        phone: '8888888888',
        password: hashedPassword,
        fullName: 'Ramesh Kumar',
        role: 'CITIZEN',
        isVerified: true,
      },
    });
    console.log('Test Citizen user created.');
  }

  // 3. Create Default Employee User (Only if not existing)
  const employeeEmail = 'employee@example.com';
  const existingEmployee = await prisma.user.findUnique({
    where: { email: employeeEmail },
  });
  if (!existingEmployee) {
    const hashedPassword = await bcrypt.hash('Employee@123', 10);
    await prisma.user.create({
      data: {
        username: 'emp_ramesh',
        email: employeeEmail,
        phone: '7777777777',
        password: hashedPassword,
        fullName: 'Ramesh Singh',
        role: 'EMPLOYEE',
        isVerified: true,
        employeeProfile: {
          create: {
            employeeId: 'EMP-2026-0001',
            department: 'Water Supply & Hygiene',
          },
        },
      },
    });
    console.log('Test Employee user created.');
  }

  // 4. Seeding Homepage Sections
  const sections = [
    {
      key: 'about',
      title: 'About Panchayat',
      titleTe: 'పంచాయతీ గురించి',
      content: 'Welcome to the Digital Gram Panchayat Management Portal. Our Panchayat is dedicated to sustainable local governance, providing transparent services, and fostering overall community development.',
      contentTe: 'డిజిటల్ గ్రామ పంచాయతీ మేనేజ్‌మెంట్ పోర్టల్‌కు స్వాగతం. మా పంచాయతీ స్థిరమైన స్థానిక పాలన, పారదర్శక సేవలు మరియు సమాజ సమగ్ర అభివృద్ధికి కట్టుబడి ఉంది.',
    },
    {
      key: 'water_supply',
      title: 'Water Supply',
      titleTe: 'నీటి సరఫరా',
      content: 'Our village operates overhead tanks and direct pumping schemes, supplying clean drinking water to all households. Water chlorination and quality checks are carried out every Wednesday.',
      contentTe: 'మా గ్రామంలో ఓవర్‌హెడ్ ట్యాంకులు మరియు డైరెక్ట్ పంపింగ్ స్కీమ్‌లు ఉన్నాయి, ఇవి అన్ని ఇళ్లకు శుభ్రమైన తాగునీటిని సరఫరా చేస్తాయి. ప్రతి బుధవారం నీటి క్లోరినేషన్ మరియు నాణ్యత తనిఖీలు జరుగుతాయి.',
    },
    {
      key: 'street_lights',
      title: 'Street Lights',
      titleTe: 'వీధి దీపాలు',
      content: 'Over 2500 LED street lights are installed across all wards. The panchayat aims to achieve 100% LED coverage by the end of this year to reduce energy consumption.',
      contentTe: 'అన్ని వార్డులలో 2500కి పైగా LED వీధి దీపాలు ఏర్పాటు చేయబడ్డాయి. విద్యుత్ వినియోగాన్ని తగ్గించడానికి ఈ ఏడాది చివరి నాటికి 100% LED కవరేజీని సాధించాలని పంచాయతీ లక్ష్యంగా పెట్టుకుంది.',
    },
    {
      key: 'education',
      title: 'Education & Literacy',
      titleTe: 'విద్య & అక్షరాస్యత',
      content: 'We manage primary schools and government high schools equipped with computer labs and smart classrooms. Standard meals are served daily under the Mid-Day Meal scheme.',
      contentTe: 'మేము కంప్యూటర్ ల్యాబ్‌లు మరియు స్మార్ట్ తరగతి గదులతో కూడిన ప్రాథమిక పాఠశాలలు మరియు ప్రభుత్వ ఉన్నత పాఠశాలలను నిర్వహిస్తున్నాము. మధ్యాహ్న భోజన పథకం కింద ప్రతిరోజూ నాణ్యమైన భోజనం అందిస్తారు.',
    },
    {
      key: 'health',
      title: 'Health & Sanitation',
      titleTe: 'ఆరోగ్యం & పారిశుధ్యం',
      content: 'The Primary Health Center (PHC) is open 24/7 with a resident medical officer. Free health check-up camps are organized regularly.',
      contentTe: 'ప్రాథమిక ఆరోగ్య కేంద్రం (PHC) రెసిడెంట్ మెడికల్ ఆఫీసర్‌తో 24/7 తెరిచి ఉంటుంది. ఉచిత ఆరోగ్య పరీక్షల శిబిరాలు క్రమం తప్పకుండా నిర్వహించబడతాయి.',
    },
    {
      key: 'agriculture',
      title: 'Agriculture & Livestock',
      titleTe: 'వ్యవసాయం',
      content: 'Agriculture is the backbone of our economy. Crop insurance, groundnut seed distribution, soil card analytics are available at the Krishi Kendra.',
      contentTe: 'వ్యవసాయం మన ఆర్థిక వ్యవస్థకు వెన్నెముక. పంటల బీమా, వేరుశనగ విత్తనాల పంపిణీ, సాయిల్ కార్డ్ విశ్లేషణ కృషి కేంద్రంలో అందుబాటులో ఉన్నాయి.',
    },
    {
      key: 'pensions',
      title: 'Pension Schemes',
      titleTe: 'పెన్షన్ పథకాలు',
      content: 'Old Age, Widow, Disabled, Weavers, and Single Women pensions are processed and disbursed transparently every month.',
      contentTe: 'వృద్ధాప్య, వితంతు, వికలాంగ, చేనేత మరియు ఒంటరి మహిళల పెన్షన్లు ప్రతి నెలా పారదర్శకంగా పంపిణీ చేయబడతాయి.',
    },
    {
      key: 'tax_revenue',
      title: 'Tax & Revenue',
      titleTe: 'పన్ను & రాబడి',
      content: 'Track tax demand and collection percentages, general funds, and government grant allocations for the current fiscal year.',
      contentTe: 'ప్రస్తుత ఆర్థిక సంవత్సరానికి పన్ను డిమాండ్ మరియు వసూళ్ల శాతాలు, సాధారణ నిధులు మరియు ప్రభుత్వ గ్రాంట్ కేటాయింపులను పర్యవేక్షించండి.',
    },
    {
      key: 'anganwadi',
      title: 'Anganwadi Services',
      titleTe: 'అంగన్‌వాడీ సేవలు',
      content: 'Early childhood education and nutritional monitoring (SAM/MAM children) are tracked closely across all local Anganwadi centres.',
      contentTe: 'చిన్నపిల్లల విద్య మరియు పోషకాహార పర్యవేక్షణ (SAM/MAM పిల్లలు) అన్ని స్థానిక అంగన్‌వాడీ కేంద్రాలలో నిశితంగా పర్యవేక్షించబడతాయి.',
    },
    {
      key: 'mgnregs',
      title: 'MGNREGS Works',
      titleTe: 'ఉపాధి హామీ పనులు (MGNREGS)',
      content: 'Employment support under MGNREGS. Active job cards and local development works are fully tracked.',
      contentTe: 'MGNREGS కింద ఉపాధి మద్దతు. యాక్టివ్ జాబ్ కార్డ్‌లు మరియు స్థానిక అభివృద్ధి పనులు పూర్తిగా ట్రాక్ చేయబడతాయి.',
    },
    {
      key: 'horticulture',
      title: 'Horticulture Sector',
      titleTe: 'ఉద్యానవన రంగం',
      content: 'Cultivation support for fruits, flowers, and vegetables. MIDH and RKVM programs are integrated.',
      contentTe: 'పండ్లు, పూలు మరియు కూరగాయల సాగుకు మద్దతు. MIDH మరియు RKVM కార్యక్రమాలు అనుసంధానించబడ్డాయి.',
    },
    {
      key: 'animal_husbandry',
      title: 'Animal Husbandry',
      titleTe: 'పశుసంవర్ధక శాఖ',
      content: 'Support for cattle, buffaloes, sheep, and goats, including vaccinations, insurance, and local Gokulam projects.',
      contentTe: 'టీకాలు, బీమా మరియు స్థానిక గోకులం ప్రాజెక్టులతో సహా పశువులు, గేదెలు, గొర్రెలు మరియు మేకల పెంపకానికి మద్దతు.',
    },
    {
      key: 'shg_vo',
      title: 'SHG & VO groups',
      titleTe: 'SHG & VO గ్రూపులు',
      content: 'Empowering local women through Self Help Groups (SHGs) and Village Organizations (VOs) with microfinance and savings.',
      contentTe: 'స్వయం సహాయక సంఘాలు (SHGలు) మరియు గ్రామ సంఘాల (VOలు) ద్వారా స్థానిక మహిళలకు మైక్రోఫైనాన్స్ మరియు పొదుపు సాధికారత.',
    },
    {
      key: 'community_assets',
      title: 'Community Assets',
      titleTe: 'కమ్యూనిటీ ఆస్తులు',
      content: 'Management of public assets like community halls, libraries, solid waste systems (SWPC Shed), and public tanks.',
      contentTe: 'కమ్యూనిటీ హాళ్లు, గ్రంథాలయాలు, ఘన వ్యర్థాల నిర్వహణ వ్యవస్థలు (SWPC షెడ్) మరియు పబ్లిక్ ట్యాంకులు వంటి ప్రజా ఆస్తుల నిర్వహణ.',
    },
    {
      key: 'pension_records',
      title: 'Pension Beneficiary Records',
      titleTe: 'పెన్షన్ లబ్ధిదారుల జాబితా',
      content: 'View individual pension verification records, schemes, and monthly amounts for Gorantla Gram Panchayat.',
      contentTe: 'గోరంట్ల గ్రామ పంచాయతీకి సంబంధించిన పెన్షన్ లబ్ధిదారుల పూర్తి జాబితా, పథకాలు మరియు మొత్తాలు.',
    },
  ];

  for (const sec of sections) {
    await prisma.homepageSection.upsert({
      where: { key: sec.key },
      update: { title: sec.title, content: sec.content, titleTe: sec.titleTe, contentTe: sec.contentTe },
      create: { key: sec.key, title: sec.title, content: sec.content, titleTe: sec.titleTe, contentTe: sec.contentTe },
    });
  }
  console.log('Homepage sections seeded.');

  // 5. Initial Sample Announcement (Only if no announcements exist)
  const announcementCount = await prisma.announcement.count();
  if (announcementCount === 0) {
    await prisma.announcement.create({
      data: {
        title: 'Gram Sabha Meeting - July 2026',
        titleTe: 'గ్రామ సభ సమావేశం - జూలై 2026',
        content: 'The official monthly Gram Sabha meeting will be held on July 10, 2026, to discuss the budget allocation for sanitation projects and drinking water extensions.',
        contentTe: 'పారిశుద్ధ్య ప్రాజెక్టులు మరియు త్రాగునీటి విస్తరణల కోసం బడ్జెట్ కేటాయింపులపై చర్చించడానికి జూలై 10, 2026 న అధికారిక నెలవారీ గ్రామ సభ సమావేశం నిర్వహించబడుతుంది.',
        adminId: adminUser.id,
      },
    });
    console.log('Default sample announcement created.');
  }

  // 6. Panchayat Details (AboutGP)
  const gpDetails = {
    gpName: 'Gorantla',
    mandal: 'Gorantla',
    district: 'Sri Sathya Sai',
    formationDetails: 'Proceedings of District Collector',
    proceedingsNumber: 'D-Collector-Ref-2024',
    gpExtent: '15.52 Sq Km',
    panchayatSecretary: 'Ravindra Kumar P',
    executiveOfficer: 'Ashok Kumar',
    malePopulation: 12331,
    femalePopulation: 12255,
    population: 24586,
    scPopulation: 1560,
    stPopulation: 657,
    totalAssessments: 7604,
    auditStatus: '-',
    apiicEstate37: '-',
    apiicEstate04: '-',
    apiicTotalAcres: '-',
    savingsTarget: '-',
    savingsAchievement: '-',
    savingsPercentage: '-',
    misappropriationCases: '-',
    misappropriationAmount: '-',
    recoveryAmount: '-',
    fposInGp: '-',
    sriNidhiLoansGranted: '-',
    sriNidhiAmount: '-',
    npa: '-',
    pnpa: '-',
    communityHallLocation: '-',
    libraryLocation: '-',
  };
  await upsertSingleRow(prisma.aboutGP, gpDetails);
  console.log('Panchayat details (AboutGP) seeded.');

  // 7. Seeding Officials & Sachivalayam Staff
  const officials = [
    {
      name: 'Srimati Kamala Bai',
      nameTe: 'శ్రీమతి కమలా బాయి',
      designation: 'MPDO',
      designationTe: 'ఎం.పి.డి.ఓ',
      phoneNumber: '-',
      photo: 'Kamala_Bai.jpg',
      office: 'Mandal Parishad',
      responsibilities: 'Mandal Development',
      status: 'ACTIVE',
    },
    {
      name: 'Guruswamy',
      nameTe: 'గురుస్వామి',
      designation: 'GPDO',
      designationTe: 'జి.пи.డి.ఓ',
      phoneNumber: '-',
      photo: 'Guruswamy.jpg',
      office: 'Gram Panchayat',
      responsibilities: 'Panchayat Development',
      status: 'ACTIVE',
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
      status: 'ACTIVE',
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
      status: 'ACTIVE',
    },
    {
      name: 'Srimati Y.Samatha',
      nameTe: 'శ్రీమతి వై. సమత',
      designation: 'District Panchayat Officer',
      designationTe: 'జिल्లా పంచాయితీ అధికారి',
      phoneNumber: '-',
      photo: 'Y_Samatha.jpg',
      office: 'District Office',
      responsibilities: 'District Level Administration',
      status: 'ACTIVE',
    },
    {
      name: 'Srimati B.Haseena Begum',
      nameTe: 'శ్రీమతి బి. హసీనా బేగం',
      designation: 'Jr.Assistant',
      designationTe: 'జూనియర్ అసిస్టెంట్',
      phoneNumber: '-',
      photo: 'B_Haseena_Begum.png',
      office: 'Gram Panchayat',
      responsibilities: 'Official Duties',
      status: 'ACTIVE',
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
      status: 'ACTIVE',
    },
    { name: 'Smt Chandrakala', nameTe: 'శ్రీమతి చంద్రకళ', designation: 'Revenue Officer', designationTe: 'రెవెన్యూ అధికారి', phoneNumber: '9000044444', photo: null, office: 'Revenue Office', responsibilities: 'Cess and collections', status: 'ACTIVE' },
    { name: 'Sri Lakshinarayana', nameTe: 'శ్రీ లక్ష్మీనారాయణ', designation: 'Revenue Officer', designationTe: 'రెవెన్యూ అధికారి', phoneNumber: '9000055555', photo: null, office: 'Revenue Office', responsibilities: 'Taxes & audits', status: 'ACTIVE' },
    { name: 'ASWINI GERVI', nameTe: 'అశ్విని గెర్వి', designation: 'Sericulture Assistant', designationTe: 'పట్టుపరిశ్రమ సహాయకులు', phoneNumber: '7815892900', photo: null, office: 'Sachivalayam 01', responsibilities: 'Sericulture management', status: 'ACTIVE' },
    { name: 'VANITHA BAI MUDE', nameTe: 'వనితా బాయి మూడే', designation: 'Mahila Police', designationTe: 'మహిళా పోలీస్', phoneNumber: '9666031163', photo: null, office: 'Sachivalayam 01', responsibilities: 'Anganwadi inspection, awareness, law & order', status: 'ACTIVE' },
    { name: 'GOWTHAMI KIMAVATH', nameTe: 'గౌతమి కిమావత్', designation: 'Welfare Assistant', designationTe: 'సంక్షేమ సహాయకులు', phoneNumber: '7993136103', photo: null, office: 'Sachivalayam 01', responsibilities: 'Pensions, social schemes, SHGs, school inspection', status: 'ACTIVE' },
    { name: 'HARIKRISHNA CHANGALA', nameTe: 'హరికృష్ణ చంగాల', designation: 'Village Surveyor', designationTe: 'గ్రామ సర్వేయర్', phoneNumber: '996631270', photo: null, office: 'Sachivalayam 01', responsibilities: 'Survey and land records', status: 'ACTIVE' },
    { name: 'ANANTHALA SWATHI', nameTe: 'అనంతల స్వాతి', designation: 'Engineering Assistant', designationTe: 'ఇంజనీరింగ్ సహాయకులు', phoneNumber: '8328686429', photo: null, office: 'Sachivalayam 01', responsibilities: 'Buildings, CC roads, housing, RWS works', status: 'ACTIVE' },
  ];

  for (const off of officials) {
    await upsertByKey(prisma.official, 'name', off.name, off);
  }
  console.log('Officials & Staff seeded.');

  // 8. Water Details
  const waterStats = {
    totalWaterSchemes: 25,
    privateConnections: 2643,
    publicConnections: 1500,
    handPumps: 12,
    privateTapFeeDemand: 1268640.0,
    totalOHSRs: 4,
    totalGLSRs: 9,
    totalDirectPumping: 0,
  };
  await upsertSingleRow(prisma.waterDetails, waterStats);

  // 9. OHSRs
  const ohsrs = [
    { name: 'Sathya Sai', capacity: 1.0, pumpingCapacity: 10, location: 'Sathya Sai Colony', remarks: 'Functional' },
    { name: 'Petrol Bank', capacity: 1.3, pumpingCapacity: 12, location: 'Main Road Petrol Bank', remarks: 'Fully operational' },
    { name: 'SC Hostel', capacity: 0.8, pumpingCapacity: 8, location: 'SC Welfare Hostel', remarks: 'Serves welfare student campus' },
    { name: 'MRC', capacity: 0.4, pumpingCapacity: 5, location: 'Mandal Resource Centre', remarks: 'Operational' },
  ];
  for (const o of ohsrs) {
    await upsertByKey(prisma.oHSR, 'name', o.name, o);
  }

  // 10. GLSRs
  const glsrs = [
    { name: 'MRC', capacity: 1.5, pumpingCapacity: 15, location: 'Mandal Resource Centre', remarks: 'Major ground level buffer' },
    { name: 'Chowdeswari Colony', capacity: 0.6, pumpingCapacity: 6, location: 'Chowdeswari Colony', remarks: 'Functional' },
    { name: 'Anjaneswamy Colony', capacity: 0.4, pumpingCapacity: 4, location: 'Anjaneswamy Colony Temple Road', remarks: 'Functional' },
    { name: 'Raja Reddy Mill Back Side', capacity: 0.4, pumpingCapacity: 4, location: 'Raja Reddy Mill Backside area', remarks: 'Functional' },
    { name: 'Gummaiahgaripalli Upper', capacity: 0.6, pumpingCapacity: 6, location: 'Gummaiahgaripalli Upper Ward', remarks: 'Operational' },
    { name: 'Gummaiahgaripalli Lower', capacity: 0.4, pumpingCapacity: 4, location: 'Gummaiahgaripalli Lower Ward', remarks: 'Operational' },
    { name: 'Singireddypalli North', capacity: 0.6, pumpingCapacity: 6, location: 'Singireddypalli North', remarks: 'Operational' },
    { name: 'Singireddypalli South', capacity: 0.4, pumpingCapacity: 4, location: 'Singireddypalli South', remarks: 'Operational' },
    { name: 'Siragamvandlapalli', capacity: 0.4, pumpingCapacity: 4, location: 'Siragamvandlapalli center', remarks: 'Functional' },
  ];
  for (const g of glsrs) {
    await upsertByKey(prisma.gLSR, 'name', g.name, g);
  }

  // 11. Direct Pumping
  const directPumps = [
    { pumpName: 'Borewell 1 (Submersible)', source: 'Groundwater Aquifer', capacity: 5.0, status: 'WORKING' },
  ];
  for (const dp of directPumps) {
    await upsertByKey(prisma.directPumping, 'pumpName', dp.pumpName, dp);
  }
  console.log('Water modules (Details, OHSRs, GLSRs, Direct Pumping) seeded.');

  // 12. Street Light Details & Assets
  const streetLightStats = {
    totalPoles: 6000,
    totalLEDs: 2500,
    lightingStaff: 1,
  };
  await upsertSingleRow(prisma.streetLightDetails, streetLightStats);

  const slAssets = [
    { area: 'Gorantla Main Bazar', poleCount: 120, ledCount: 120, workingStatus: 'WORKING', remarks: 'Fully functional' },
    { area: 'Chowdeswari Colony', poleCount: 80, ledCount: 75, workingStatus: 'REPAIR_NEEDED', remarks: '5 LED bulbs need replacement' },
    { area: 'Singireddypalli Ward 3', poleCount: 95, ledCount: 95, workingStatus: 'WORKING', remarks: 'Solar battery serviced last month' },
  ];
  for (const s of slAssets) {
    await upsertByKey(prisma.streetLightAsset, 'area', s.area, s);
  }
  console.log('Street Light modules seeded.');

  // 13. Tax Revenue (Seeded by Financial Year)
  const taxStats = {
    houseTax: 3109889.0,
    libraryCess: 249780.0,
    waterTax: 621929.0,
    lightingTax: 312348.0,
    drainageTax: 467302.0,
    sportsTax: 92723.0,
    fireCess: 30488.0,
    totalDemand: 4884459.0,
    houseTaxCollection: 3109889.0,
    collectionPercentage: 100.0,
    nonTaxDemand: 0.0,
    nonTaxCollection: 0.0,
    pendingAmount: 0.0,
    generalFund: 250000.0,
    tfc: 0.0,
    sfc: 0.0,
    ffc: 0.0,
    fifteenthFC: 1850000.0,
    otherGrants: 0.0,
  };
  await upsertByKey(prisma.taxRevenue, 'financialYear', '2025-2026', taxStats);
  console.log('Tax Revenue seeded.');

  // 14. Health Modules
  const healthStats = {
    hospitalName: 'Gorantla Area PHC',
    healthCentre: 'Community Health Centre',
    ashaWorkers: 18,
    anms: 5,
  };
  await upsertSingleRow(prisma.healthDetails, healthStats);

  const healthStaff = [
    { name: 'D. Nagalakshmi', designation: 'ASHA Worker', phone: '9440011111', area: 'Gorantla Ward 1', status: 'ACTIVE' },
    { name: 'E. Thripura', designation: 'ANM', phone: '9440022222', area: 'Gorantla Centre', status: 'ACTIVE' },
    { name: 'Nagamani', designation: 'ASHA Worker', phone: '9440033333', area: 'Gorantla Ward 2', status: 'ACTIVE' },
    { name: 'S.P. Rajyalakshmi', designation: 'ANM', phone: '9440044444', area: 'Gorantla Ward 2', status: 'ACTIVE' },
  ];
  for (const hs of healthStaff) {
    await upsertByKey(prisma.healthStaff, 'name', hs.name, hs);
  }
  console.log('Health modules seeded.');

  // 15. Schools (Education)
  const schools = [
    { schoolName: 'Primary Govt School', type: 'GOVT', category: 'Primary', location: 'Gorantla Main', boys: 50, girls: 45, total: 95 },
    { schoolName: 'ZPHS Girls High School', type: 'GOVT', category: 'High School', location: 'Temple Road', boys: 0, girls: 150, total: 150 },
    { schoolName: 'Vignan Primary School', type: 'PRIVATE', category: 'Primary', location: 'Colony Street', boys: 90, girls: 97, total: 187 },
  ];
  for (const sch of schools) {
    await upsertByKey(prisma.school, 'schoolName', sch.schoolName, sch);
  }
  console.log('Schools seeded.');

  // 16. Anganwadi Centres & Stats
  const anganwadis = [
    { centreName: 'Gorantla-1', location: 'Gorantla-1', boys: 51, girls: 43, total: 94 },
    { centreName: 'Gorantla-4', location: 'Gorantla-4', boys: 54, girls: 41, total: 95 },
    { centreName: 'Kottacolony', location: 'Kottacolony', boys: 43, girls: 50, total: 93 },
    { centreName: 'Chowdeswari Colony', location: 'Chowdeswari Colony', boys: 52, girls: 45, total: 97 },
    { centreName: 'Gorantla-6', location: 'Gorantla-6', boys: 40, girls: 54, total: 94 },
  ];
  for (const ang of anganwadis) {
    await upsertByKey(prisma.anganwadiCentre, 'centreName', ang.centreName, ang);
  }

  const anganwadiStats = {
    samChildren: 59,
    mamChildren: 85,
  };
  await upsertSingleRow(prisma.anganwadiStats, anganwadiStats);
  console.log('Anganwadi modules seeded.');

  // 17. MGNREGS
  const mgnregsStats = {
    jobCards: 2501,
    activeJobCards: 1204,
    works: 578,
    estimateCost: 65045000,
    gokulamSheds: 3,
    sramikaSanghalu: 22,
    completedGokulam: 3,
    inProgressGokulam: 0,
    notStartedGokulam: 0,
  };
  await upsertSingleRow(prisma.mgnregsDetails, mgnregsStats);

  const mgnregsWorks = [
    { workName: 'Gorantla Drainage Construction', village: 'Gorantla', budget: 150000.0, status: 'COMPLETED', remarks: 'Completed on schedule' },
    { workName: 'Singireddypalli Graveyard Leveling', village: 'Singireddypalli', budget: 85000.0, status: 'IN_PROGRESS', remarks: 'Work in progress' },
  ];
  for (const mw of mgnregsWorks) {
    await upsertByKey(prisma.mgnregsWork, 'workName', mw.workName, mw);
  }
  console.log('MGNREGS modules seeded.');

  // 18. Pensions (Category-wise)
  const pensions = [
    { category: 'OAP', beneficiaries: 1559, monthlyAmount: 3507750, remarks: 'Old Age Pension' },
    { category: 'Widow', beneficiaries: 731, monthlyAmount: 1644750, remarks: 'Widows support' },
    { category: 'Disabled', beneficiaries: 331, monthlyAmount: 993000, remarks: 'Disabled pensions' },
    { category: 'Fully Disabled', beneficiaries: 13, monthlyAmount: 65000, remarks: 'Fully disabled support' },
    { category: 'Weavers', beneficiaries: 134, monthlyAmount: 301500, remarks: 'Weavers welfare' },
    { category: 'Single Women', beneficiaries: 114, monthlyAmount: 256500, remarks: 'Single women support' },
    { category: 'Abhyahastam', beneficiaries: 51, monthlyAmount: 25500, remarks: 'Abhyahastam scheme' },
    { category: 'Chronic Diseases', beneficiaries: 0, monthlyAmount: 0, remarks: '-' },
    { category: 'Dappu Artists', beneficiaries: 11, monthlyAmount: 33000, remarks: 'Dappu artists support' },
    { category: 'Severe Haemophilia', beneficiaries: 0, monthlyAmount: 0, remarks: '-' },
    { category: 'Sicklecell', beneficiaries: 0, monthlyAmount: 0, remarks: '-' },
    { category: 'Thalassemia', beneficiaries: 2, monthlyAmount: 20000, remarks: 'Thalassemia patients support' },
    { category: 'Fishermen', beneficiaries: 0, monthlyAmount: 0, remarks: '-' },
    { category: 'Transgenders', beneficiaries: 1, monthlyAmount: 3000, remarks: 'Transgender welfare' },
    { category: 'Toddy Tappers', beneficiaries: 2, monthlyAmount: 4500, remarks: 'Toddy tappers pension' },
    { category: 'Artists', beneficiaries: 3, monthlyAmount: 9000, remarks: 'Folk artists support' },
    { category: 'CKDU Govt', beneficiaries: 7, monthlyAmount: 70000, remarks: 'Chronic kidney disease patients govt support' },
    { category: 'CKDU Pvt', beneficiaries: 0, monthlyAmount: 0, remarks: '-' },
    { category: 'Sainik Welfare', beneficiaries: 0, monthlyAmount: 0, remarks: '-' },
    { category: 'Traditional Cobblers', beneficiaries: 14, monthlyAmount: 31500, remarks: 'Cobblers pension support' },
  ];
  for (const pen of pensions) {
    await upsertByKey(prisma.pensionCategory, 'category', pen.category, pen);
  }
  console.log('Pension categories seeded.');

  // 19. Agriculture Stats
  const agriStats = {
    cultivableLand: 2231.0,
    rabiArea: 311.0,
    landSown: 2012.0,
    groundnutQuintals: 400.0,
    polamBadies: 5,
    samplesCollected: 40,
    samplesAnalysed: 40,
    soilCards: 40,
    pmKisan: 1234,
    amountPaid: 5400000.0,
    cropInsuranceFarmers: 0,
    heavyRainAffectedFarmers: 0,
    heavyRainDamageArea: 0.0,
    heavyRainDamageAmount: 0.0,
  };
  await upsertSingleRow(prisma.agricultureStats, agriStats);
  console.log('Agriculture stats seeded.');

  // 20. Horticulture Stats
  const hortStats = {
    area: 209.0,
    production: 350.0,
    midhPhysical: 0,
    midhTotal: 0.0,
    rkvmPhysical: 0,
    rkvmTotal: 0.0,
  };
  await upsertSingleRow(prisma.horticultureStats, hortStats);
  console.log('Horticulture stats seeded.');

  // 21. Animal Husbandry Stats
  const ahStats = {
    cattle: 1910,
    buffaloes: 166,
    sheep: 4753,
    goats: 546,
    vaccination: 7375,
    insurance: 0,
    projects: 0,
    subsidy: 0,
    fodderDev: 0,
    targetFodder: 0,
    pashubheemaInsured: 0,
    treatedSanchara: 0,
    gokulamInaugurated: 3,
    gokulamSanctioned: 0,
    nlmSanctioned: 0,
    nlmCompleted: 0,
    nlmInProgress: 0,
    nlmSubsidy: 0,
  };
  await upsertSingleRow(prisma.animalHusbandryStats, ahStats);
  console.log('Animal Husbandry stats seeded.');

  // 22. VOs & SHG
  const voGroups = [
    { voName: 'Allamalik', village: 'Gorantla', members: 45, president: 'Saraswathi', phone: '9440111111', status: 'ACTIVE' },
    { voName: 'Chaithanya', village: 'Gorantla', members: 35, president: 'Suseela', phone: '9440122222', status: 'ACTIVE' },
    { voName: 'Chamanthi', village: 'Gorantla', members: 40, president: 'Lakshmidevi', phone: '9440133333', status: 'ACTIVE' },
    { voName: 'Eswaralla', village: 'Gorantla', members: 50, president: 'Gangarathnamma', phone: '9440144444', status: 'ACTIVE' },
    { voName: 'Gandhiji', village: 'Gorantla', members: 45, president: 'Anitha Lakshmi', phone: '9440155555', status: 'ACTIVE' },
  ];
  for (const vo of voGroups) {
    await upsertByKey(prisma.voGroup, 'voName', vo.voName, vo);
  }

  const shgStats = {
    totalSHGs: 555,
    activeSHGs: 555,
    loans: 15000000.0,
    savings: 5000000.0,
    recovery: 98.5,
    pmjby: 120,
    pmsby: 150,
    unnati: 85,
    nutriGardens: 250,
    sriNidhi: 450000.0,
  };
  await upsertSingleRow(prisma.shgStats, shgStats);
  console.log('VO Groups & SHG stats seeded.');

  // 23. Community Assets
  const commAssets = [
    { name: 'Community Hall', location: 'Gorantla Center', condition: 'EXCELLENT', remarks: 'Fully operational' },
    { name: 'Panchayat Library', location: 'Main Bazar', condition: 'GOOD', remarks: 'Equipped with digital computers and internet' },
    { name: 'Solid Waste Management SWPC Shed', location: 'Gorantla Outskirts', condition: 'GOOD', remarks: 'SWPC Shed active' },
  ];
  for (const ca of commAssets) {
    await upsertByKey(prisma.communityAssetItem, 'name', ca.name, ca);
  }
  console.log('Community Assets seeded.');

  // 24. Pension Records Tabular Seeding
  console.log('Seeding Pension Records from JSON...');
  const pensionRecordCount = await prisma.pensionRecord.count();
  if (pensionRecordCount === 0) {
    // Read local JSON file
    const fs = require('fs');
    const path = require('path');
    const rawData = fs.readFileSync(path.join(__dirname, '../pension_records.json'), 'utf8');
    const pensionRecordsList = JSON.parse(rawData);
    
    console.log(`Found ${pensionRecordsList.length} pension records in JSON. Inserting in chunks...`);
    
    // Chunk size of 500
    const CHUNK_SIZE = 500;
    for (let i = 0; i < pensionRecordsList.length; i += CHUNK_SIZE) {
      const chunk = pensionRecordsList.slice(i, i + CHUNK_SIZE);
      await prisma.pensionRecord.createMany({
        data: chunk,
        skipDuplicates: true,
      });
      console.log(`Inserted chunk ${Math.floor(i / CHUNK_SIZE) + 1} (${chunk.length} records)`);
    }
    console.log('Pension Records seeding completed.');
  } else {
    console.log(`Pension Records already exist (${pensionRecordCount} items). Skipping JSON seed.`);
  }

  console.log('Database seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('Error during database seed execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
