import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications, NotificationItem } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, globalStyles } from '../styles/theme';

const formatRelativeTime = (dateString: string, lang: 'en' | 'te') => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (lang === 'te') {
    if (diffMins < 1) return 'ఇప్పుడే';
    if (diffMins < 60) return `${diffMins} ని. క్రితం`;
    if (diffHours < 24) return `${diffHours} గం. క్రితం`;
    if (diffDays === 1) return 'నిన్న';
    return date.toLocaleDateString('te-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  if (diffMins < 1) return 'Just Now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const getNotificationIcon = (title: string) => {
  const lowercaseTitle = title.toLowerCase();
  if (lowercaseTitle.includes('announcement')) {
    return { name: 'megaphone-outline', color: '#EAB308' }; // Gold
  }
  if (lowercaseTitle.includes('assigned') || lowercaseTitle.includes('reassigned') || lowercaseTitle.includes('deadline')) {
    return { name: 'person-add-outline', color: '#6366F1' }; // Indigo
  }
  if (lowercaseTitle.includes('completed') || lowercaseTitle.includes('verified') || lowercaseTitle.includes('accepted')) {
    return { name: 'checkmark-circle-outline', color: '#10B981' }; // Green
  }
  if (lowercaseTitle.includes('rejected') || lowercaseTitle.includes('error') || lowercaseTitle.includes('alert')) {
    return { name: 'alert-circle-outline', color: '#EF4444' }; // Red
  }
  return { name: 'mail-outline', color: '#0EA5E9' }; // Blue
};

const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const { t, language } = useLanguage();

  const handleNotificationPress = async (item: NotificationItem) => {
    if (!item.isRead) {
      await markAsRead(item.id);
    }
    if (item.ticketId) {
      navigation.navigate('TicketDetail', { ticketId: item.ticketId });
    }
  };

  const getLocalizedNotificationTitle = (title: string) => {
    if (language === 'te') {
      const lower = title.toLowerCase();
      if (lower.includes('announcement')) return 'అధికారిక పంచాయతీ ప్రకటన';
      if (lower.includes('assigned')) return 'ఫిర్యాదు కేటాయించబడింది';
      if (lower.includes('created')) return 'కొత్త ఫిర్యాదు నమోదైంది';
      if (lower.includes('status') || lower.includes('progress')) return 'ఫిర్యాదు పురోగతి నవీకరణ';
      if (lower.includes('resolved') || lower.includes('completed')) return 'ఫిర్యాదు పరిష్కరించబడింది';
      if (lower.includes('verified')) return 'ఫిర్యాదు ధృవీకరించబడింది';
    }
    return title;
  };

  const getLocalizedNotificationMessage = (msg: string) => {
    if (language === 'te') {
      const lower = msg.toLowerCase();
      if (lower.includes('has been assigned')) {
        return msg.replace('has been assigned to', 'కేటాయించబడింది:');
      }
      if (lower.includes('has been created')) {
        return msg.replace('has been created successfully', 'విజయవంతంగా నమోదైంది.');
      }
      if (lower.includes('status updated to')) {
        return msg.replace('status updated to', 'స్థితి నవీకరించబడింది:');
      }
      if (lower.includes('marked as completed')) {
        return msg.replace('marked as completed', 'పూర్తయినట్లు గుర్తించబడింది.');
      }
      if (lower.includes('has been verified')) {
        return msg.replace('has been verified and closed', 'ధృవీకరించబడింది మరియు మూసివేయబడింది.');
      }
    }
    return msg;
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const iconConfig = getNotificationIcon(item.title);
    return (
      <View style={[styles.notiCard, !item.isRead && styles.unreadNotiCard]}>
        <TouchableOpacity
          style={styles.cardMain}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${iconConfig.color}15` }]}>
            <Ionicons name={iconConfig.name as any} size={22} color={iconConfig.color} />
          </View>
          <View style={styles.contentContainer}>
            <View style={styles.notiHeader}>
              <Text style={[styles.notiTitle, !item.isRead && styles.unreadText]} numberOfLines={1}>
                {getLocalizedNotificationTitle(item.title)}
              </Text>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.notiMessage}>{getLocalizedNotificationMessage(item.message)}</Text>
            <Text style={styles.notiTime}>{formatRelativeTime(item.createdAt, language)}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteNotification(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={globalStyles.container}>
      <View style={styles.actionHeader}>
        <Text style={styles.countText}>
          {unreadCount === 0 
            ? (language === 'te' ? 'కొత్త నోటిఫికేషన్లు ఏవీ లేవు' : 'No unread notifications') 
            : (language === 'te' 
                ? `${unreadCount} కొత్త నోటిఫికేషన్(లు)` 
                : `${unreadCount} Unread Alert${unreadCount > 1 ? 's' : ''}`)}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.clearBtn} activeOpacity={0.6}>
            <Text style={styles.clearBtnText}>{t('markAllRead')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading && notifications.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchNotifications}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <Ionicons name="notifications-off-outline" size={48} color={COLORS.textSecondary} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>{language === 'te' ? 'అన్నీ చదివేశారు!' : "You're all caught up!"}</Text>
              <Text style={styles.emptySubtext}>
                {language === 'te' 
                  ? 'ప్రకటనలు మరియు ఫిర్యాదుల నవీకరణలు ఇక్కడ కనిపిస్తాయి.' 
                  : 'Announcements and complaint updates will show up here.'}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 6 }}
        />
      )}
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderColor: '#EFEAE6',
    backgroundColor: COLORS.surface,
  },
  countText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '800',
    fontFamily: 'System',
  },
  clearBtn: {
    backgroundColor: 'rgba(130, 2, 99, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  clearBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  notiCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EFEAE6',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    shadowColor: '#2E294E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  unreadNotiCard: {
    borderColor: '#E0E7FF',
    backgroundColor: '#F8FAFC',
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    paddingRight: 8,
  },
  notiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notiTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    flex: 1,
  },
  unreadText: {
    color: '#000000',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginLeft: 6,
  },
  notiMessage: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    fontFamily: 'System',
    marginBottom: 6,
  },
  notiTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 4,
    alignSelf: 'center',
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
