import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateJWT);

// 1. GET ALL USER NOTIFICATIONS
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(notifications);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 2. MARK SPECIFIC NOTIFICATION AS READ
router.patch('/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 3. MARK ALL AS READ
router.patch('/read-all', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 4. UPDATE USER'S FCM TOKEN
router.put('/fcm-token', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { fcmToken } = req.body;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { fcmToken: fcmToken || null },
    });

    return res.status(200).json({ message: 'FCM token updated successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 5. DELETE SPECIFIC NOTIFICATION
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    await prisma.notification.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Notification deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

export default router;
