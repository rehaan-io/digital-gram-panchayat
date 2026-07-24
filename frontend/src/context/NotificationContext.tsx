import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useAudioPlayer } from 'expo-audio';
import { useAuth, API_BASE_URL } from './AuthContext';
import { useSnackbar } from './SnackbarContext';
import { useSocket } from './SocketContext';
import * as RootNavigation from '../navigation/RootNavigation';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  ticketId?: string;
  createdAt: string;
}

interface NotificationContextProps {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

// Configure foreground notification behavior: show banner & list but do NOT play default sound (we play custom sound manually)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Preload foreground audio player
  const foregroundPlayer = useAudioPlayer(require('../../assets/fore_ground.mp3'));

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const registerForPushNotifications = useCallback(async () => {
    if (!token) return;

    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return;
    }

    try {
      // 1. Check/request permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notifications (permission denied)');
        return;
      }

      // 2. Fetch Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) {
        console.warn('EAS Project ID not found in Constants. Setup app.json.');
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      const pushToken = tokenData.data;
      console.log('Generated Expo Push Token:', pushToken);

      // 3. Register on Android: Create custom channel with background.mp3 sound
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('ggp-notifications', {
          name: 'GGP Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#820263',
          sound: 'background.mp3', // base filename of the bundled resource
        });
      }

      // 4. Save push token to backend
      const response = await fetch(`${API_BASE_URL}/notifications/fcm-token`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fcmToken: pushToken }),
      });

      if (!response.ok) {
        console.error('Failed to register push token with backend');
      } else {
        console.log('Push token successfully registered with backend');
      }
    } catch (err) {
      console.error('Error setting up push notifications:', err);
    }
  }, [token]);

  const playForegroundSound = useCallback(async () => {
    try {
      if (foregroundPlayer) {
        foregroundPlayer.seekTo(0);
        foregroundPlayer.play();
      }
    } catch (error) {
      console.error('Failed to play foreground notification sound:', error);
    }
  }, [foregroundPlayer]);

  const markAsRead = useCallback(async (id: string) => {
    if (!token) return;
    try {
      // Optimistic update
      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      fetchNotifications();
    }
  }, [token, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    try {
      // Optimistic update
      setNotifications((prev) => (Array.isArray(prev) ? prev : []).map((n) => ({ ...n, isRead: true })));
      await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      fetchNotifications();
    }
  }, [token, fetchNotifications]);

  const deleteNotification = useCallback(async (id: string) => {
    if (!token) return;
    try {
      // Optimistic update
      setNotifications((prev) => (Array.isArray(prev) ? prev : []).filter((n) => n.id !== id));
      await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      fetchNotifications();
    }
  }, [token, fetchNotifications]);

  // Setup push token registration and foreground listener hook
  useEffect(() => {
    if (!token) return;

    // Trigger push registration
    registerForPushNotifications();

    // Listen for foreground notifications (via Expo push, if any)
    const notificationSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Foreground notification received (Expo):', notification);
      // Play foreground sound!
      playForegroundSound();
      // Show in-app banner popup
      const { title, body } = notification.request.content;
      if (title || body) {
        showSnackbar(`${title || 'Notification'}: ${body || ''}`, 'info');
      }
      // Refresh list
      fetchNotifications();
    });

    // Listen for notifications clicked/tapped (background/foreground deep linking!)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped/responded:', response);
      const data = response.notification.request.content.data;
      if (data && data.ticketId) {
        console.log('Navigating to TicketDetail for ticketId:', data.ticketId);
        RootNavigation.navigate('TicketDetail', { ticketId: data.ticketId });
      }
    });

    return () => {
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, [token, registerForPushNotifications, playForegroundSound, fetchNotifications, showSnackbar]);

  // Basic fetch whenever token changes
  useEffect(() => {
    if (token) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [token, fetchNotifications]);

  const { socket, isConnected } = useSocket();

  // Missed Event Recovery (Sync state on socket reconnect)
  useEffect(() => {
    if (isConnected) {
      console.log('🔄 Socket.IO reconnected, syncing notifications feed...');
      fetchNotifications();
    }
  }, [isConnected, fetchNotifications]);

  // Listen for notification updates via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleNotificationCreated = (notification: any) => {
      console.log('📩 Socket.IO notification_created:', notification);
      
      // Play foreground sound!
      playForegroundSound();

      // Show in-app banner toast/snackbar
      showSnackbar(`${notification.title}: ${notification.message}`, 'info');

      // Refresh the notifications feed (unreadCount / list)
      fetchNotifications();
    };

    const handleAnnouncementBroadcast = (announcement: any) => {
      console.log('📩 Socket.IO announcement_broadcast:', announcement);
      
      // Play foreground sound!
      playForegroundSound();

      // Show announcement alert
      showSnackbar(`New Announcement: ${announcement.title}`, 'success');

      // Refresh list
      fetchNotifications();
    };

    socket.on('notification_created', handleNotificationCreated);
    socket.on('announcement_broadcast', handleAnnouncementBroadcast);

    return () => {
      socket.off('notification_created', handleNotificationCreated);
      socket.off('announcement_broadcast', handleAnnouncementBroadcast);
    };
  }, [socket, fetchNotifications, playForegroundSound, showSnackbar]);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications: safeNotifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
