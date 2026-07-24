import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, API_BASE_URL } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSnackbar } from '../../context/SnackbarContext';
import { CATEGORIES_MAP } from '../citizen/GenerateTicketScreen';
import { COLORS, globalStyles } from '../../styles/theme';

interface AssignedTicket {
  id: string;
  ticketId: string;
  category: string;
  title: string;
  status: string;
  location: string;
  createdAt: string;
}

// Localized getStatusColor helper to prevent relative path casing module imports
const getLocalStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { bg: COLORS.warningLight, text: COLORS.warning };
    case 'ACCEPTED':
      return { bg: COLORS.primaryLight, text: COLORS.primary };
    case 'REJECTED':
      return { bg: COLORS.errorLight, text: COLORS.error };
    case 'ASSIGNED':
      return { bg: '#F1F5F9', text: '#475569' };
    case 'ON_WAY':
      return { bg: '#FEF3C7', text: '#D97706' };
    case 'IN_PROGRESS':
      return { bg: '#FFEDD5', text: '#EA580C' };
    case 'COMPLETED':
      return { bg: '#D1FAE5', text: '#059669' };
    case 'VERIFIED':
      return { bg: COLORS.successLight, text: COLORS.success };
    case 'CLOSED':
      return { bg: '#E5E7EB', text: '#374151' }; // Slate Grey
    default:
      return { bg: COLORS.background, text: COLORS.textSecondary };
  }
};

const EmployeeDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, token, logout } = useAuth();
  const { t, language } = useLanguage();
  const { showSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState<'ASSIGNED' | 'RESOLVED' | 'LEAVES'>('ASSIGNED');
  const [tickets, setTickets] = useState<AssignedTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Leave system states
  const [leaves, setLeaves] = useState<any[]>([]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  const fetchTickets = async () => {
    setHasError(false);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load assigned tickets.');
      const data = await response.json();
      
      // Defensively check that data is an array
      if (Array.isArray(data)) {
        setTickets(data);
      } else {
        throw new Error('Received invalid data format from server.');
      }
    } catch (error: any) {
      console.error('Fetch tickets error:', error);
      setHasError(true);
      showSnackbar(error.message || 'Could not fetch complaints.', 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/modules/leaves/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setLeaves(data);
      }
    } catch (error) {
      console.error('Fetch leaves error:', error);
    }
  };

  const { socket, isConnected } = useSocket();

  useEffect(() => {
    fetchTickets();
    fetchLeaves();
  }, []);

  // Sync / Missed Event Recovery
  useEffect(() => {
    if (isConnected) {
      fetchTickets();
      fetchLeaves();
    }
  }, [isConnected]);

  // Real-Time Socket Updates
  useEffect(() => {
    if (!socket) return;

    const handleTicketEvent = (data: any) => {
      console.log('🔄 Real-time ticket event received in EmployeeDashboard:', data);
      fetchTickets();
    };

    socket.on('ticket_assigned', handleTicketEvent);
    socket.on('ticket_updated', handleTicketEvent);
    socket.on('ticket_in_progress', handleTicketEvent);
    socket.on('ticket_completed', handleTicketEvent);

    return () => {
      socket.off('ticket_assigned', handleTicketEvent);
      socket.off('ticket_updated', handleTicketEvent);
      socket.off('ticket_in_progress', handleTicketEvent);
      socket.off('ticket_completed', handleTicketEvent);
    };
  }, [socket]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTickets();
    fetchLeaves();
  };

  const handleApplyLeave = async () => {
    if (!leaveStart.trim() || !leaveEnd.trim() || !leaveReason.trim()) {
      Alert.alert('Validation Error', 'Start date, end date, and reason are required.');
      return;
    }
    setIsSubmittingLeave(true);
    try {
      const response = await fetch(`${API_BASE_URL}/modules/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startDate: leaveStart.trim(),
          endDate: leaveEnd.trim(),
          reason: leaveReason.trim(),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Leave request submitted successfully.');
        setLeaveStart('');
        setLeaveEnd('');
        setLeaveReason('');
        setShowLeaveForm(false);
        fetchLeaves();
      } else {
        Alert.alert('Error', data.message || 'Failed to submit leave request.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  // Safe checks for ticket array
  const activeCount = Array.isArray(tickets)
    ? tickets.filter((t) => ['ASSIGNED', 'ON_WAY', 'IN_PROGRESS'].includes(t.status)).length
    : 0;

  const resolvedCount = Array.isArray(tickets)
    ? tickets.filter((t) => ['COMPLETED', 'VERIFIED'].includes(t.status)).length
    : 0;

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

  const filteredTickets = Array.isArray(tickets)
    ? tickets.filter((t) => {
        if (activeTab === 'ASSIGNED') {
          return ['ASSIGNED', 'ON_WAY', 'IN_PROGRESS'].includes(t.status);
        } else {
          return ['COMPLETED', 'VERIFIED'].includes(t.status);
        }
      })
    : [];

  const renderItem = ({ item }: { item: AssignedTicket }) => {
    const statusTheme = getLocalStatusColor(item.status);
    return (
      <View style={styles.ticketContainer}>
        <View style={styles.ticketTop}>
          <View style={styles.cardHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{getLocalizedCategory(item.category)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusTheme.bg }]}>
              <Text style={[styles.statusText, { color: statusTheme.text }]}>{getStatusLocalized(item.status)}</Text>
            </View>
          </View>
          
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {language === 'te' ? 'స్థలం' : 'Location'}: {item.location}
          </Text>
        </View>

        <View style={styles.perforationRow}>
          <View style={styles.cutoutLeft} />
          <View style={styles.dashedLineContainer}>
            <View style={styles.dashedLine} />
          </View>
          <View style={styles.cutoutRight} />
        </View>

        <View style={styles.ticketBottom}>
          <View style={styles.bottomRowInfo}>
            <View>
              <Text style={styles.ticketLabel}>{language === 'te' ? 'టికెట్ ఐడి' : 'TICKET ID'}</Text>
              <Text style={styles.ticketIdText}>{item.ticketId}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.ticketLabel}>{language === 'te' ? 'తేదీ' : 'ASSIGNED'}</Text>
              <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
              style={styles.trackBtn}
            >
              <Text style={styles.trackBtnText}>{language === 'te' ? 'నవీకరించు' : 'Update Progress'}</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={globalStyles.container}>
      {/* Tabs segment */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ASSIGNED' && styles.activeTabBtn]}
          onPress={() => setActiveTab('ASSIGNED')}
        >
          <Text style={[styles.tabText, activeTab === 'ASSIGNED' && styles.activeTabText]}>
            {language === 'te' ? 'పనులు' : 'Active Wards'} ({activeCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'RESOLVED' && styles.activeTabBtn]}
          onPress={() => setActiveTab('RESOLVED')}
        >
          <Text style={[styles.tabText, activeTab === 'RESOLVED' && styles.activeTabText]}>
            {language === 'te' ? 'చరిత్ర' : 'History'} ({resolvedCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'LEAVES' && styles.activeTabBtn]}
          onPress={() => setActiveTab('LEAVES')}
        >
          <Text style={[styles.tabText, activeTab === 'LEAVES' && styles.activeTabText]}>
            {language === 'te' ? 'సెలవు' : 'Leaves'}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{language === 'te' ? 'పనులను లోడ్ చేస్తున్నాము...' : 'Fetching assignments...'}</Text>
        </View>
      ) : hasError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{language === 'te' ? 'పనులను నవీకరించడం విఫలమైంది.' : 'Could not sync tasks. Please check connection.'}</Text>
          <TouchableOpacity style={globalStyles.button} onPress={fetchTickets}>
            <Text style={globalStyles.buttonText}>{language === 'te' ? 'మళ్లీ ప్రయత్నించు' : 'Retry Sync'}</Text>
          </TouchableOpacity>
        </View>
      ) : activeTab === 'LEAVES' ? (
        <ScrollView style={{ flex: 1, padding: 16 }} keyboardShouldPersistTaps="handled">
          <View style={styles.leaveHeaderRow}>
            <Text style={styles.leaveHeading}>{language === 'te' ? 'సెలవు అభ్యర్థనలు' : 'My Leave Requests'}</Text>
            <TouchableOpacity 
              style={styles.applyLeaveBtn} 
              onPress={() => setShowLeaveForm(!showLeaveForm)}
            >
              <Text style={styles.applyLeaveBtnText}>
                {showLeaveForm ? (language === 'te' ? 'రద్దు చేయి' : 'Close Form') : (language === 'te' ? 'సెలవుకు దరఖాస్తు' : 'Apply Leave')}
              </Text>
            </TouchableOpacity>
          </View>

          {showLeaveForm && (
            <View style={styles.leaveFormCard}>
              <Text style={styles.formSectionTitle}>{language === 'te' ? 'నూతన సెలవు దరఖాస్తు' : 'New Leave Request'}</Text>
              
              <Text style={globalStyles.label}>{language === 'te' ? 'ప్రారంభ తేదీ (YYYY-MM-DD) *' : 'Start Date (YYYY-MM-DD) *'}</Text>
              <TextInput 
                style={globalStyles.input} 
                placeholder="2026-07-20" 
                placeholderTextColor={COLORS.textSecondary}
                value={leaveStart}
                onChangeText={setLeaveStart}
              />

              <Text style={globalStyles.label}>{language === 'te' ? 'ముగింపు తేదీ (YYYY-MM-DD) *' : 'End Date (YYYY-MM-DD) *'}</Text>
              <TextInput 
                style={globalStyles.input} 
                placeholder="2026-07-25" 
                placeholderTextColor={COLORS.textSecondary}
                value={leaveEnd}
                onChangeText={setLeaveEnd}
              />

              <Text style={globalStyles.label}>{language === 'te' ? 'కారణం *' : 'Reason *'}</Text>
              <TextInput 
                style={[globalStyles.input, { height: 70, textAlignVertical: 'top' }]} 
                placeholder="E.g., Medical treatment / Family function" 
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={3}
                value={leaveReason}
                onChangeText={setLeaveReason}
              />

              <TouchableOpacity 
                style={[globalStyles.button, { marginTop: 10 }]} 
                onPress={handleApplyLeave}
                disabled={isSubmittingLeave}
              >
                {isSubmittingLeave ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={globalStyles.buttonText}>{language === 'te' ? 'సమర్పించు' : 'Submit Leave Request'}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {leaves.map((l) => (
            <View key={l.id} style={styles.leaveCard}>
              <View style={styles.leaveCardHeader}>
                <Text style={styles.leaveDateRange}>
                  {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                </Text>
                <View style={[
                  styles.statusBadge, 
                  { 
                    backgroundColor: l.status === 'APPROVED' 
                      ? COLORS.successLight 
                      : l.status === 'REJECTED' 
                        ? COLORS.errorLight 
                        : COLORS.warningLight 
                  }
                ]}>
                  <Text style={[
                    styles.statusText, 
                    { 
                      color: l.status === 'APPROVED' 
                        ? COLORS.success 
                        : l.status === 'REJECTED' 
                          ? COLORS.error 
                          : COLORS.warning 
                    }
                  ]}>
                    {l.status}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <Text style={styles.leaveReasonText}>
                <Text style={{ fontWeight: 'bold' }}>{language === 'te' ? 'కారణం: ' : 'Reason: '}</Text>
                {l.reason}
              </Text>
              <Text style={styles.leaveAppliedDate}>
                {language === 'te' ? 'సమర్పించిన తేదీ: ' : 'Applied on: '}{new Date(l.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}

          {leaves.length === 0 && (
            <View style={styles.emptyLeavesView}>
              <Text style={styles.emptyLeavesText}>{language === 'te' ? 'సెలవు అభ్యర్థనలు ఏవీ లేవు.' : 'No leave requests submitted yet.'}</Text>
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <View style={styles.emptyIconPlaceholder}>
                <Text style={styles.emptyTextPrimary}>✔</Text>
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === 'ASSIGNED' ? (language === 'te' ? 'ఎటువంటి పనులు లేవు' : 'No Assigned Tickets') : (language === 'te' ? 'పూర్తయిన పనుల చరిత్ర లేదు' : 'No Resolved History')}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === 'ASSIGNED'
                  ? (language === 'te' ? 'మీకు ప్రస్తుతం ఎటువంటి పనులు కేటాయించబడలేదు.' : "You're all caught up! No active tasks are currently assigned to your profile.")
                  : (language === 'te' ? 'మీరు పూర్తి చేసిన పనులు ఇక్కడ కనిపిస్తాయి.' : 'Tasks resolved by you will appear in this history list.')}
              </Text>
              <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
                <Text style={styles.refreshBtnText}>{language === 'te' ? 'పనుల కోసం తనిఖీ చేయి' : 'Check for Tasks'}</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
};

export default EmployeeDashboard;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    marginVertical: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabBtn: {
    backgroundColor: COLORS.primaryLight,
  },
  tabText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primaryDark,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketIdText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2E294E',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
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
  titleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F1F1F',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  locationText: {
    fontSize: 13,
    color: '#595959',
    lineHeight: 18,
    fontWeight: '500',
  },
  ticketContainer: {
    marginBottom: 20,
    shadowColor: '#2E294E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 8,
    marginHorizontal: 16,
  },
  ticketTop: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 16,
  },
  perforationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: COLORS.background, // match app background
    zIndex: 2,
  },
  cutoutRight: {
    position: 'absolute',
    right: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.background,
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
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIconPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTextPrimary: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  refreshBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  refreshBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  leaveHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaveHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  applyLeaveBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  applyLeaveBtnText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: 'bold',
  },
  leaveFormCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  formSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  leaveCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    shadowColor: '#2E294E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  leaveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaveDateRange: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  leaveReasonText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  leaveAppliedDate: {
    fontSize: 10,
    color: '#A0AEC0',
    marginTop: 6,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  emptyLeavesView: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyLeavesText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
});
