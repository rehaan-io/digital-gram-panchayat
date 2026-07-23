import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthenticatedRequest, requireRole } from '../middleware/auth.middleware';
import { NotificationService } from '../services/notification.service';

const router = Router();
const prisma = new PrismaClient();

// 1. GET ALL HOMEPAGE SECTIONS
router.get('/', async (req: Request, res: Response) => {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: { key: 'asc' },
    });
    return res.status(200).json(sections);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 2. GET SPECIFIC SECTION
router.get('/:key', async (req: Request, res: Response) => {
  const { key } = req.params;

  try {
    const section = await prisma.homepageSection.findUnique({
      where: { key },
    });

    if (!section) {
      return res.status(404).json({ message: 'Homepage section not found.' });
    }

    return res.status(200).json(section);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 3. EDIT HOMEPAGE SECTION (Admin Only)
router.put(
  '/:key',
  authenticateJWT,
  requireRole(['ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    const { key } = req.params;
    const { title, content, titleTe, contentTe } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    try {
      const section = await prisma.homepageSection.upsert({
        where: { key },
        update: { title, content, titleTe, contentTe },
        create: { key, title, content, titleTe, contentTe },
      });

      // Optional: Broadcast notice to citizens that portal details were updated
      await NotificationService.notifyAdmins(
        'Homepage Updated',
        `The homepage section "${title}" was updated by ${req.user!.username}.`
      );

      return res.status(200).json({
        message: `Homepage section "${title}" updated successfully.`,
        section,
      });
    } catch (error: any) {
      console.error('Update section error:', error);
      return res.status(500).json({ message: 'Server error: ' + error.message });
    }
  }
);

// 4. CREATE ANNOUNCEMENT (Admin Only, broadcasts notification)
router.post(
  '/announcements',
  authenticateJWT,
  requireRole(['ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    const { title, content, titleTe, contentTe } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    try {
      const announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          titleTe,
          contentTe,
          adminId: req.user!.id,
        },
      });

      // Broadcast to all citizens
      await NotificationService.broadcastAnnouncement(announcement.id, title, content);

      return res.status(201).json({
        message: 'Announcement posted and broadcasted successfully.',
        announcement,
      });
    } catch (error: any) {
      console.error('Post announcement error:', error);
      return res.status(500).json({ message: 'Server error: ' + error.message });
    }
  }
);

// 5. GET ALL ANNOUNCEMENTS
router.get('/announcements/list', async (req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      include: {
        admin: {
          select: { fullName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = announcements.map((ann) => ({
      id: ann.id,
      title: ann.title,
      content: ann.content,
      titleTe: ann.titleTe,
      contentTe: ann.contentTe,
      postedBy: ann.admin.fullName,
      createdAt: ann.createdAt,
    }));

    return res.status(200).json(formatted);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

export default router;
