import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { COLORS } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

interface PensionRecord {
  id: string;
  sno: number;
  sgswCode: string;
  sgswName: string;
  pensionId: string;
  name: string;
  scheme: string;
  monthAmount: number;
  mobileNumber: string | null;
}

const PensionRecordsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { token } = useAuth();
  const { language } = useLanguage();

  const [records, setRecords] = useState<PensionRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'https://api.grampanchayat.digital/api'}/modules/pension-records?page=${page}&limit=20&search=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const json = await response.json();
        setRecords(json.data);
        setTotalPages(json.totalPages);
        setTotalRecords(json.totalRecords);
      } else {
        console.error('Failed to fetch pension records');
      }
    } catch (error) {
      console.error('Error fetching pension records:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, token]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Handle Search Input Submission
  const handleSearchSubmit = () => {
    setPage(1);
    setSearchQuery(search);
  };

  const handleClearSearch = () => {
    setSearch('');
    setSearchQuery('');
    setPage(1);
  };

  const handleCall = (phoneNumber: string) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`).catch((err) =>
      console.error('Error opening dialer:', err)
    );
  };

  const renderRecordRow = ({ item, index }: { item: PensionRecord; index: number }) => {
    const isEven = index % 2 === 0;
    return (
      <View style={[styles.recordCard, isEven ? styles.evenBg : styles.oddBg]}>
        <View style={styles.cardHeader}>
          <Text style={styles.serialText}>#{item.sno}</Text>
          <View style={styles.schemeBadge}>
            <Text style={styles.schemeText}>{item.scheme}</Text>
          </View>
        </View>

        <Text style={styles.beneficiaryName}>{item.name}</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>
              {language === 'te' ? 'పెన్షన్ ఐడీ' : 'Pension ID'}
            </Text>
            <Text style={styles.infoValue}>{item.pensionId}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>
              {language === 'te' ? 'నెలకు మొత్తం' : 'Amount / Month'}
            </Text>
            <Text style={styles.infoValue}>₹{item.monthAmount}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.sgswText}>
            {item.sgswName} • Code: {item.sgswCode}
          </Text>
          {item.mobileNumber ? (
            <TouchableOpacity
              style={styles.phoneAction}
              onPress={() => handleCall(item.mobileNumber!)}
            >
              <Ionicons name="call" size={14} color={COLORS.primary} />
              <Text style={styles.phoneText}>{item.mobileNumber}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noPhoneText}>
              {language === 'te' ? 'మొబైల్ లేదు' : 'No Phone'}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'te' ? 'పెన్షన్ లబ్ధిదారులు' : 'Pension Beneficiaries'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              language === 'te'
                ? 'పేరు, ఐడీ లేదా నంబర్ తో వెతకండి...'
                : 'Search Name, ID or Mobile...'
            }
            placeholderTextColor={COLORS.textSecondary}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearchSubmit}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchActionBtn} onPress={handleSearchSubmit}>
          <Text style={styles.searchActionText}>
            {language === 'te' ? 'వెతుకు' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Result Meta */}
      <Text style={styles.resultMeta}>
        {language === 'te'
          ? `మొత్తం లబ్ధిదారులు: ${totalRecords}`
          : `Total Records found: ${totalRecords}`}
      </Text>

      {/* Loading / List Content */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {language === 'te' ? 'రికార్డులు లోడ్ అవుతున్నాయి...' : 'Loading records...'}
          </Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>
            {language === 'te' ? 'లబ్ధిదారులు ఎవరూ కనుగొనబడలేదు' : 'No records found matching criteria'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderRecordRow}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Pagination Controls */}
      <View style={styles.paginationRow}>
        <TouchableOpacity
          style={[styles.pageBtn, page === 1 && styles.disabledBtn]}
          disabled={page === 1}
          onPress={() => setPage((p) => Math.max(1, p - 1))}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={page === 1 ? '#A0AEC0' : '#FFFFFF'}
          />
          <Text style={[styles.pageBtnText, page === 1 && styles.disabledBtnText]}>
            {language === 'te' ? 'మునుపటి' : 'Prev'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageIndicator}>
          {language === 'te'
            ? `పేజీ ${page} / ${totalPages}`
            : `Page ${page} of ${totalPages}`}
        </Text>

        <TouchableOpacity
          style={[styles.pageBtn, page === totalPages && styles.disabledBtn]}
          disabled={page === totalPages}
          onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          <Text style={[styles.pageBtnText, page === totalPages && styles.disabledBtnText]}>
            {language === 'te' ? 'తరువాతి' : 'Next'}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={page === totalPages ? '#A0AEC0' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PensionRecordsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: COLORS.text,
  },
  clearBtn: {
    padding: 4,
  },
  searchActionBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchActionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 6,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  recordCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  evenBg: {
    backgroundColor: COLORS.surface,
  },
  oddBg: {
    backgroundColor: '#FDFBF7', // slight premium warm tint
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serialText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  schemeBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  schemeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  beneficiaryName: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 10,
  },
  infoGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginBottom: 8,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  sgswText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  phoneAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  phoneText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  noPhoneText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  pageBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  disabledBtn: {
    backgroundColor: '#EDF2F7',
  },
  disabledBtnText: {
    color: '#A0AEC0',
  },
  pageIndicator: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
