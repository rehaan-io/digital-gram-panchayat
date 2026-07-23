import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, API_BASE_URL } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { COLORS, globalStyles } from '../../styles/theme';

interface AnalyticsData {
  totals: {
    citizens: number;
    employees: number;
    tickets: number;
  };
  statusDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  employeeWorkload: Array<{
    fullName: string;
    department: string | null;
    activeCount: number;
  }>;
}

const AdminDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { token, logout } = useAuth();
  const { t, language } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [broadcastModalVisible, setBroadcastModalVisible] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load dashboard metrics.');
      const data = await response.json();
      setAnalytics(data);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Load Error', 'Could not refresh admin metrics.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const getStatusLocalized = (status: string) => {
    switch (status) {
      case 'PENDING': return t('statusPending');
      case 'ACCEPTED': return t('statusAccepted');
      case 'REJECTED': return t('statusRejected');
      case 'ASSIGNED': return t('statusAssigned');
      case 'ON_WAY': return t('statusOnWay');
      case 'IN_PROGRESS': return t('statusInProgress');
      case 'COMPLETED': return t('statusCompleted');
      case 'VERIFIED': return t('statusVerified');
      default: return status;
    }
  };

  const submitBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastContent.trim()) {
      Alert.alert(t('errorTitle'), language === 'te' ? 'దయచేసి శీర్షిక మరియు కంటెంట్ రెండింటినీ పూరించండి.' : 'Please fill out both title and content.');
      return;
    }
    
    setIsBroadcasting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/homepage/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: broadcastTitle.trim(),
          content: broadcastContent.trim(),
        }),
      });

      if (!response.ok) throw new Error(t('announcementFailed'));
      
      Alert.alert(t('successTitle'), t('announcementSuccess'));
      setBroadcastModalVisible(false);
      setBroadcastTitle('');
      setBroadcastContent('');
      fetchAnalytics();
    } catch (err: any) {
      Alert.alert(t('errorTitle'), err.message);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleCreateAnnouncement = () => {
    setBroadcastModalVisible(true);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />}
    >
      {/* 1. Header Overview Tiles */}
      <View style={styles.statsRow}>
        <View style={styles.statTile}>
          <Text style={styles.statVal}>{analytics?.totals?.citizens ?? 0}</Text>
          <Text style={styles.statLabel}>{t('adminCitizens')}</Text>
        </View>

        <View style={styles.statTile}>
          <Text style={styles.statVal}>{analytics?.totals?.employees ?? 0}</Text>
          <Text style={styles.statLabel}>{t('adminStaff')}</Text>
        </View>

        <View style={styles.statTile}>
          <Text style={styles.statVal}>{analytics?.totals?.tickets ?? 0}</Text>
          <Text style={styles.statLabel}>{t('adminTotalTickets')}</Text>
        </View>
      </View>

      {/* 2. Quick Admin Shortcuts */}
      <Text style={styles.sectionHeader}>{t('administrativeActions')}</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Employees')}>
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIconText}>STAFF</Text>
          </View>
          <Text style={styles.actionTitle}>{t('manageStaffTab')}</Text>
          <Text style={styles.actionSub}>{t('manageStaffSub')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Tickets')}>
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIconText}>TKT</Text>
          </View>
          <Text style={styles.actionTitle}>{t('manageTicketsTab')}</Text>
          <Text style={styles.actionSub}>{t('resolveTicketsSub')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('HomeScreen')}>
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIconText}>EDIT</Text>
          </View>
          <Text style={styles.actionTitle}>{t('editHomepageTitle')}</Text>
          <Text style={styles.actionSub}>{t('editHomepageSub')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleCreateAnnouncement}>
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIconText}>NEWS</Text>
          </View>
          <Text style={styles.actionTitle}>{t('broadcastNews')}</Text>
          <Text style={styles.actionSub}>{t('broadcastNewsSub')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>{t('logoutBtn')}</Text>
      </TouchableOpacity>
      
      {/* Beautiful Broadcast Modal */}
      <Modal visible={broadcastModalVisible} animationType="slide" transparent statusBarTranslucent>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity 
            style={styles.broadcastOverlay} 
            activeOpacity={1} 
            onPress={() => setBroadcastModalVisible(false)}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              style={styles.broadcastCard}
            >
              <View style={styles.broadcastHeader}>
                <View style={styles.broadcastIconBadge}>
                  <Ionicons name="megaphone" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.broadcastTitleText}>{t('broadcastNews')}</Text>
                <TouchableOpacity onPress={() => setBroadcastModalVisible(false)} style={styles.broadcastCloseIcon}>
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.broadcastForm}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.inputLabel}>{language === 'te' ? 'శీర్షిక' : 'Announcement Title'}</Text>
                <TextInput
                  style={styles.broadcastInput}
                  placeholder={language === 'te' ? 'ఉదా., నీటి సరఫరా అంతరాయం' : 'E.g., Water supply interruption'}
                  value={broadcastTitle}
                  onChangeText={setBroadcastTitle}
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.inputLabel}>{language === 'te' ? 'సందేశం కంటెంట్' : 'Message Content'}</Text>
                <TextInput
                  style={[styles.broadcastInput, styles.broadcastTextArea]}
                  placeholder={language === 'te' ? 'పూర్తి ప్రకటనను ఇక్కడ టైప్ చేయండి...' : 'Type the full announcement here...'}
                  value={broadcastContent}
                  onChangeText={setBroadcastContent}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  placeholderTextColor="#94A3B8"
                />

                <TouchableOpacity 
                  style={[styles.broadcastSubmitBtn, isBroadcasting && { opacity: 0.7 }]} 
                  onPress={submitBroadcast}
                  disabled={isBroadcasting}
                >
                  {isBroadcasting ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="send" size={18} color="#FFF" />
                      <Text style={styles.broadcastSubmitText}>{t('publishAnnouncement')}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* 3. Ticket Status Metrics */}
      <View style={globalStyles.card}>
        <Text style={styles.cardHeaderTitle}>{t('complaintStatusTracking')}</Text>
        <View style={styles.divider} />
        
        <View style={styles.metricsList}>
          {analytics?.statusDistribution && Object.entries(analytics.statusDistribution).map(([status, count]) => (
            <View key={status} style={styles.metricRow}>
              <Text style={styles.metricKey}>{getStatusLocalized(status)}</Text>
              <View style={styles.metricBarContainer}>
                <View 
                  style={[
                    styles.metricBar, 
                    { 
                      width: `${(analytics?.totals?.tickets ?? 0) > 0 ? (count / (analytics?.totals?.tickets ?? 1)) * 100 : 0}%`,
                      backgroundColor: COLORS.primary 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.metricVal}>{count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 4. Staff Workload Metrics */}
      <View style={globalStyles.card}>
        <Text style={styles.cardHeaderTitle}>{t('staffActiveWorkload')}</Text>
        <View style={styles.divider} />
        
        {analytics?.employeeWorkload && analytics.employeeWorkload.length > 0 ? (
          analytics.employeeWorkload.map((emp, index) => (
            <View key={index} style={styles.workloadRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.workloadName}>{emp.fullName}</Text>
                <Text style={styles.workloadDept}>{emp.department || 'General Services'}</Text>
              </View>
              <View style={styles.workloadBadge}>
                <Text style={styles.workloadBadgeText}>{emp.activeCount} {t('activeLabel')}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>{t('noEmployeeWorkload')}</Text>
        )}
      </View>

      {/* Bottom logout button removed for streamlined UI */ }
    </ScrollView>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  statTile: {
    flex: 0.31,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 38,
    height: 24,
    borderRadius: 6,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIconText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.primary,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  actionSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 14,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  metricsList: {
    marginTop: 4,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  metricKey: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    width: 90,
  },
  metricBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  metricBar: {
    height: '100%',
    borderRadius: 4,
  },
  metricVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
    width: 24,
    textAlign: 'right',
  },
  workloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  workloadName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  workloadDept: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  workloadBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  workloadBadgeText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  noData: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 32,
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: 15,
  },
  /* Broadcast Modal Styles */
  broadcastOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  broadcastCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
    maxHeight: '90%',
  },
  broadcastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  broadcastIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  broadcastTitleText: {
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },
  broadcastCloseIcon: {
    padding: 4,
  },
  broadcastForm: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  broadcastInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#334155',
    marginBottom: 20,
  },
  broadcastTextArea: {
    minHeight: 120,
  },
  broadcastSubmitBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  broadcastSubmitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
