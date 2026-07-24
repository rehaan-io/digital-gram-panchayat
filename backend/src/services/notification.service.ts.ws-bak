import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {
  /**
   * Creates a notification in the database and simulates sending an FCM push notification.
   */
  static async sendNotification(params: {
    userId: string;
    title: string;
    message: string;
    ticketId?: string;
  }) {
    const { userId, title, message, ticketId } = params;

    try {
      // 1. Save to Database
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          ticketId,
        },
        include: {
          user: {
            select: {
              fullName: true,
              role: true,
              fcmToken: true,
            },
          },
        },
      });

      // 2. Log mock/simulation to console
      console.log('\n==================================================');
      console.log(`🔔 [NOTIFICATION SEND - REAL/MOCK FCM]`);
      console.log(`To User   : ${notification.user.fullName} (${notification.user.role})`);
      console.log(`User ID   : ${userId}`);
      console.log(`Title     : ${title}`);
      console.log(`Message   : ${message}`);
      if (ticketId) console.log(`Ticket ID : ${ticketId}`);
      if (notification.user.fcmToken) console.log(`FCM Token : ${notification.user.fcmToken}`);
      console.log('==================================================\n');

      // 3. Deliver Real-Time Push Notification via Expo Push Service
      const fcmToken = notification.user.fcmToken;
      if (fcmToken) {
        // Send asynchronously to prevent blocking request threads
        (async () => {
          try {
            const pushResponse = await fetch('https://exp.host/--/api/v2/push/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({
                to: fcmToken,
                sound: 'background.mp3',
                channelId: 'ggp-notifications',
                title: title,
                body: message,
                data: { ticketId, notificationId: notification.id },
              }),
            });

            if (pushResponse.ok) {
              const result = (await pushResponse.json()) as any;
              const details = result.data;
              
              // If the device token is invalid or no longer active, clean it from DB
              if (details && details.status === 'error' && details.details?.error === 'DeviceNotRegistered') {
                console.log(`🧹 FCM Token invalid/unregistered. Cleaning token for user ${userId}`);
                await prisma.user.update({
                  where: { id: userId },
                  data: { fcmToken: null },
                });
              }
            }
          } catch (pushErr) {
            console.error('Failed to dispatch push packet:', pushErr);
          }
        })();
      }

      return notification;
    } catch (error) {
      console.error('Failed to create/send notification:', error);
    }
  }

  /**
   * Broadcasts an announcement notification to all Citizens.
   */
  static async broadcastAnnouncement(announcementId: string, title: string, content: string) {
    try {
      // Fetch all citizens with their fcmTokens
      const citizens = await prisma.user.findMany({
        where: { role: 'CITIZEN' },
        select: { id: true, fcmToken: true },
      });

      console.log(`📢 Broadcasting announcement notification to ${citizens.length} citizens...`);

      const notificationsData = citizens.map((citizen) => ({
        userId: citizen.id,
        title: `Panchayat Announcement: ${title}`,
        message: content.length > 80 ? content.substring(0, 77) + '...' : content,
      }));

      // Create all in database (Prisma createMany)
      await prisma.notification.createMany({
        data: notificationsData,
      });

      // Fetch created notifications to grab their IDs for push notification data payload
      const createdNotifications = await prisma.notification.findMany({
        where: {
          userId: { in: citizens.map(c => c.id) },
          title: `Panchayat Announcement: ${title}`,
        },
        orderBy: { createdAt: 'desc' },
        take: citizens.length,
      });

      // Construct push packets
      const pushPackets = citizens
        .filter((citizen) => citizen.fcmToken)
        .map((citizen) => {
          const matchingDbNotif = createdNotifications.find(n => n.userId === citizen.id);
          return {
            to: citizen.fcmToken,
            sound: 'background.mp3',
            channelId: 'ggp-notifications',
            title: `Panchayat Announcement: ${title}`,
            body: content.length > 80 ? content.substring(0, 77) + '...' : content,
            data: { notificationId: matchingDbNotif?.id },
          };
        });

      if (pushPackets.length > 0) {
        // Send asynchronously to not block threads
        (async () => {
          try {
            for (let i = 0; i < pushPackets.length; i += 100) {
              const batch = pushPackets.slice(i, i + 100);
              const pushResponse = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                },
                body: JSON.stringify(batch),
              });
              if (!pushResponse.ok) {
                console.error('Failed to send batch push notifications for announcement');
              }
            }
          } catch (pushErr) {
            console.error('Failed to dispatch broadcast push packets:', pushErr);
          }
        })();
      }

      console.log(`📢 Broadcast complete.`);
    } catch (error) {
      console.error('Failed to broadcast announcement:', error);
    }
  }

  /**
   * Sends notification to all Admins.
   */
  static async notifyAdmins(title: string, message: string, ticketId?: string) {
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      for (const admin of admins) {
        await this.sendNotification({
          userId: admin.id,
          title,
          message,
          ticketId,
        });
      }
    } catch (error) {
      console.error('Failed to notify admins:', error);
    }
  }
}
