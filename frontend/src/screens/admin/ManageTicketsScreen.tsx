import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, API_BASE_URL } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { COLORS, globalStyles } from '../../styles/theme';

interface Ticket {
  id: string;
  ticketId: string;
  category: string;
  title: string;
  status: string;
  createdAt: string;
  citizen?: {
    fullName: string;
  };
}

const STATUS_FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'ASSIGNED', 'ON_WAY', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CLOSED'];
const CATEGORY_FILTERS = ['ALL', 'Road', 'Street Light', 'Garbage', 'Water Supply', 'Drainage', 'Hygiene', 'Pest Control', 'Electricity', 'Others'];

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

const ManageTicketsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters State
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchTickets = async () => {
    try {
      let url = `${API_BASE_URL}/tickets?`;
      if (selectedStatus !== 'ALL') url += `status=${selectedStatus}&`;
      if (selectedCategory !== 'ALL') url += `category=${selectedCategory}&`;
      if (search.trim()) url += `search=${encodeURIComponent(search.trim())}&`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load tickets.');
      const data = await response.json();
      setTickets(data);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Load Error', 'Could not refresh ticket list.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [selectedStatus, selectedCategory]);

  const handleSearchSubmit = () => {
    setIsLoading(true);
    fetchTickets();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const renderItem = ({ item }: { item: Ticket }) => {
    const statusTheme = getLocalStatusColor(item.status);
    return (
      <View style={styles.ticketContainer}>
        <View style={styles.ticketTop}>
          <View style={styles.cardHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusTheme.bg }]}>
              <Text style={[styles.statusText, { color: statusTheme.text }]}>{item.status}</Text>
            </View>
          </View>
          
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.reporterText} numberOfLines={1}>
            {t('reporterLabel')} {item.citizen?.fullName || t('anonymousUser')}
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
              <Text style={styles.ticketLabel}>TICKET ID</Text>
              <Text style={styles.ticketIdText}>{item.ticketId}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.ticketLabel}>{t('filedDate')}</Text>
              <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
              style={styles.trackBtn}
            >
              <Text style={styles.trackBtnText}>{t('reviewTicket')}</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={globalStyles.container}>
      {/* 1. Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[globalStyles.input, styles.searchInput]}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor={COLORS.textSecondary}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearchSubmit}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearchSubmit}>
          <Text style={styles.searchBtnText}>{t('searchBtn')}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Horizontal Status Chips */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>{t('filterStatus')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {STATUS_FILTERS.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.chip,
                selectedStatus === status && styles.activeChip,
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text style={[styles.chipText, selectedStatus === status && styles.activeChipText]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 3. Horizontal Category Chips */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>{t('filterCategory')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {CATEGORY_FILTERS.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                selectedCategory === cat && styles.activeChip,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.chipText, selectedCategory === cat && styles.activeChipText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 4. Ticket FlatList */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <Text style={styles.emptyText}>{t('noTicketsMatch')}</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
};

export default ManageTicketsScreen;

const styles = StyleSheet.create({
  ticketCard: {}, // Removed old card styling
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginVertical: 6,
    height: 40,
    paddingVertical: 8,
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    marginLeft: 8,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  filterSection: {
    backgroundColor: COLORS.surface,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginRight: 8,
    width: 60,
  },
  chipScroll: {
    flex: 1,
  },
  chip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '600',
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  reporterText: {
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
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
});
