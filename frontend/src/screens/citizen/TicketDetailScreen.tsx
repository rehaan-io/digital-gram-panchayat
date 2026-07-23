import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomDateTimePicker from '../../components/CustomDateTimePicker';
import { useAuth, API_BASE_URL, FILE_BASE_URL } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { CATEGORIES_MAP } from './GenerateTicketScreen';
import { COLORS, globalStyles } from '../../styles/theme';
import { useSnackbar } from '../../context/SnackbarContext';
import { getStatusColor } from './MyTicketsScreen';

interface TimelineEvent {
  id: string;
  status: string;
  remarks: string | null;
  expectedCompletion: string | null;
  createdAt: string;
  actor?: {
    fullName: string;
    role: string;
  };
}

interface TicketDetail {
  id: string;
  ticketId: string;
  category: string;
  title: string;
  description: string;
  location: string;
  alternatePhone: string | null;
  issueImage: string | null;
  completionImage: string | null;
  status: string;
  rejectReason: string | null;
  remarks: string | null;
  expectedCompletion: string | null;
  createdAt: string;
  citizen?: {
    fullName: string;
    phone: string;
    email: string;
  };
  assignedEmployee?: {
    id: string;
    employeeId: string;
    department: string | null;
    user?: {
      fullName: string;
      phone: string;
    };
  } | null;
  timeline: TimelineEvent[];
}

const SnakeTimeline = ({ timeline, language, t, getStatusLocalized }: { timeline: TimelineEvent[], language: string, t: any, getStatusLocalized: any }) => {
  // Use useMemo to recreate Animated.Values if the timeline length changes (e.g. after data loads)
  const fadeAnim = React.useMemo(() => {
    return Array.from({ length: timeline?.length || 0 }).map(() => new Animated.Value(0));
  }, [timeline?.length]);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // State for the beautiful remarks modal
  const [remarksModalVisible, setRemarksModalVisible] = useState(false);
  const [selectedRemarks, setSelectedRemarks] = useState({ title: '', content: '', date: '' });

  const latestEventId = React.useMemo(() => {
    if (!timeline || timeline.length === 0) return null;
    let latest = timeline[0];
    for (const event of timeline) {
      if (new Date(event.createdAt).getTime() > new Date(latest.createdAt).getTime()) {
        latest = event;
      }
    }
    return latest.id;
  }, [timeline]);

  useEffect(() => {
    if (!fadeAnim || fadeAnim.length === 0) return;

    fadeAnim.forEach(anim => anim.setValue(0));
    
    Animated.stagger(250, 
      fadeAnim.map(anim => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false 
        })
      )
    ).start();
  }, [fadeAnim]);

  useEffect(() => {
    // Pulse animation for the latest event
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    );
    loop.start();
    
    return () => loop.stop();
  }, [pulseAnim]);

  const itemsPerRow = 2;
  const rows = [];
  for (let i = 0; i < timeline.length; i += itemsPerRow) {
    rows.push(timeline.slice(i, i + itemsPerRow));
  }

  return (
    <View style={styles.snakeContainer}>
      {rows.map((row, rowIndex) => {
        const isEven = rowIndex % 2 === 0;
        return (
          <View key={`row-${rowIndex}`} style={[styles.snakeRow, isEven ? { flexDirection: 'row' } : { flexDirection: 'row-reverse' }]}>
            {row.map((event, colIndex) => {
              const globalIndex = rowIndex * itemsPerRow + colIndex;
              const isLastInRow = colIndex === row.length - 1;
              const isLastOverall = globalIndex === timeline.length - 1;
              const statusTheme = getStatusColor(event.status);

              const isLatestEvent = event.id === latestEventId;

              return (
                <View key={event.id} style={styles.snakeItemWrapper}>
                   
                   {/* U-Turn Drop Line to next row to bypass the card */}
                   {isLastInRow && !isLastOverall && (
                     <Animated.View style={[
                       isEven ? styles.pathwayUTurnRight : styles.pathwayUTurnLeft, 
                       { opacity: fadeAnim[globalIndex] }
                     ]} />
                   )}

                   {/* PATHWAY TOP LAYER */}
                   <View style={styles.pathwayTopLayer}>
                     
                     {/* Horizontal Line connecting to next item in row */}
                     {!isLastInRow && (
                       <Animated.View style={[
                         styles.pathwayHorizontalLine, 
                         isEven ? { left: '50%' } : { right: '50%' },
                         { 
                           width: fadeAnim[globalIndex].interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                         }
                       ]} />
                     )}

                     {/* Pulsing Glow behind the node for the latest event */}
                     {isLatestEvent && (
                       <Animated.View style={[styles.pathwayNodeGlow, {
                          backgroundColor: statusTheme.text,
                          opacity: pulseAnim.interpolate({ inputRange: [1, 1.8], outputRange: [0.6, 0] }),
                          transform: [{ scale: pulseAnim }]
                       }]} />
                     )}

                     {/* The Filled Node Circle */}
                     <Animated.View style={[styles.pathwayNode, { 
                        backgroundColor: statusTheme.text,
                        transform: [{ scale: fadeAnim[globalIndex] }]
                     }]} />
                   </View>

                   {/* Vertical Stem connecting node to card */}
                   <Animated.View style={[styles.pathwayStem, {
                      height: fadeAnim[globalIndex].interpolate({ inputRange: [0, 1], outputRange: [0, 15] }),
                      opacity: fadeAnim[globalIndex]
                   }]} />
                   
                   {/* Card Content */}
                   <Animated.View style={[styles.snakeCard, { 
                      borderColor: statusTheme.text,
                      opacity: fadeAnim[globalIndex], 
                      transform: [{ translateY: fadeAnim[globalIndex].interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }]
                   }]}>
                      <TouchableOpacity 
                        style={styles.snakeCardInner}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedRemarks({
                            title: getStatusLocalized(event.status),
                            content: event.remarks || (language === 'te' ? 'ఎలాంటి వ్యాఖ్యలు లేవు.' : 'No remarks provided.'),
                            date: `${new Date(event.createdAt).toLocaleDateString()} ${new Date(event.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
                          });
                          setRemarksModalVisible(true);
                        }}
                      >
                        <View style={[styles.snakeBadge, { backgroundColor: statusTheme.bg }]}>
                          <Text style={[styles.snakeBadgeText, { color: statusTheme.text }]} numberOfLines={1}>
                            {getStatusLocalized(event.status)}
                          </Text>
                        </View>
                        
                        <Text style={styles.snakeActor} numberOfLines={1}>
                          <Ionicons name="person" size={10} color="#A0AEC0" /> {event.actor?.fullName || 'System'}
                        </Text>
                        
                        <Text style={styles.snakeDate}>
                          {new Date(event.createdAt).toLocaleDateString()} {new Date(event.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </Text>

                        {event.remarks && (
                          <View style={styles.remarksHint}>
                            <Ionicons name="chatbubble-ellipses" size={12} color="#A0AEC0" />
                          </View>
                        )}
                      </TouchableOpacity>
                   </Animated.View>

                </View>
              )
            })}
            
            {/* Fill empty slots in the row so flex stays aligned */}
            {row.length < itemsPerRow && Array.from({ length: itemsPerRow - row.length }).map((_, idx) => (
              <View key={`empty-${idx}`} style={styles.snakeItemWrapper} />
            ))}
          </View>
        )
      })}

      {/* Beautiful Bottom Sheet Modal for Remarks */}
      <Modal visible={remarksModalVisible} transparent animationType="slide">
        <View style={styles.bottomSheetOverlay}>
          <TouchableOpacity style={styles.bottomSheetDismiss} activeOpacity={1} onPress={() => setRemarksModalVisible(false)} />
          <View style={styles.bottomSheetCard}>
            <View style={styles.bottomSheetHandle} />
            <View style={styles.bottomSheetHeader}>
              <View style={styles.bottomSheetIconBadge}>
                <Ionicons name="chatbubbles" size={26} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bottomSheetTitle}>{language === 'te' ? 'వ్యాఖ్యలు' : 'Activity Remarks'}</Text>
                <Text style={styles.bottomSheetSubtitle}>{selectedRemarks.title} • {selectedRemarks.date}</Text>
              </View>
            </View>
            
            <View style={styles.bottomSheetContentContainer}>
              <ScrollView style={styles.bottomSheetScroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.bottomSheetContentText}>{selectedRemarks.content}</Text>
              </ScrollView>
            </View>

            <TouchableOpacity style={styles.bottomSheetCloseBtn} onPress={() => setRemarksModalVisible(false)}>
              <Text style={styles.bottomSheetCloseText}>{language === 'te' ? 'మూసివేయు' : 'Dismiss'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const TicketDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const { token, user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { t, language } = useLanguage();

  const acceptScale = useRef(new Animated.Value(1)).current;
  const rejectScale = useRef(new Animated.Value(1)).current;

  const animatePress = (scaleVar: Animated.Value, toVal: number) => {
    Animated.spring(scaleVar, {
      toValue: toVal,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        case 'CLOSED': return 'మూసివేయబడింది';
        default: return status;
      }
    }
    return status;
  };

  const getLocalizedCategory = (cat: string) => {
    const match = CATEGORIES_MAP.find(c => c.key === cat);
    return match ? (language === 'te' ? match.te : match.en) : cat;
  };
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [expectedDate, setExpectedDate] = useState(new Date());
  const [expectedTime, setExpectedTime] = useState(new Date());
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchTicketDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load ticket details.');
      const data = await response.json();
      setTicket(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not load details.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (user?.role !== 'ADMIN') return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
    fetchEmployees();
  }, [ticketId]);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'ACCEPTED', remarks: 'Ticket accepted by admin.' }),
      });
      if (!response.ok) throw new Error('Operation failed.');
      showSnackbar('Ticket accepted successfully.', 'success');
      fetchTicketDetails();
    } catch (err: any) {
      showSnackbar(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showSnackbar('Please enter a rejection reason.', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'REJECTED', rejectReason }),
      });
      if (!response.ok) throw new Error('Operation failed.');
      setShowRejectModal(false);
      showSnackbar('Ticket rejected.', 'success');
      fetchTicketDetails();
    } catch (err: any) {
      showSnackbar(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedEmp) {
      showSnackbar('Please select an employee.', 'warning');
      return;
    }

    const combined = new Date(
      expectedDate.getFullYear(), expectedDate.getMonth(), expectedDate.getDate(),
      expectedTime.getHours(), expectedTime.getMinutes(), 0
    );

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeUuid: selectedEmp,
          expectedCompletion: combined.toISOString(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Assignment failed.');

      setShowAssignModal(false);
      showSnackbar('Ticket assigned successfully.', 'success');
      fetchTicketDetails();
    } catch (err: any) {
      showSnackbar(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'VERIFIED', remarks: 'Work verified and closed.' }),
      });
      if (!response.ok) throw new Error('Verification failed.');
      showSnackbar('Ticket verified and resolved successfully.', 'success');
      fetchTicketDetails();
    } catch (err: any) {
      showSnackbar(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'CLOSED', remarks: 'Ticket closed. Images deleted from storage.' }),
      });
      if (!response.ok) throw new Error('Closing failed.');
      showSnackbar('Ticket closed and media removed successfully.', 'success');
      fetchTicketDetails();
    } catch (err: any) {
      showSnackbar(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTicket = async () => {
    Alert.alert(
      language === 'te' ? 'పూర్తిగా తొలగించు' : 'Permanently Delete',
      language === 'te' 
        ? 'ఈ టికెట్ యొక్క మొత్తం సమాచారాన్ని మరియు చరిత్రను శాశ్వతంగా తొలగించాలనుకుంటున్నారా?' 
        : 'Are you sure you want to permanently delete this ticket and all its history from history?',
      [
        { text: language === 'te' ? 'రద్దు చేయి' : 'Cancel', style: 'cancel' },
        {
          text: language === 'te' ? 'తొలగించు' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              if (!response.ok) throw new Error('Failed to delete ticket.');
              showSnackbar('Ticket history deleted successfully.', 'success');
              navigation.goBack();
            } catch (err: any) {
              showSnackbar(err.message, 'error');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };


  const handleEmployeeStatusUpdate = async (status: string) => {
    if (status === 'COMPLETED') {
      navigation.navigate('TicketAction', { ticketId: ticket?.id });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, remarks: `Status updated to ${status}.` }),
      });
      if (!response.ok) throw new Error('Status update failed.');
      showSnackbar('Status updated successfully.', 'success');
      fetchTicketDetails();
    } catch (err: any) {
      showSnackbar(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestHelp = () => {
    Alert.prompt(
      'Request Support',
      'Describe what help you need from the Administrator:',
      async (text) => {
        if (!text || !text.trim()) return;
        setIsProcessing(true);
        try {
          const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/request-help`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reason: text.trim() }),
          });
          if (!response.ok) throw new Error('Request failed.');
          showSnackbar('Support request sent.', 'success');
          fetchTicketDetails();
        } catch (err: any) {
          showSnackbar(err.message, 'error');
        } finally {
          setIsProcessing(false);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!ticket) return null;

  const statusTheme = getStatusColor(ticket.status);
  const isAssignedEmployee = user?.role === 'EMPLOYEE' && ticket.assignedEmployee?.employeeId === user?.employeeId;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={globalStyles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.ticketIdText}>{ticket.ticketId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusTheme.bg }]}>
            <Text style={[styles.statusText, { color: statusTheme.text }]}>{getStatusLocalized(ticket.status)}</Text>
          </View>
        </View>

        <Text style={styles.categoryText}>{getLocalizedCategory(ticket.category)}</Text>
        <Text style={styles.titleText}>{ticket.title}</Text>
        <Text style={styles.descText}>{ticket.description}</Text>

        <View style={styles.divider} />
        
        <Text style={styles.metaLabel}>{t('addressLocation')}</Text>
        <Text style={styles.metaVal}>{ticket.location}</Text>

        <Text style={styles.metaLabel}>{t('filedBy')}</Text>
        <Text style={styles.metaVal}>
          {ticket.citizen?.fullName || 'Anonymous'} ({ticket.citizen?.phone || 'No phone'})
        </Text>

        {ticket.alternatePhone && (
          <>
            <Text style={styles.metaLabel}>{t('alternatePhone')}</Text>
            <Text style={styles.metaVal}>{ticket.alternatePhone}</Text>
          </>
        )}
      </View>

      {(ticket.issueImage || ticket.completionImage) && (
        <View style={globalStyles.card}>
          <Text style={styles.sectionTitle}>{t('uploadedAttachments')}</Text>
          <View style={styles.divider} />
          
          <View style={styles.imagesRow}>
            {ticket.issueImage && (
              <View style={styles.imageBlock}>
                <Text style={styles.imageLabel}>{t('reportPhoto')}</Text>
                <Image
                  source={{ uri: ticket.issueImage.startsWith('http') ? ticket.issueImage : `${FILE_BASE_URL}${ticket.issueImage}` }}
                  style={styles.imageThumb}
                />
              </View>
            )}

            {ticket.completionImage && (
              <View style={styles.imageBlock}>
                <Text style={styles.imageLabel}>{t('resolutionImage')}</Text>
                <Image
                  source={{ uri: ticket.completionImage.startsWith('http') ? ticket.completionImage : `${FILE_BASE_URL}${ticket.completionImage}` }}
                  style={styles.imageThumb}
                />
              </View>
            )}
          </View>
        </View>
      )}

      <View style={globalStyles.card}>
        <Text style={styles.sectionTitle}>{t('serviceAssignment')}</Text>
        <View style={styles.divider} />

        {ticket.assignedEmployee ? (
          <View>
            <Text style={styles.metaLabel}>{t('assignedStaff')}</Text>
            <Text style={styles.metaVal}>{ticket.assignedEmployee.user?.fullName || t('unresolvedName')}</Text>

            <Text style={styles.metaLabel}>{t('departmentWard')}</Text>
            <Text style={styles.metaVal}>{ticket.assignedEmployee.department || 'General Services'}</Text>

            <Text style={styles.metaLabel}>{t('expectedResolution')}</Text>
            {(() => {
              if (!ticket.expectedCompletion) {
                return <Text style={styles.expectedDateText}>{t('pendingScheduling')}</Text>;
              }
              const due = new Date(ticket.expectedCompletion);
              const now = new Date();
              const diffMs = due.getTime() - now.getTime();
              const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              const isOverdue = diffMs < 0;
              const isUrgent = diffDays <= 1 && !isOverdue;
              const urgentColor = isOverdue ? '#EF4444' : isUrgent ? '#F97316' : '#10B981';
              const urgentBg  = isOverdue ? '#FEE2E2' : isUrgent ? '#FFEDD5' : '#D1FAE5';
              const label = isOverdue
                ? `${t('overdueBy')} ${Math.abs(diffDays)}`
                : isUrgent
                ? t('dueToday')
                : `${diffDays} ${t('daysRemaining')}`;
              return (
                <View style={[styles.deadlineChip, { backgroundColor: urgentBg, borderColor: urgentColor }]}>
                  <Ionicons name="time" size={14} color={urgentColor} />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={[styles.deadlineDate, { color: urgentColor }]}>
                      {due.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      {'  '}{due.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                    </Text>
                    <Text style={[styles.deadlineLabel, { color: urgentColor }]}>{label}</Text>
                  </View>
                </View>
              );
            })()}
          </View>
        ) : (
          <Text style={styles.noEmployeeText}>{t('noEmployeeAssigned')}</Text>
        )}
      </View>

      {isProcessing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 12 }} />
      ) : (
        <>
          {user?.role === 'ADMIN' && (
            <View style={globalStyles.card}>
              <Text style={styles.sectionTitle}>{t('adminControls')}</Text>
              <View style={styles.divider} />

              <View style={styles.actionsGrid}>
                {ticket.status === 'PENDING' && (
                  <>
                    <Animated.View style={{ width: '48%', transform: [{ scale: acceptScale }] }}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.actionBtn, styles.greenBtn, { width: '100%' }]}
                        onPressIn={() => animatePress(acceptScale, 0.94)}
                        onPressOut={() => animatePress(acceptScale, 1)}
                        onPress={handleAccept}
                      >
                        <Text style={styles.btnTextWhite}>{t('acceptTicket')}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                    <Animated.View style={{ width: '48%', transform: [{ scale: rejectScale }] }}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.actionBtn, styles.redBtn, { width: '100%' }]}
                        onPressIn={() => animatePress(rejectScale, 0.94)}
                        onPressOut={() => animatePress(rejectScale, 1)}
                        onPress={() => setShowRejectModal(true)}
                      >
                        <Text style={styles.btnTextWhite}>{t('rejectTicketTitle')}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  </>
                )}

                {(ticket.status === 'ACCEPTED' || ticket.status === 'ASSIGNED') && (
                  <TouchableOpacity style={[styles.actionBtn, styles.blueBtn, { width: '100%' }]} onPress={() => setShowAssignModal(true)}>
                    <Text style={styles.btnTextWhite}>
                      {ticket.status === 'ASSIGNED' ? t('reassignEmployee') : t('assignStaffMember')}
                    </Text>
                  </TouchableOpacity>
                )}

                {ticket.status === 'COMPLETED' && (
                  <TouchableOpacity style={[styles.actionBtn, styles.greenBtn, { width: '100%' }]} onPress={handleVerify}>
                    <Text style={styles.btnTextWhite}>{t('verifyResolution')}</Text>
                  </TouchableOpacity>
                )}

                {ticket.status === 'VERIFIED' && (
                  <TouchableOpacity style={[styles.actionBtn, styles.warningBtn, { width: '100%' }]} onPress={handleClose}>
                    <Text style={styles.btnTextWhite}>{language === 'te' ? 'టికెట్ మూసివేయి' : 'Close Ticket'}</Text>
                  </TouchableOpacity>
                )}

                {ticket.status === 'CLOSED' && (
                  <TouchableOpacity style={[styles.actionBtn, styles.redBtn, { width: '100%' }]} onPress={handleDeleteTicket}>
                    <Text style={styles.btnTextWhite}>{language === 'te' ? 'చరిత్ర నుండి తొలగించు' : 'Delete Ticket History'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {isAssignedEmployee && (
            <View style={globalStyles.card}>
              <Text style={styles.sectionTitle}>{t('workerActions')}</Text>
              <View style={styles.divider} />

              <View style={styles.actionsGrid}>
                {ticket.status === 'ASSIGNED' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.blueBtn]}
                    onPress={() => handleEmployeeStatusUpdate('ON_WAY')}
                  >
                    <Text style={styles.btnTextWhite}>{t('markOnWay')}</Text>
                  </TouchableOpacity>
                )}

                {ticket.status === 'ON_WAY' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.warningBtn]}
                    onPress={() => handleEmployeeStatusUpdate('IN_PROGRESS')}
                  >
                    <Text style={styles.btnTextWhite}>{t('markInProgress')}</Text>
                  </TouchableOpacity>
                )}

                {ticket.status === 'IN_PROGRESS' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.greenBtn]}
                    onPress={() => handleEmployeeStatusUpdate('COMPLETED')}
                  >
                    <Text style={styles.btnTextWhite}>{t('completeWork')}</Text>
                  </TouchableOpacity>
                )}

                {['ASSIGNED', 'ON_WAY', 'IN_PROGRESS'].includes(ticket.status) && (
                  <TouchableOpacity style={[styles.actionBtn, styles.redBtn, { flex: 1 }]} onPress={handleRequestHelp}>
                    <Text style={styles.btnTextWhite}>{t('requestHelp')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </>
      )}

      <View style={globalStyles.card}>
        <Text style={styles.sectionTitle}>{language === 'te' ? 'పురోగతి చరిత్ర కాలక్రమం' : 'Activity History Timeline'}</Text>
        <View style={styles.divider} />

        <SnakeTimeline 
          timeline={ticket.timeline} 
          language={language} 
          t={t} 
          getStatusLocalized={getStatusLocalized} 
        />
      </View>

      <Modal visible={showRejectModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>{language === 'te' ? 'ఫిర్యాదు తిరస్కరణ' : 'Reject Ticket'}</Text>
            <Text style={globalStyles.label}>{language === 'te' ? 'తిరస్కరణకు కారణం' : 'Reason for Rejection'}</Text>
            <TextInput
              style={[globalStyles.input, { height: 80 }]}
              placeholder={language === 'te' ? 'తిరస్కరణకు గల కారణాన్ని రాయండి' : 'Provide reason for rejection'}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowRejectModal(false)}>
                <Text style={styles.cancelText}>{t('cancelBtn')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleReject}>
                <Text style={styles.saveText}>{language === 'te' ? 'సమర్పించు' : 'Submit Reject'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAssignModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>{language === 'te' ? 'సిబ్బంది కేటాయింపు' : 'Assign Service Worker'}</Text>
            
            <Text style={globalStyles.label}>{language === 'te' ? 'సిబ్బందిని ఎంచుకోండి' : 'Select Staff Member'}</Text>
            <View style={styles.dropdownContainer}>
              {employees.map((emp) => (
                <TouchableOpacity
                  key={emp.id}
                  style={[
                    styles.dropdownItem,
                    selectedEmp === emp.id && styles.activeDropdownItem,
                  ]}
                  onPress={() => setSelectedEmp(emp.id)}
                >
                  <Text style={[styles.dropdownText, selectedEmp === emp.id && styles.activeDropdownText]}>
                    {emp.fullName} ({emp.department || 'General'})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={globalStyles.label}>{language === 'te' ? 'పూర్తయ్యే అంచనా తేదీ & సమయం' : 'Expected Completion Date & Time'}</Text>
            <CustomDateTimePicker
              value={expectedDate}
              onChange={date => {
                setExpectedDate(date);
                setExpectedTime(date);
              }}
              mode="datetime"
              minDate={new Date()}
              label={language === 'te' ? 'గడువు తేదీని నిర్ణయించండి' : 'Set Deadline for Employee'}
            />

            <View style={styles.datePreviewBox}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.datePreviewText}>
                {language === 'te' ? 'గడువు తేదీ' : 'Deadline'}: {expectedDate.toLocaleString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowAssignModal(false)}>
                <Text style={styles.cancelText}>{t('cancelBtn')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleAssign}>
                <Text style={styles.saveText}>{language === 'te' ? 'కేటాయించు' : 'Assign Staff'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default TicketDetailScreen;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaVal: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 2,
  },
  expectedDateText: {
    fontSize: 14,
    color: COLORS.warning,
    fontWeight: 'bold',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  noEmployeeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  imagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageBlock: {
    width: '48%',
  },
  imageLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  imageThumb: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: '48%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  greenBtn: {
    backgroundColor: COLORS.success,
  },
  redBtn: {
    backgroundColor: COLORS.error,
  },
  blueBtn: {
    backgroundColor: COLORS.primary,
  },
  warningBtn: {
    backgroundColor: COLORS.warning,
  },
  btnTextWhite: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalCancel: {
    flex: 0.48,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    borderRadius: 8,
  },
  modalConfirm: {
    flex: 0.48,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    borderRadius: 8,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dropdownContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginVertical: 8,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activeDropdownItem: {
    backgroundColor: COLORS.primaryLight,
  },
  dropdownText: {
    fontSize: 13,
    color: COLORS.text,
  },
  activeDropdownText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  deadlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  deadlineDate: {
    fontSize: 14,
    fontWeight: '700',
  },
  deadlineLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  datePreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    padding: 15,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  datePreviewText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#065F46',
    fontWeight: 'bold',
  },
  /* Pathway Timeline Styles */
  snakeContainer: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  snakeRow: {
    marginBottom: 24, // gap between rows to fit vertical drop
    alignItems: 'stretch', // Crucial: makes wrappers equal height so U-turns reach exactly to the next row
    position: 'relative',
  },
  snakeItemWrapper: {
    flex: 1,
    paddingHorizontal: 6,
    position: 'relative',
    alignItems: 'center', // centers the node, stem, and card
  },
  pathwayTopLayer: {
    width: '100%',
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pathwayNode: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 2,
  },
  pathwayNodeGlow: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    zIndex: 1,
  },
  pathwayHorizontalLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#D2C4C0',
    top: 6.5, // Center vertically with the 14px node
    zIndex: 1,
  },
  pathwayUTurnRight: {
    position: 'absolute',
    left: '50%',
    right: -10, // Extends outside the card to bypass it
    top: 6.5, // matches pathwayHorizontalLine
    bottom: -32, // exactly targets the center of the next row's node (24px margin + 8px to center)
    borderColor: '#D2C4C0',
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    zIndex: 0,
  },
  pathwayUTurnLeft: {
    position: 'absolute',
    right: '50%',
    left: -10, // Extends outside the card to bypass it
    top: 6.5,
    bottom: -32, // exactly targets the center of the next row's node
    borderColor: '#D2C4C0',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    zIndex: 0,
  },
  pathwayStem: {
    width: 2,
    backgroundColor: '#D2C4C0',
    // height is animated
  },
  snakeCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    height: 85, // Fixed uniform height for all cards
  },
  snakeCardInner: {
    width: '100%',
    height: '100%',
    padding: 8,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    position: 'relative',
  },
  remarksHint: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#F3F4F6',
    padding: 4,
    borderRadius: 10,
  },
  /* Bottom Sheet Modal Styles */
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  bottomSheetDismiss: {
    flex: 1,
    width: '100%',
  },
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
    minHeight: 300,
    maxHeight: '80%',
  },
  bottomSheetHandle: {
    width: 44,
    height: 5,
    backgroundColor: '#CBD5E1',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  bottomSheetIconBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  bottomSheetSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  bottomSheetContentContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bottomSheetScroll: {
    maxHeight: 300,
  },
  bottomSheetContentText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 26,
  },
  bottomSheetCloseBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  bottomSheetCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  snakeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
    width: '100%',
    alignItems: 'center',
  },
  snakeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  snakeActor: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '600',
    marginBottom: 4,
  },
  snakeRemarks: {
    fontSize: 10,
    color: '#A0AEC0',
    fontStyle: 'italic',
    marginBottom: 6,
    lineHeight: 14,
  },
  snakeDate: {
    fontSize: 9,
    color: '#1F1F1F',
    fontWeight: '700',
    marginTop: 2,
  },
});
