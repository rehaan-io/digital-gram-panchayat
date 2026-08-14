import { Router, Request, Response, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthenticatedRequest, requireRole } from '../middleware/auth.middleware';
import { upload, compressImage } from '../middleware/upload.middleware';
import { getUploadUrl } from '../config/storage';

const router = Router();
const prisma = new PrismaClient();

// Helper to check admin access
const requireAdmin: RequestHandler[] = [
  authenticateJWT as RequestHandler,
  requireRole(['ADMIN']) as RequestHandler
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. ABOUT GP & OFFICIALS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/about-gp', (async (req: Request, res: Response) => {
  try {
    let about = await prisma.aboutGP.findFirst();
    if (!about) {
      about = await prisma.aboutGP.create({
        data: {
          gpName: 'Gorantla', mandal: 'Gorantla', district: 'Sri Sathya Sai',
          formationDetails: 'Proceedings of District Collector', proceedingsNumber: 'D-Collector-Ref-2024',
          gpExtent: '15.52 Sq Km', panchayatSecretary: 'Ravindra Kumar P', executiveOfficer: 'Ashok Kumar',
          malePopulation: 12331, femalePopulation: 12255, population: 24586,
          scPopulation: 1560, stPopulation: 657, totalAssessments: 7604, auditStatus: 'Audited and Approved'
        }
      });
    }
    return res.json(about);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/about-gp', ...requireAdmin, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    const about = await prisma.aboutGP.findFirst();
    if (!about) return res.status(404).json({ message: 'About GP details not found.' });
    
    const data = { ...req.body };
    if (data.malePopulation !== undefined) data.malePopulation = parseInt(data.malePopulation) || 0;
    if (data.femalePopulation !== undefined) data.femalePopulation = parseInt(data.femalePopulation) || 0;
    data.population = (data.malePopulation || 0) + (data.femalePopulation || 0);
    if (data.scPopulation !== undefined) data.scPopulation = parseInt(data.scPopulation) || 0;
    if (data.stPopulation !== undefined) data.stPopulation = parseInt(data.stPopulation) || 0;
    if (data.totalAssessments !== undefined) data.totalAssessments = parseInt(data.totalAssessments) || 0;

    const updated = await prisma.aboutGP.update({
      where: { id: about.id },
      data
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// Officials CRUD
router.get('/officials', (async (req: Request, res: Response) => {
  try {
    const officials = await prisma.official.findMany({ orderBy: { name: 'asc' } });
    return res.json(officials);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.post('/officials', ...requireAdmin, upload.single('photo'), compressImage, (async (req: any, res: Response) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.photo = getUploadUrl(req.file.filename);
    }
    const official = await prisma.official.create({ data });
    return res.status(201).json(official);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/officials/:id', ...requireAdmin, upload.single('photo'), compressImage, (async (req: any, res: Response) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.photo = getUploadUrl(req.file.filename);
    }
    const official = await prisma.official.update({
      where: { id: req.params.id },
      data
    });
    return res.json(official);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.delete('/officials/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    await prisma.official.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Official deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// ─────────────────────────────────────────────────────────────────────────────
// 2. WATER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
router.get('/water-details', (async (req: Request, res: Response) => {
  try {
    let details = await prisma.waterDetails.findFirst();
    if (!details) {
      details = await prisma.waterDetails.create({
        data: {
          totalWaterSchemes: 25, privateConnections: 2643, publicConnections: 1500,
          handPumps: 12, privateTapFeeDemand: 1268640, totalOHSRs: 4, totalGLSRs: 9, totalDirectPumping: 0
        }
      });
    }
    return res.json(details);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/water-details', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const details = await prisma.waterDetails.findFirst();
    if (!details) return res.status(404).json({ message: 'Water details not found.' });

    const data = { ...req.body };
    if (data.totalWaterSchemes !== undefined) data.totalWaterSchemes = parseInt(data.totalWaterSchemes) || 0;
    if (data.privateConnections !== undefined) data.privateConnections = parseInt(data.privateConnections) || 0;
    if (data.publicConnections !== undefined) data.publicConnections = parseInt(data.publicConnections) || 0;
    if (data.handPumps !== undefined) data.handPumps = parseInt(data.handPumps) || 0;
    if (data.privateTapFeeDemand !== undefined) data.privateTapFeeDemand = parseFloat(data.privateTapFeeDemand) || 0;
    if (data.totalOHSRs !== undefined) data.totalOHSRs = parseInt(data.totalOHSRs) || 0;
    if (data.totalGLSRs !== undefined) data.totalGLSRs = parseInt(data.totalGLSRs) || 0;
    if (data.totalDirectPumping !== undefined) data.totalDirectPumping = parseInt(data.totalDirectPumping) || 0;

    const updated = await prisma.waterDetails.update({
      where: { id: details.id },
      data
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// OHSR CRUD
router.get('/ohsrs', (async (req: Request, res: Response) => {
  try {
    const list = await prisma.oHSR.findMany({ orderBy: { name: 'asc' } });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.post('/ohsrs', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.capacity !== undefined) data.capacity = parseFloat(data.capacity) || 0;
    if (data.pumpingCapacity !== undefined) data.pumpingCapacity = parseFloat(data.pumpingCapacity) || null;
    const item = await prisma.oHSR.create({ data });
    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/ohsrs/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.capacity !== undefined) data.capacity = parseFloat(data.capacity) || 0;
    if (data.pumpingCapacity !== undefined) data.pumpingCapacity = parseFloat(data.pumpingCapacity) || null;
    const item = await prisma.oHSR.update({
      where: { id: req.params.id },
      data
    });
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.delete('/ohsrs/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    await prisma.oHSR.delete({ where: { id: req.params.id } });
    return res.json({ message: 'OHSR deleted.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// GLSR CRUD
router.get('/glsrs', (async (req: Request, res: Response) => {
  try {
    const list = await prisma.gLSR.findMany({ orderBy: { name: 'asc' } });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.post('/glsrs', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.capacity !== undefined) data.capacity = parseFloat(data.capacity) || 0;
    if (data.pumpingCapacity !== undefined) data.pumpingCapacity = parseFloat(data.pumpingCapacity) || null;
    const item = await prisma.gLSR.create({ data });
    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/glsrs/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.capacity !== undefined) data.capacity = parseFloat(data.capacity) || 0;
    if (data.pumpingCapacity !== undefined) data.pumpingCapacity = parseFloat(data.pumpingCapacity) || null;
    const item = await prisma.gLSR.update({
      where: { id: req.params.id },
      data
    });
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.delete('/glsrs/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    await prisma.gLSR.delete({ where: { id: req.params.id } });
    return res.json({ message: 'GLSR deleted.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// Direct Pumping CRUD
router.get('/direct-pumpings', (async (req: Request, res: Response) => {
  try {
    const list = await prisma.directPumping.findMany({ orderBy: { pumpName: 'asc' } });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.post('/direct-pumpings', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.capacity !== undefined) data.capacity = parseFloat(data.capacity) || 0;
    const item = await prisma.directPumping.create({ data });
    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/direct-pumpings/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.capacity !== undefined) data.capacity = parseFloat(data.capacity) || 0;
    const item = await prisma.directPumping.update({
      where: { id: req.params.id },
      data
    });
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.delete('/direct-pumpings/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    await prisma.directPumping.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Direct pumping pump deleted.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// ─────────────────────────────────────────────────────────────────────────────
// 3. STREET LIGHT
// ─────────────────────────────────────────────────────────────────────────────
router.get('/street-light-details', (async (req: Request, res: Response) => {
  try {
    let details = await prisma.streetLightDetails.findFirst();
    if (!details) {
      details = await prisma.streetLightDetails.create({
        data: { totalPoles: 6000, totalLEDs: 2500, lightingStaff: 1 }
      });
    }
    return res.json(details);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/street-light-details', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const details = await prisma.streetLightDetails.findFirst();
    if (!details) return res.status(404).json({ message: 'Street Light details not found.' });

    const data = { ...req.body };
    if (data.totalPoles !== undefined) data.totalPoles = parseInt(data.totalPoles) || 0;
    if (data.totalLEDs !== undefined) data.totalLEDs = parseInt(data.totalLEDs) || 0;
    if (data.lightingStaff !== undefined) data.lightingStaff = parseInt(data.lightingStaff) || 0;

    const updated = await prisma.streetLightDetails.update({
      where: { id: details.id },
      data
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// Street Light Assets CRUD
router.get('/street-light-assets', (async (req: Request, res: Response) => {
  try {
    const assets = await prisma.streetLightAsset.findMany({ orderBy: { area: 'asc' } });
    return res.json(assets);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.post('/street-light-assets', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.poleCount !== undefined) data.poleCount = parseInt(data.poleCount) || 0;
    if (data.ledCount !== undefined) data.ledCount = parseInt(data.ledCount) || 0;
    if (data.lastMaintenance) data.lastMaintenance = new Date(data.lastMaintenance);

    const asset = await prisma.streetLightAsset.create({ data });
    return res.status(201).json(asset);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/street-light-assets/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.poleCount !== undefined) data.poleCount = parseInt(data.poleCount) || 0;
    if (data.ledCount !== undefined) data.ledCount = parseInt(data.ledCount) || 0;
    if (data.lastMaintenance) data.lastMaintenance = new Date(data.lastMaintenance);

    const asset = await prisma.streetLightAsset.update({
      where: { id: req.params.id },
      data
    });
    return res.json(asset);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.delete('/street-light-assets/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    await prisma.streetLightAsset.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Street Light Asset deleted.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// ─────────────────────────────────────────────────────────────────────────────
// 4. TAX & REVENUE
// ─────────────────────────────────────────────────────────────────────────────
router.get('/tax-revenue', (async (req: Request, res: Response) => {
  try {
    let tax = await prisma.taxRevenue.findFirst();
    if (!tax) {
      tax = await prisma.taxRevenue.create({
        data: {
          financialYear: '2025-2026', houseTax: 3109889.0, libraryCess: 249780.0,
          waterTax: 621929.0, lightingTax: 312348.0, drainageTax: 467302.0,
          sportsTax: 92723.0, fireCess: 30488.0, totalDemand: 4884459.0,
          houseTaxCollection: 3109889.0, collectionPercentage: 100.0,
          nonTaxDemand: 0, nonTaxCollection: 0, pendingAmount: 0,
          generalFund: 250000.0, tfc: 0, sfc: 0, ffc: 0, fifteenthFC: 1850000.0, otherGrants: 0
        }
      });
    }
    return res.json(tax);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/tax-revenue', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const tax = await prisma.taxRevenue.findFirst();
    if (!tax) return res.status(404).json({ message: 'Tax data not found.' });

    const data = { ...req.body };
    const floatFields = [
      'houseTax', 'libraryCess', 'waterTax', 'lightingTax', 'drainageTax', 'sportsTax', 'fireCess',
      'houseTaxCollection', 'nonTaxDemand', 'nonTaxCollection', 'generalFund', 'tfc', 'sfc', 'ffc', 'fifteenthFC', 'otherGrants'
    ];
    for (const field of floatFields) {
      if (data[field] !== undefined) data[field] = parseFloat(data[field]) || 0;
    }

    // Auto-calculate demand and pending
    const houseTaxVal = data.houseTax !== undefined ? data.houseTax : tax.houseTax;
    const libCessVal = data.libraryCess !== undefined ? data.libraryCess : tax.libraryCess;
    const waterTaxVal = data.waterTax !== undefined ? data.waterTax : tax.waterTax;
    const lightTaxVal = data.lightingTax !== undefined ? data.lightingTax : tax.lightingTax;
    const drainTaxVal = data.drainageTax !== undefined ? data.drainageTax : tax.drainageTax;
    const sportsTaxVal = data.sportsTax !== undefined ? data.sportsTax : tax.sportsTax;
    const fireCessVal = data.fireCess !== undefined ? data.fireCess : tax.fireCess;

    data.totalDemand = houseTaxVal + libCessVal + waterTaxVal + lightTaxVal + drainTaxVal + sportsTaxVal + fireCessVal;
    
    const collectionVal = data.houseTaxCollection !== undefined ? data.houseTaxCollection : tax.houseTaxCollection;
    data.collectionPercentage = houseTaxVal > 0 ? (collectionVal / houseTaxVal) * 100 : 0;
    data.pendingAmount = data.totalDemand - collectionVal;

    const updated = await prisma.taxRevenue.update({
      where: { id: tax.id },
      data
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// ─────────────────────────────────────────────────────────────────────────────
// 5. HEALTH
// ─────────────────────────────────────────────────────────────────────────────
router.get('/health-details', (async (req: Request, res: Response) => {
  try {
    let details = await prisma.healthDetails.findFirst();
    if (!details) {
      details = await prisma.healthDetails.create({
        data: { hospitalName: 'Gorantla Area PHC', healthCentre: 'Community Health Centre', ashaWorkers: 18, anms: 5 }
      });
    }
    return res.json(details);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/health-details', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const details = await prisma.healthDetails.findFirst();
    if (!details) return res.status(404).json({ message: 'Health details not found.' });

    const data = { ...req.body };
    if (data.ashaWorkers !== undefined) data.ashaWorkers = parseInt(data.ashaWorkers) || 0;
    if (data.anms !== undefined) data.anms = parseInt(data.anms) || 0;

    const updated = await prisma.healthDetails.update({
      where: { id: details.id },
      data
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// Health Staff CRUD
router.get('/health-staff', (async (req: Request, res: Response) => {
  try {
    const staff = await prisma.healthStaff.findMany({ orderBy: { name: 'asc' } });
    return res.json(staff);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.post('/health-staff', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const staff = await prisma.healthStaff.create({ data: req.body });
    return res.status(201).json(staff);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/health-staff/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const staff = await prisma.healthStaff.update({
      where: { id: req.params.id },
      data: req.body
    });
    return res.json(staff);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.delete('/health-staff/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    await prisma.healthStaff.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Staff deleted.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// ─────────────────────────────────────────────────────────────────────────────
// 6. EDUCATION
// ─────────────────────────────────────────────────────────────────────────────
router.get('/schools', (async (req: Request, res: Response) => {
  try {
    const list = await prisma.school.findMany({ orderBy: { schoolName: 'asc' } });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.post('/schools', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    const b = parseInt(data.boys) || 0;
    const g = parseInt(data.girls) || 0;
    data.boys = b;
    data.girls = g;
    data.total = b + g;

    const item = await prisma.school.create({ data });
    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/schools/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    const b = parseInt(data.boys) || 0;
    const g = parseInt(data.girls) || 0;
    data.boys = b;
    data.girls = g;
    data.total = b + g;

    const item = await prisma.school.update({
      where: { id: req.params.id },
      data
    });
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.delete('/schools/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    await prisma.school.delete({ where: { id: req.params.id } });
    return res.json({ message: 'School deleted.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// ─────────────────────────────────────────────────────────────────────────────
// 7. ANGANWADI
// ─────────────────────────────────────────────────────────────────────────────
router.get('/anganwadi-stats', (async (req: Request, res: Response) => {
  try {
    let stats = await prisma.anganwadiStats.findFirst();
    if (!stats) {
      stats = await prisma.anganwadiStats.create({ data: { samChildren: 59, mamChildren: 85 } });
    }
    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/anganwadi-stats', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const stats = await prisma.anganwadiStats.findFirst();
    if (!stats) return res.status(404).json({ message: 'Stats not found.' });

    const data = { ...req.body };
    if (data.samChildren !== undefined) data.samChildren = parseInt(data.samChildren) || 0;
    if (data.mamChildren !== undefined) data.mamChildren = parseInt(data.mamChildren) || 0;

    const updated = await prisma.anganwadiStats.update({
      where: { id: stats.id },
      data
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// Anganwadi Centres CRUD
router.get('/anganwadi-centres', (async (req: Request, res: Response) => {
  try {
    const list = await prisma.anganwadiCentre.findMany({ orderBy: { centreName: 'asc' } });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.post('/anganwadi-centres', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    const b = parseInt(data.boys) || 0;
    const g = parseInt(data.girls) || 0;
    data.boys = b;
    data.girls = g;
    data.total = b + g;

    const item = await prisma.anganwadiCentre.create({ data });
    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/anganwadi-centres/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    const b = parseInt(data.boys) || 0;
    const g = parseInt(data.girls) || 0;
    data.boys = b;
    data.girls = g;
    data.total = b + g;

    const item = await prisma.anganwadiCentre.update({
      where: { id: req.params.id },
      data
    });
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.delete('/anganwadi-centres/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    await prisma.anganwadiCentre.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Anganwadi Centre deleted.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// ─────────────────────────────────────────────────────────────────────────────
// 8. MGNREGS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/mgnregs-details', (async (req: Request, res: Response) => {
  try {
    let details = await prisma.mgnregsDetails.findFirst();
    if (!details) {
      details = await prisma.mgnregsDetails.create({
        data: {
          jobCards: 2501, activeJobCards: 1204, works: 578, estimateCost: 65045000,
          gokulamSheds: 3, sramikaSanghalu: 22, completedGokulam: 3, inProgressGokulam: 0, notStartedGokulam: 0
        }
      });
    }
    return res.json(details);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/mgnregs-details', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const details = await prisma.mgnregsDetails.findFirst();
    if (!details) return res.status(404).json({ message: 'MGNREGS details not found.' });

    const data = { ...req.body };
    const intFields = [
      'jobCards', 'activeJobCards', 'works', 'gokulamSheds', 'sramikaSanghalu',
      'completedGokulam', 'inProgressGokulam', 'notStartedGokulam'
    ];
    for (const field of intFields) {
      if (data[field] !== undefined) data[field] = parseInt(data[field]) || 0;
    }
    if (data.estimateCost !== undefined) data.estimateCost = parseFloat(data.estimateCost) || 0;

    const updated = await prisma.mgnregsDetails.update({
      where: { id: details.id },
      data
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// MGNREGS Works CRUD
router.get('/mgnregs-works', (async (req: Request, res: Response) => {
  try {
    const list = await prisma.mgnregsWork.findMany({ orderBy: { workName: 'asc' } });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.post('/mgnregs-works', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.budget !== undefined) data.budget = parseFloat(data.budget) || 0;
    const item = await prisma.mgnregsWork.create({ data });
    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/mgnregs-works/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.budget !== undefined) data.budget = parseFloat(data.budget) || 0;
    const item = await prisma.mgnregsWork.update({
      where: { id: req.params.id },
      data
    });
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.delete('/mgnregs-works/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    await prisma.mgnregsWork.delete({ where: { id: req.params.id } });
    return res.json({ message: 'MGNREGS work deleted.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// ─────────────────────────────────────────────────────────────────────────────
// 9. PENSION
// ─────────────────────────────────────────────────────────────────────────────
router.get('/pension-categories', (async (req: Request, res: Response) => {
  try {
    const list = await prisma.pensionCategory.findMany({ orderBy: { category: 'asc' } });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.post('/pension-categories', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.beneficiaries !== undefined) data.beneficiaries = parseInt(data.beneficiaries) || 0;
    if (data.monthlyAmount !== undefined) data.monthlyAmount = parseFloat(data.monthlyAmount) || 0;
    const item = await prisma.pensionCategory.create({ data });
    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/pension-categories/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.beneficiaries !== undefined) data.beneficiaries = parseInt(data.beneficiaries) || 0;
    if (data.monthlyAmount !== undefined) data.monthlyAmount = parseFloat(data.monthlyAmount) || 0;
    const item = await prisma.pensionCategory.update({
      where: { id: req.params.id },
      data
    });
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.delete('/pension-categories/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    await prisma.pensionCategory.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Pension category deleted.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// ─────────────────────────────────────────────────────────────────────────────
// 10. AGRICULTURE
// ─────────────────────────────────────────────────────────────────────────────
router.get('/agriculture-stats', (async (req: Request, res: Response) => {
  try {
    let stats = await prisma.agricultureStats.findFirst();
    if (!stats) {
      stats = await prisma.agricultureStats.create({
        data: {
          cultivableLand: 2231.0, rabiArea: 311.0, landSown: 2012.0, groundnutQuintals: 400.0,
          polamBadies: 5, samplesCollected: 40, samplesAnalysed: 40, soilCards: 40, pmKisan: 1234, amountPaid: 5400000.0,
          cropInsuranceFarmers: 0, heavyRainAffectedFarmers: 0, heavyRainDamageArea: 0.0, heavyRainDamageAmount: 0.0
        }
      });
    }
    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/agriculture-stats', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const stats = await prisma.agricultureStats.findFirst();
    if (!stats) return res.status(404).json({ message: 'Stats not found.' });

    const data = { ...req.body };
    const floatFields = ['cultivableLand', 'rabiArea', 'landSown', 'groundnutQuintals', 'amountPaid', 'heavyRainDamageArea', 'heavyRainDamageAmount'];
    const intFields = ['polamBadies', 'samplesCollected', 'samplesAnalysed', 'soilCards', 'pmKisan', 'cropInsuranceFarmers', 'heavyRainAffectedFarmers'];
    
    for (const f of floatFields) {
      if (data[f] !== undefined) data[f] = parseFloat(data[f]) || 0;
    }
    for (const f of intFields) {
      if (data[f] !== undefined) data[f] = parseInt(data[f]) || 0;
    }

    const updated = await prisma.agricultureStats.update({
      where: { id: stats.id },
      data
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// ─────────────────────────────────────────────────────────────────────────────
// 11. HORTICULTURE
// ─────────────────────────────────────────────────────────────────────────────
router.get('/horticulture-stats', (async (req: Request, res: Response) => {
  try {
    let stats = await prisma.horticultureStats.findFirst();
    if (!stats) {
      stats = await prisma.horticultureStats.create({
        data: { area: 209.0, production: 350.0, midhPhysical: 0, midhTotal: 0.0, rkvmPhysical: 0, rkvmTotal: 0.0 }
      });
    }
    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/horticulture-stats', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const stats = await prisma.horticultureStats.findFirst();
    if (!stats) return res.status(404).json({ message: 'Stats not found.' });

    const data = { ...req.body };
    if (data.area !== undefined) data.area = parseFloat(data.area) || 0;
    if (data.production !== undefined) data.production = parseFloat(data.production) || 0;
    if (data.midhPhysical !== undefined) data.midhPhysical = parseInt(data.midhPhysical) || 0;
    if (data.midhTotal !== undefined) data.midhTotal = parseFloat(data.midhTotal) || 0;
    if (data.rkvmPhysical !== undefined) data.rkvmPhysical = parseInt(data.rkvmPhysical) || 0;
    if (data.rkvmTotal !== undefined) data.rkvmTotal = parseFloat(data.rkvmTotal) || 0;

    const updated = await prisma.horticultureStats.update({
      where: { id: stats.id },
      data
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// ─────────────────────────────────────────────────────────────────────────────
// 12. ANIMAL HUSBANDRY
// ─────────────────────────────────────────────────────────────────────────────
router.get('/animal-husbandry-stats', (async (req: Request, res: Response) => {
  try {
    let stats = await prisma.animalHusbandryStats.findFirst();
    if (!stats) {
      stats = await prisma.animalHusbandryStats.create({
        data: {
          cattle: 1910, buffaloes: 166, sheep: 4753, goats: 546, vaccination: 7375, insurance: 0, projects: 0, subsidy: 0,
          fodderDev: 0, targetFodder: 0, pashubheemaInsured: 0, treatedSanchara: 0, gokulamInaugurated: 3, gokulamSanctioned: 3,
          nlmSanctioned: 0, nlmCompleted: 0, nlmInProgress: 0, nlmSubsidy: 0
        }
      });
    }
    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/animal-husbandry-stats', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const stats = await prisma.animalHusbandryStats.findFirst();
    if (!stats) return res.status(404).json({ message: 'Stats not found.' });

    const data = { ...req.body };
    const floatFields = ['vaccination', 'insurance', 'projects', 'subsidy', 'fodderDev', 'targetFodder', 'nlmSubsidy'];
    const intFields = [
      'cattle', 'buffaloes', 'sheep', 'goats', 'pashubheemaInsured', 'treatedSanchara',
      'gokulamInaugurated', 'gokulamSanctioned', 'nlmSanctioned', 'nlmCompleted', 'nlmInProgress'
    ];

    for (const f of floatFields) {
      if (data[f] !== undefined) data[f] = parseFloat(data[f]) || 0;
    }
    for (const f of intFields) {
      if (data[f] !== undefined) data[f] = parseInt(data[f]) || 0;
    }

    const updated = await prisma.animalHusbandryStats.update({
      where: { id: stats.id },
      data
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// ─────────────────────────────────────────────────────────────────────────────
// 13. SHG & VO
// ─────────────────────────────────────────────────────────────────────────────
router.get('/shg-stats', (async (req: Request, res: Response) => {
  try {
    let stats = await prisma.shgStats.findFirst();
    if (!stats) {
      stats = await prisma.shgStats.create({
        data: { totalSHGs: 555, activeSHGs: 555, loans: 15000000, savings: 5000000, recovery: 98.5, pmjby: 120, pmsby: 150, unnati: 85, nutriGardens: 250, sriNidhi: 450000 }
      });
    }
    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/shg-stats', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const stats = await prisma.shgStats.findFirst();
    if (!stats) return res.status(404).json({ message: 'Stats not found.' });

    const data = { ...req.body };
    const floatFields = ['loans', 'savings', 'recovery', 'sriNidhi'];
    const intFields = ['totalSHGs', 'activeSHGs', 'pmjby', 'pmsby', 'unnati', 'nutriGardens'];

    for (const f of floatFields) {
      if (data[f] !== undefined) data[f] = parseFloat(data[f]) || 0;
    }
    for (const f of intFields) {
      if (data[f] !== undefined) data[f] = parseInt(data[f]) || 0;
    }

    const updated = await prisma.shgStats.update({
      where: { id: stats.id },
      data
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// VO Groups CRUD
router.get('/vo-groups', (async (req: Request, res: Response) => {
  try {
    const list = await prisma.voGroup.findMany({ orderBy: { voName: 'asc' } });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.post('/vo-groups', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.members !== undefined) data.members = parseInt(data.members) || 0;
    const item = await prisma.voGroup.create({ data });
    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/vo-groups/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.members !== undefined) data.members = parseInt(data.members) || 0;
    const item = await prisma.voGroup.update({
      where: { id: req.params.id },
      data
    });
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.delete('/vo-groups/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    await prisma.voGroup.delete({ where: { id: req.params.id } });
    return res.json({ message: 'VO Group deleted.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// ─────────────────────────────────────────────────────────────────────────────
// 14. COMMUNITY ASSETS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/community-assets', (async (req: Request, res: Response) => {
  try {
    const list = await prisma.communityAssetItem.findMany({ orderBy: { name: 'asc' } });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.post('/community-assets', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const item = await prisma.communityAssetItem.create({ data: req.body });
    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/community-assets/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const item = await prisma.communityAssetItem.update({
      where: { id: req.params.id },
      data: req.body
    });
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.delete('/community-assets/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    await prisma.communityAssetItem.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Community Asset deleted.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// ─────────────────────────────────────────────────────────────────────────────
// 15. CUSTOM SECTION FIELDS CRUD & CARD CREATION
// ─────────────────────────────────────────────────────────────────────────────
router.get('/custom-fields/:sectionKey', (async (req: Request, res: Response) => {
  try {
    const fields = await prisma.customSectionField.findMany({
      where: { sectionKey: req.params.sectionKey },
      orderBy: { createdAt: 'asc' }
    });
    return res.json(fields);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.post('/custom-fields', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const { sectionKey, fieldName, fieldValue } = req.body;
    if (!sectionKey || !fieldName || !fieldValue) {
      return res.status(400).json({ message: 'sectionKey, fieldName, and fieldValue are required.' });
    }
    const field = await prisma.customSectionField.create({
      data: { sectionKey, fieldName, fieldValue }
    });
    return res.status(201).json(field);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.put('/custom-fields/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const { fieldName, fieldValue } = req.body;
    const field = await prisma.customSectionField.update({
      where: { id: req.params.id },
      data: { fieldName, fieldValue }
    });
    return res.json(field);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.delete('/custom-fields/:id', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    await prisma.customSectionField.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Custom field deleted.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

router.post('/cards', ...requireAdmin, (async (req: Request, res: Response) => {
  try {
    const { key, title, content } = req.body;
    if (!key || !title || !content) {
      return res.status(400).json({ message: 'key, title, and content are required.' });
    }
    // Clean key formatting
    const formattedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
    
    // Check if key already exists
    const existing = await prisma.homepageSection.findUnique({ where: { key: formattedKey } });
    if (existing) {
      return res.status(400).json({ message: 'A card with this key already exists.' });
    }

    const card = await prisma.homepageSection.create({
      data: { key: formattedKey, title, content }
    });
    return res.status(201).json(card);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// ── EMPLOYEE LEAVE SYSTEM ENDPOINTS ──

// 1. APPLY FOR LEAVE
router.post('/leaves', authenticateJWT as RequestHandler, (async (req: AuthenticatedRequest, res: Response) => {
  const { startDate, endDate, reason } = req.body;

  if (!startDate || !endDate || !reason) {
    return res.status(400).json({ message: 'startDate, endDate, and reason are required.' });
  }

  try {
    // Find employee profile linked to user
    const employee = await prisma.employee.findUnique({
      where: { userId: req.user?.id },
    });

    if (!employee) {
      return res.status(403).json({ message: 'Employee profile not found.' });
    }

    const leave = await prisma.leave.create({
      data: {
        employeeId: employee.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason.trim(),
      },
    });

    return res.status(201).json({ message: 'Leave request submitted successfully.', leave });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// 2. GET CURRENT EMPLOYEE'S LEAVES
router.get('/leaves/my', authenticateJWT as RequestHandler, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { userId: req.user?.id },
    });

    if (!employee) {
      return res.status(403).json({ message: 'Employee profile not found.' });
    }

    const leaves = await prisma.leave.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(leaves);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as RequestHandler);

// 3. GET PAGINATED PENSION RECORDS
router.get('/pension-records', (async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';

    const offset = (page - 1) * limit;

    // Build query criteria
    let whereClause: any = {};
    if (search.trim() !== '') {
      whereClause = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { pensionId: { contains: search } },
          { mobileNumber: { contains: search } },
          { scheme: { contains: search, mode: 'insensitive' } },
          { sgswName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [totalRecords, records] = await Promise.all([
      prisma.pensionRecord.count({ where: whereClause }),
      prisma.pensionRecord.findMany({
        where: whereClause,
        orderBy: { sno: 'asc' },
        skip: offset,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return res.status(200).json({
      data: records,
      page,
      limit,
      totalRecords,
      totalPages,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
}) as RequestHandler);

export default router;
