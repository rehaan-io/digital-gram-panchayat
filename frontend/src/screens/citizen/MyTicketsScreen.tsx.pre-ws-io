import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { useAuth, API_BASE_URL } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { CATEGORIES_MAP } from './GenerateTicketScreen';
import { Ionicons } from '@expo/vector-icons';

interface Ticket {
  id: string;
  ticketId: string;
  category: string;
  title: string;
  description: string;
  location: string;
  status: string;
  createdAt: string;
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { bg: '#FEF3C7', text: '#D97706' }; // Warning Orange
    case 'ACCEPTED':
      return { bg: '#DBEAFE', text: '#2563EB' }; // Primary Blue
    case 'REJECTED':
      return { bg: '#FEE2E2', text: '#DC2626' }; // Error Red
    case 'ASSIGNED':
      return { bg: '#F3F4F6', text: '#4B5563' }; // Gray
    case 'ON_WAY':
      return { bg: '#FEF08A', text: '#A16207' }; // Yellow
    case 'IN_PROGRESS':
      return { bg: '#FFEDD5', text: '#EA580C' }; // Orange
    case 'COMPLETED':
      return { bg: '#D1FAE5', text: '#059669' }; // Emerald Green
    case 'VERIFIED':
      return { bg: '#DCFCE7', text: '#16A34A' }; // Bright Green
    case 'CLOSED':
      return { bg: '#E5E7EB', text: '#374151' }; // Slate Grey
    default:
      return { bg: '#F3F4F6', text: '#6B7280' };
  }
};

const MyTicketsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { token } = useAuth();
  const { t, language } = useLanguage();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load tickets.');
      const data = await response.json();
      setTickets(data);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Load Error', 'Could not load your complaints.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getStatusLocalized = (status: string) => {
    if (language === 'te') {
      switch (status) {
        case 'PENDING': return 'వేచి ఉంది';
        case 'ACCEPTED': return 'అంగీకరించబడింది';
        case 'REJECTED': return 'తిరస్కరించబడింది';
        case 'ASSIGNED': return 'కేటాయించబడింది';
        case 'ON_WAY': return 'ప్రయాణంలో ఉంది';
        case 'IN_PROGRESS': return 'పని జరుగుతోంది';
        case 'COMPLETED': return 'పూర్తయింది';
        case 'VERIFIED': return 'ధృవీకరించబడింది';
        default: return status;
      }
    }
    return status;
  };

  const getLocalizedCategory = (cat: string) => {
    const match = CATEGORIES_MAP.find(c => c.key === cat);
    return match ? (language === 'te' ? match.te : match.en) : cat;
  };

  const handleDeleteTicket = async (id: string, ticketId: string, status: string) => {
    const deleteable = ['PENDING', 'REJECTED', 'COMPLETED'];
    if (!deleteable.includes(status)) {
      Alert.alert(t('errorTitle'), 'You can only delete complaints that are Pending, Rejected, or Completed.');
      return;
    }

    Alert.alert(
      language === 'te' ? 'ఫిర్యాదును తొలగించు' : 'Delete Ticket',
      language === 'te' ? `ఈ ఫిర్యాదును (${ticketId}) మీరు తొలగించాలనుకుంటున్నారా?` : `Are you sure you want to delete ticket ${ticketId}?`,
      [
        { text: t('cancelBtn'), style: 'cancel' },
        {
          text: language === 'te' ? 'తొలగించు' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });

              const data = await response.json();
              if (!response.ok) throw new Error(data.message || 'Failed to delete ticket.');

              setTickets((prev) => prev.filter((t) => t.id !== id));
            } catch (error: any) {
              Alert.alert(t('errorTitle'), error.message);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Ticket }) => {
    const statusTheme = getStatusColor(item.status);
    const canDelete = ['PENDING', 'REJECTED', 'COMPLETED'].includes(item.status);

    return (
      <View style={styles.ticketContainer}>
        {/* TOP TICKET SECTION */}
        <View style={styles.ticketTop}>
          <View style={styles.cardHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{getLocalizedCategory(item.category)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusTheme.bg }]}>
              <Text style={[styles.statusText, { color: statusTheme.text }]}>
                {getStatusLocalized(item.status)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>
        </View>

        {/* DIVIDER SECTION WITH PERFORATION */}
        <View style={styles.perforationRow}>
          <View style={styles.cutoutLeft} />
          <View style={styles.dashedLineContainer}>
            {/* Creates a dashed line effect using flex and multiple small dots */}
            <View style={styles.dashedLine} />
          </View>
          <View style={styles.cutoutRight} />
        </View>

        {/* BOTTOM TICKET SECTION (Stub) */}
        <View style={styles.ticketBottom}>
          <View style={styles.bottomRowInfo}>
            <View>
              <Text style={styles.ticketLabel}>{language === 'te' ? 'టికెట్ ఐడి' : 'TICKET ID'}</Text>
              <Text style={styles.ticketIdText}>{item.ticketId}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.ticketLabel}>{language === 'te' ? 'తేదీ' : 'FILED ON'}</Text>
              <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            {canDelete && (
              <TouchableOpacity
                onPress={() => handleDeleteTicket(item.id, item.ticketId, item.status)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash" size={14} color="#F43F5E" />
                <Text style={styles.deleteBtnText}>{language === 'te' ? 'తొలగించు' : 'Delete'}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
              style={styles.trackBtn}
            >
              <Text style={styles.trackBtnText}>{language === 'te' ? 'పూర్తి వివరాలు' : 'View Details'}</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2E294E" />
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchTickets} colors={['#2E294E']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <Ionicons name="ticket-outline" size={64} color="#D2C4C0" style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>{t('noComplaintsTab')}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('GenerateTicket')}
                style={styles.fileComplaintBtn}
              >
                <Text style={styles.fileComplaintText}>{t('fileComplaint')}</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

export default MyTicketsScreen;

const APP_BG_COLOR = '#EADEDA'; // Dust Grey backdrop

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BG_COLOR,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketContainer: {
    marginBottom: 20,
    shadowColor: '#2E294E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 8,
  },
  /* Top Section */
  ticketTop: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4B5563',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F1F1F',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  descText: {
    fontSize: 13,
    color: '#595959',
    lineHeight: 18,
    fontWeight: '500',
  },
  
  /* Perforation Area */
  perforationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Keep background white so dashed line stays inside the card
    height: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  cutoutLeft: {
    position: 'absolute',
    left: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: APP_BG_COLOR,
    zIndex: 2,
  },
  cutoutRight: {
    position: 'absolute',
    right: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: APP_BG_COLOR,
    zIndex: 2,
  },
  dashedLineContainer: {
    flex: 1,
    height: 1,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  dashedLine: {
    height: 2,
    borderWidth: 1.5,
    borderColor: '#D2C4C0',
    borderStyle: 'dashed',
    borderRadius: 1,
  },

  /* Bottom Section */
  ticketBottom: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 20,
    paddingTop: 8,
  },
  bottomRowInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ticketLabel: {
    fontSize: 10,
    color: '#A0AEC0',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  ticketIdText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2E294E',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F1F1F',
  },
  
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFF1F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  deleteBtnText: {
    color: '#F43F5E',
    fontSize: 13,
    fontWeight: '800',
  },
  trackBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2E294E', // Space Indigo
    borderRadius: 12,
    marginLeft: 12,
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  
  /* Empty State */
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#595959',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  fileComplaintBtn: {
    backgroundColor: '#FFD400',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#FFD400',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  fileComplaintText: {
    color: '#2E294E',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
