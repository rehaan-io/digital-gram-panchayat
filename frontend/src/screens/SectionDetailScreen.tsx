import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, Modal, FlatList
} from 'react-native';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

const SectionDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { sectionKey } = route.params;
  const { user, token } = useAuth();
  const { language } = useLanguage();

  const [section, setSection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTitleTe, setEditTitleTe] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editContentTe, setEditContentTe] = useState('');
  const [isSavingText, setIsSavingText] = useState(false);

  // Module Specific Data
  const [moduleData, setModuleData] = useState<any>(null);
  const [subList, setSubList] = useState<any[]>([]);
  const [subList2, setSubList2] = useState<any[]>([]); // For additional sub-lists (like GLSRs)
  const [subList3, setSubList3] = useState<any[]>([]); // Direct Pumping
  const [customFields, setCustomFields] = useState<any[]>([]);

  // Modal / Form States
  const [showFormModal, setShowFormModal] = useState(false);
  const [activeFormType, setActiveFormType] = useState<string>(''); // e.g. 'official', 'ohsr', 'glsr', etc.
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const fetchSectionDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/homepage/${sectionKey}`);
      if (!response.ok) throw new Error('Section details failed to load.');
      const data = await response.json();
      setSection(data);
      setEditTitle(data.title);
      setEditTitleTe(data.titleTe || '');
      setEditContent(data.content);
      setEditContentTe(data.contentTe || '');
    } catch (error: any) {
      console.error(error);
    }
  };

  const fetchCustomFields = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/modules/custom-fields/${sectionKey}`);
      if (res.ok) setCustomFields(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchModuleData = async () => {
    setIsLoading(true);
    fetchCustomFields();
    try {
      if (sectionKey === 'about') {
        const res1 = await fetch(`${API_BASE_URL}/modules/about-gp`);
        const res2 = await fetch(`${API_BASE_URL}/modules/officials`);
        if (res1.ok && res2.ok) {
          setModuleData(await res1.json());
          const allOfficials = await res2.json();
          // Filter out officials who have a photo (they are shown on the home screen)
          setSubList(allOfficials.filter((o: any) => !o.photo));
        }
      } else if (sectionKey === 'water_supply') {
        const res1 = await fetch(`${API_BASE_URL}/modules/water-details`);
        const res2 = await fetch(`${API_BASE_URL}/modules/ohsrs`);
        const res3 = await fetch(`${API_BASE_URL}/modules/glsrs`);
        const res4 = await fetch(`${API_BASE_URL}/modules/direct-pumpings`);
        if (res1.ok && res2.ok && res3.ok && res4.ok) {
          setModuleData(await res1.json());
          setSubList(await res2.json());
          setSubList2(await res3.json());
          setSubList3(await res4.json());
        }
      } else if (sectionKey === 'street_lights') {
        const res1 = await fetch(`${API_BASE_URL}/modules/street-light-details`);
        const res2 = await fetch(`${API_BASE_URL}/modules/street-light-assets`);
        if (res1.ok && res2.ok) {
          setModuleData(await res1.json());
          setSubList(await res2.json());
        }
      } else if (sectionKey === 'tax_revenue') {
        const res = await fetch(`${API_BASE_URL}/modules/tax-revenue`);
        if (res.ok) setModuleData(await res.json());
      } else if (sectionKey === 'health') {
        const res1 = await fetch(`${API_BASE_URL}/modules/health-details`);
        const res2 = await fetch(`${API_BASE_URL}/modules/health-staff`);
        if (res1.ok && res2.ok) {
          setModuleData(await res1.json());
          setSubList(await res2.json());
        }
      } else if (sectionKey === 'education') {
        const res = await fetch(`${API_BASE_URL}/modules/schools`);
        if (res.ok) setSubList(await res.json());
      } else if (sectionKey === 'anganwadi') {
        const res1 = await fetch(`${API_BASE_URL}/modules/anganwadi-stats`);
        const res2 = await fetch(`${API_BASE_URL}/modules/anganwadi-centres`);
        if (res1.ok && res2.ok) {
          setModuleData(await res1.json());
          setSubList(await res2.json());
        }
      } else if (sectionKey === 'mgnregs') {
        const res1 = await fetch(`${API_BASE_URL}/modules/mgnregs-details`);
        const res2 = await fetch(`${API_BASE_URL}/modules/mgnregs-works`);
        if (res1.ok && res2.ok) {
          setModuleData(await res1.json());
          setSubList(await res2.json());
        }
      } else if (sectionKey === 'pensions') {
        const res = await fetch(`${API_BASE_URL}/modules/pension-categories`);
        if (res.ok) setSubList(await res.json());
      } else if (sectionKey === 'agriculture') {
        const res = await fetch(`${API_BASE_URL}/modules/agriculture-stats`);
        if (res.ok) setModuleData(await res.json());
      } else if (sectionKey === 'horticulture') {
        const res = await fetch(`${API_BASE_URL}/modules/horticulture-stats`);
        if (res.ok) setModuleData(await res.json());
      } else if (sectionKey === 'animal_husbandry') {
        const res = await fetch(`${API_BASE_URL}/modules/animal-husbandry-stats`);
        if (res.ok) setModuleData(await res.json());
      } else if (sectionKey === 'shg_vo') {
        const res1 = await fetch(`${API_BASE_URL}/modules/shg-stats`);
        const res2 = await fetch(`${API_BASE_URL}/modules/vo-groups`);
        if (res1.ok && res2.ok) {
          setModuleData(await res1.json());
          setSubList(await res2.json());
        }
      } else if (sectionKey === 'community_assets') {
        const res = await fetch(`${API_BASE_URL}/modules/community-assets`);
        if (res.ok) setSubList(await res.json());
      }
    } catch (e) {
      console.error('Error loading module details:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSectionDetails();
    fetchModuleData();
  }, [sectionKey]);

  const handleSaveText = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setIsSavingText(true);
    try {
      const response = await fetch(`${API_BASE_URL}/homepage/${sectionKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editTitle, content: editContent, titleTe: editTitleTe, contentTe: editContentTe }),
      });
      if (response.ok) {
        const data = await response.json();
        setSection(data.section);
        setIsEditingText(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingText(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CRUD SUBMISSION HELPERS
  // ─────────────────────────────────────────────────────────────────────────────
  const updateGeneralStats = async (endpoint: string, data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/modules/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        Alert.alert('Success', 'Panchayat statistics updated successfully.');
        fetchModuleData();
      } else {
        throw new Error('Failed to update stats.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleSubItemSubmit = async () => {
    const isEdit = !!selectedItem;
    const method = isEdit ? 'PUT' : 'POST';
    let url = isEdit
      ? `${API_BASE_URL}/modules/${activeFormType}s/${selectedItem.id}`
      : `${API_BASE_URL}/modules/${activeFormType}s`;

    if (activeFormType === 'custom-field') {
      url = isEdit
        ? `${API_BASE_URL}/modules/custom-fields/${selectedItem.id}`
        : `${API_BASE_URL}/modules/custom-fields`;
    }

    try {
      const payload = activeFormType === 'custom-field' && !isEdit
        ? { ...formData, sectionKey }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Alert.alert('Success', `Record ${isEdit ? 'updated' : 'added'} successfully.`);
        setShowFormModal(false);
        setSelectedItem(null);
        setFormData({});
        fetchModuleData();
      } else {
        throw new Error('Server returned an error.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleSubItemDelete = async (type: string, id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to permanently remove this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const url = type === 'custom-field'
                ? `${API_BASE_URL}/modules/custom-fields/${id}`
                : `${API_BASE_URL}/modules/${type}s/${id}`;

              const response = await fetch(url, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              if (response.ok) {
                Alert.alert('Deleted', 'Record removed.');
                fetchModuleData();
              }
            } catch (err) {
              console.error(err);
            }
          }
        }
      ]
    );
  };

  const openAddForm = (type: string) => {
    setActiveFormType(type);
    setSelectedItem(null);
    setFormData({});
    setShowFormModal(true);
  };

  const openEditForm = (type: string, item: any) => {
    setActiveFormType(type);
    setSelectedItem(item);
    setFormData({ ...item });
    setShowFormModal(true);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDERING COMPONENTS FOR SECTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const renderOfficialCard = ({ item }: { item: any }) => (
    <View style={styles.subCard}>
      <View style={styles.subCardHeader}>
        <View>
          <Text style={styles.subCardTitle}>{item.name}</Text>
          <Text style={styles.subCardSub}>{item.designation} • {item.office}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: item.status === 'ACTIVE' ? '#D1FAE5' : '#FEE2E2' }]}>
          <Text style={{ color: item.status === 'ACTIVE' ? '#065F46' : '#991B1B', fontSize: 10, fontWeight: '700' }}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.subCardBody}>📞 {item.phoneNumber}</Text>
      <Text style={styles.subCardBody}>🎯 {item.responsibilities}</Text>
      {user?.role === 'ADMIN' && (
        <View style={styles.subCardActions}>
          <TouchableOpacity style={styles.editIconBtn} onPress={() => openEditForm('official', item)}>
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteIconBtn} onPress={() => handleSubItemDelete('official', item.id)}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* About Panchayat custom cards */}
        {sectionKey === 'about' && moduleData && (
          <View style={globalStyles.card}>
            <Text style={styles.titleText}>🏛️ Panchayat Statistics</Text>
            <View style={styles.divider} />
            <View style={styles.statGrid}>
              <View style={styles.statBox}><Text style={styles.statLabel}>GP Name</Text><Text style={styles.statValue}>{moduleData.gpName}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Mandal</Text><Text style={styles.statValue}>{moduleData.mandal}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>District</Text><Text style={styles.statValue}>{moduleData.district}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>GP Extent</Text><Text style={styles.statValue}>{moduleData.gpExtent}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Total Population</Text><Text style={styles.statValue}>{moduleData.population}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Male / Female</Text><Text style={styles.statValue}>{moduleData.malePopulation} / {moduleData.femalePopulation}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>SC / ST</Text><Text style={styles.statValue}>{moduleData.scPopulation} / {moduleData.stPopulation}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Assessments</Text><Text style={styles.statValue}>{moduleData.totalAssessments}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Audit Status</Text><Text style={styles.statValue}>{moduleData.auditStatus || '-'}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Panchayat Secretary</Text><Text style={styles.statValue}>{moduleData.panchayatSecretary || '-'}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Executive Officer</Text><Text style={styles.statValue}>{moduleData.executiveOfficer || '-'}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>APIIC Ind Estate Sy 37</Text><Text style={styles.statValue}>{moduleData.apiicEstate37 || '-'}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>APIIC Ind Estate Sy 04</Text><Text style={styles.statValue}>{moduleData.apiicEstate04 || '-'}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>APIIC Total Acres</Text><Text style={styles.statValue}>{moduleData.apiicTotalAcres || '-'}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Savings Target</Text><Text style={styles.statValue}>{moduleData.savingsTarget || '-'}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Savings Achievement</Text><Text style={styles.statValue}>{moduleData.savingsAchievement || '-'}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Savings %</Text><Text style={styles.statValue}>{moduleData.savingsPercentage || '-'}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Misappropriation Cases</Text><Text style={styles.statValue}>{moduleData.misappropriationCases || '-'}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Misappropriation Amt</Text><Text style={styles.statValue}>{moduleData.misappropriationAmount || '-'}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Recovery Amount</Text><Text style={styles.statValue}>{moduleData.recoveryAmount || '-'}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>FPOs in GP</Text><Text style={styles.statValue}>{moduleData.fposInGp || '-'}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Sri Nidhi Loans Granted</Text><Text style={styles.statValue}>{moduleData.sriNidhiLoansGranted || '-'}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Sri Nidhi Amount</Text><Text style={styles.statValue}>{moduleData.sriNidhiAmount || '-'}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>NPA / PNPA</Text><Text style={styles.statValue}>{moduleData.npa || '-'} / {moduleData.pnpa || '-'}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Community Hall Location</Text><Text style={styles.statValue}>{moduleData.communityHallLocation || '-'}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Library Location</Text><Text style={styles.statValue}>{moduleData.libraryLocation || '-'}</Text></View>
            </View>
            {user?.role === 'ADMIN' && (
              <TouchableOpacity
                style={styles.statsEditBtn}
                onPress={() => {
                  setFormData({ ...moduleData });
                  openEditForm('about-gp', moduleData);
                }}
              >
                <Text style={styles.statsEditBtnText}>Edit GP Metrics</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Water supply details custom cards */}
        {sectionKey === 'water_supply' && moduleData && (
          <View style={globalStyles.card}>
            <Text style={styles.titleText}>💧 Water Schemes Overview</Text>
            <View style={styles.divider} />
            <View style={styles.statGrid}>
              <View style={styles.statBox}><Text style={styles.statLabel}>Total Schemes</Text><Text style={styles.statValue}>{moduleData.totalWaterSchemes}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Private Taps</Text><Text style={styles.statValue}>{moduleData.privateConnections}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Public Taps</Text><Text style={styles.statValue}>{moduleData.publicConnections}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Hand Pumps</Text><Text style={styles.statValue}>{moduleData.handPumps}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Tap Fee Demand</Text><Text style={styles.statValue}>₹{moduleData.privateTapFeeDemand}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>OHSRs / GLSRs</Text><Text style={styles.statValue}>{moduleData.totalOHSRs} / {moduleData.totalGLSRs}</Text></View>
            </View>
            {user?.role === 'ADMIN' && (
              <TouchableOpacity
                style={styles.statsEditBtn}
                onPress={() => {
                  setFormData({ ...moduleData });
                  openEditForm('water-detail', moduleData);
                }}
              >
                <Text style={styles.statsEditBtnText}>Edit Water Stats</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Street lights details custom cards */}
        {sectionKey === 'street_lights' && moduleData && (
          <View style={globalStyles.card}>
            <Text style={styles.titleText}>💡 Grid Specifications</Text>
            <View style={styles.divider} />
            <View style={styles.statGrid}>
              <View style={styles.statBox}><Text style={styles.statLabel}>Total Poles</Text><Text style={styles.statValue}>{moduleData.totalPoles}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Total LEDs</Text><Text style={styles.statValue}>{moduleData.totalLEDs}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Lighting Staff</Text><Text style={styles.statValue}>{moduleData.lightingStaff}</Text></View>
            </View>
            {user?.role === 'ADMIN' && (
              <TouchableOpacity
                style={styles.statsEditBtn}
                onPress={() => {
                  setFormData({ ...moduleData });
                  openEditForm('street-light-detail', moduleData);
                }}
              >
                <Text style={styles.statsEditBtnText}>Edit Lighting Grid Stats</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tax Revenue stats */}
        {sectionKey === 'tax_revenue' && moduleData && (
          <View style={globalStyles.card}>
            <Text style={styles.titleText}>💰 Fiscal Budget Summary ({moduleData.financialYear})</Text>
            <View style={styles.divider} />
            <View style={styles.statGrid}>
              <View style={styles.statBox}><Text style={styles.statLabel}>House Tax</Text><Text style={styles.statValue}>₹{moduleData.houseTax}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Library Cess</Text><Text style={styles.statValue}>₹{moduleData.libraryCess}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Water Tax</Text><Text style={styles.statValue}>₹{moduleData.waterTax}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Lighting Tax</Text><Text style={styles.statValue}>₹{moduleData.lightingTax}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Total Demand</Text><Text style={styles.statValue}>₹{moduleData.totalDemand}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Collection %</Text><Text style={styles.statValue}>{moduleData.collectionPercentage}%</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>General Funds</Text><Text style={styles.statValue}>₹{moduleData.generalFund}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>15th Finance Comm</Text><Text style={styles.statValue}>₹{moduleData.fifteenthFC}</Text></View>
            </View>
            {user?.role === 'ADMIN' && (
              <TouchableOpacity
                style={styles.statsEditBtn}
                onPress={() => {
                  setFormData({ ...moduleData });
                  openEditForm('tax-revenue', moduleData);
                }}
              >
                <Text style={styles.statsEditBtnText}>Edit Tax Demands</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Anganwadi Stats */}
        {sectionKey === 'anganwadi' && moduleData && (
          <View style={globalStyles.card}>
            <Text style={styles.titleText}>👶 Nutritional Tracking Statistics</Text>
            <View style={styles.divider} />
            <View style={styles.statGrid}>
              <View style={styles.statBox}><Text style={styles.statLabel}>SAM Children</Text><Text style={styles.statValue}>{moduleData.samChildren}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>MAM Children</Text><Text style={styles.statValue}>{moduleData.mamChildren}</Text></View>
            </View>
            {user?.role === 'ADMIN' && (
              <TouchableOpacity
                style={styles.statsEditBtn}
                onPress={() => {
                  setFormData({ ...moduleData });
                  openEditForm('anganwadi-stats', moduleData);
                }}
              >
                <Text style={styles.statsEditBtnText}>Edit Malnutrition Stats</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* MGNREGS details */}
        {sectionKey === 'mgnregs' && moduleData && (
          <View style={globalStyles.card}>
            <Text style={styles.titleText}>⚒️ NREGS Employment Log</Text>
            <View style={styles.divider} />
            <View style={styles.statGrid}>
              <View style={styles.statBox}><Text style={styles.statLabel}>Job Cards</Text><Text style={styles.statValue}>{moduleData.jobCards}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Active Cards</Text><Text style={styles.statValue}>{moduleData.activeJobCards}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Works Logged</Text><Text style={styles.statValue}>{moduleData.works}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Estimate Cost</Text><Text style={styles.statValue}>₹{moduleData.estimateCost}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Gokulam Sheds</Text><Text style={styles.statValue}>{moduleData.gokulamSheds}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Sramika Sanghalu</Text><Text style={styles.statValue}>{moduleData.sramikaSanghalu}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Completed Gokulam</Text><Text style={styles.statValue}>{moduleData.completedGokulam}</Text></View>
            </View>
            {user?.role === 'ADMIN' && (
              <TouchableOpacity
                style={styles.statsEditBtn}
                onPress={() => {
                  setFormData({ ...moduleData });
                  openEditForm('mgnregs-detail', moduleData);
                }}
              >
                <Text style={styles.statsEditBtnText}>Edit MGNREGS Stats</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Agriculture details */}
        {sectionKey === 'agriculture' && moduleData && (
          <View style={globalStyles.card}>
            <Text style={styles.titleText}>🌾 Agriculture Statistics</Text>
            <View style={styles.divider} />
            <View style={styles.statGrid}>
              <View style={styles.statBox}><Text style={styles.statLabel}>Cultivable Land</Text><Text style={styles.statValue}>{moduleData.cultivableLand} Acres</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Rabi Area Sown</Text><Text style={styles.statValue}>{moduleData.rabiArea} Acres</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Total Land Sown</Text><Text style={styles.statValue}>{moduleData.landSown} Acres</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Groundnut Distributed</Text><Text style={styles.statValue}>{moduleData.groundnutQuintals} Qtl</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Polam Badies Sown</Text><Text style={styles.statValue}>{moduleData.polamBadies}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Samples Collected</Text><Text style={styles.statValue}>{moduleData.samplesCollected}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Samples Analysed</Text><Text style={styles.statValue}>{moduleData.samplesAnalysed}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Soil Health Cards</Text><Text style={styles.statValue}>{moduleData.soilCards}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>PM Kisan Enrolled</Text><Text style={styles.statValue}>{moduleData.pmKisan}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>PM Kisan Paid</Text><Text style={styles.statValue}>₹{moduleData.amountPaid}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Crop Insurance Farmers</Text><Text style={styles.statValue}>{moduleData.cropInsuranceFarmers}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Heavy Rain Affected Farmers</Text><Text style={styles.statValue}>{moduleData.heavyRainAffectedFarmers}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Heavy Rain Damaged Area</Text><Text style={styles.statValue}>{moduleData.heavyRainDamageArea} Acres</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Heavy Rain Damage Amount</Text><Text style={styles.statValue}>₹{moduleData.heavyRainDamageAmount} Lakhs</Text></View>
            </View>
            {user?.role === 'ADMIN' && (
              <TouchableOpacity
                style={styles.statsEditBtn}
                onPress={() => {
                  setFormData({ ...moduleData });
                  openEditForm('agriculture-stats', moduleData);
                }}
              >
                <Text style={styles.statsEditBtnText}>Edit Crop & Farmer Stats</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Horticulture details */}
        {sectionKey === 'horticulture' && moduleData && (
          <View style={globalStyles.card}>
            <Text style={styles.titleText}>🍊 Horticulture Statistics</Text>
            <View style={styles.divider} />
            <View style={styles.statGrid}>
              <View style={styles.statBox}><Text style={styles.statLabel}>Area</Text><Text style={styles.statValue}>{moduleData.area} Acres</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Production</Text><Text style={styles.statValue}>{moduleData.production} Tonnes</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>MIDH Target</Text><Text style={styles.statValue}>{moduleData.midhPhysical} (₹{moduleData.midhTotal})</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>RKVM Target</Text><Text style={styles.statValue}>{moduleData.rkvmPhysical} (₹{moduleData.rkvmTotal})</Text></View>
            </View>
            {user?.role === 'ADMIN' && (
              <TouchableOpacity
                style={styles.statsEditBtn}
                onPress={() => {
                  setFormData({ ...moduleData });
                  openEditForm('horticulture-stats', moduleData);
                }}
              >
                <Text style={styles.statsEditBtnText}>Edit Horticulture Targets</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Animal Husbandry */}
        {sectionKey === 'animal_husbandry' && moduleData && (
          <View style={globalStyles.card}>
            <Text style={styles.titleText}>🐄 Livestock & Veterinary</Text>
            <View style={styles.divider} />
            <View style={styles.statGrid}>
              <View style={styles.statBox}><Text style={styles.statLabel}>Cattle</Text><Text style={styles.statValue}>{moduleData.cattle}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Buffaloes</Text><Text style={styles.statValue}>{moduleData.buffaloes}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Sheep</Text><Text style={styles.statValue}>{moduleData.sheep}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Goats</Text><Text style={styles.statValue}>{moduleData.goats}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Vaccination achievement</Text><Text style={styles.statValue}>{moduleData.vaccination}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Mini Gokulam</Text><Text style={styles.statValue}>{moduleData.gokulamInaugurated} units</Text></View>
            </View>
            {user?.role === 'ADMIN' && (
              <TouchableOpacity
                style={styles.statsEditBtn}
                onPress={() => {
                  setFormData({ ...moduleData });
                  openEditForm('animal-husbandry-stats', moduleData);
                }}
              >
                <Text style={styles.statsEditBtnText}>Edit Livestock Stats</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* SHG & VO stats */}
        {sectionKey === 'shg_vo' && moduleData && (
          <View style={globalStyles.card}>
            <Text style={styles.titleText}>👩 SHG Summary</Text>
            <View style={styles.divider} />
            <View style={styles.statGrid}>
              <View style={styles.statBox}><Text style={styles.statLabel}>Total SHGs</Text><Text style={styles.statValue}>{moduleData.totalSHGs}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Active SHGs</Text><Text style={styles.statValue}>{moduleData.activeSHGs}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Loans Disbursed</Text><Text style={styles.statValue}>₹{moduleData.loans}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Savings</Text><Text style={styles.statValue}>₹{moduleData.savings}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Recovery Rate</Text><Text style={styles.statValue}>{moduleData.recovery}%</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Sri Nidhi Funding</Text><Text style={styles.statValue}>₹{moduleData.sriNidhi}</Text></View>
            </View>
            {user?.role === 'ADMIN' && (
              <TouchableOpacity
                style={styles.statsEditBtn}
                onPress={() => {
                  setFormData({ ...moduleData });
                  openEditForm('shg-stats', moduleData);
                }}
              >
                <Text style={styles.statsEditBtnText}>Edit SHG Stats</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Custom Section Fields Table */}
        <View style={globalStyles.card}>
          <View style={styles.row}>
            <Text style={styles.titleText}>📋 Tabular Section Registry</Text>
            {user?.role === 'ADMIN' && (
              <TouchableOpacity style={styles.editBtn} onPress={() => openAddForm('custom-field')}>
                <Text style={styles.editBtnText}>+ Add Row</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.divider} />
          {customFields.length === 0 ? (
            <Text style={styles.noDataText}>No custom rows defined for this section.</Text>
          ) : (
            <View style={styles.tableContainer}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.headerText]}>Field Name / Metric</Text>
                <Text style={[styles.tableCell, styles.headerText]}>Value / Details</Text>
                {user?.role === 'ADMIN' && <Text style={[styles.tableCellActionsHeader, styles.headerText]}>Actions</Text>}
              </View>
              {customFields.map((field) => (
                <View key={field.id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{field.fieldName}</Text>
                  <Text style={styles.tableCell}>{field.fieldValue}</Text>
                  {user?.role === 'ADMIN' && (
                    <View style={styles.tableCellActions}>
                      <TouchableOpacity onPress={() => openEditForm('custom-field', field)} style={{ marginRight: 10 }}>
                        <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleSubItemDelete('custom-field', field.id)}>
                        <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Generic Editable Text Content (Fallback/default headers) */}
        <View style={globalStyles.card}>
          <View style={styles.row}>
            <Text style={styles.titleText}>
              📘 {language === 'te' && section?.titleTe ? section.titleTe : section?.title || 'Details & Objectives'}
            </Text>
            {user?.role === 'ADMIN' && (
              <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditingText(!isEditingText)}>
                <Text style={styles.editBtnText}>{isEditingText ? 'Hide' : 'Edit Text'}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.divider} />
          {isEditingText ? (
            <View>
              <TextInput style={globalStyles.input} placeholder="Title (English)" value={editTitle} onChangeText={setEditTitle} />
              <TextInput style={globalStyles.input} placeholder="Title (Telugu)" value={editTitleTe} onChangeText={setEditTitleTe} />
              <TextInput style={[globalStyles.input, styles.textArea]} placeholder="Content (English)" value={editContent} onChangeText={setEditContent} multiline />
              <TextInput style={[globalStyles.input, styles.textArea]} placeholder="Content (Telugu)" value={editContentTe} onChangeText={setEditContentTe} multiline />
              <TouchableOpacity style={globalStyles.button} onPress={handleSaveText} disabled={isSavingText}>
                <Text style={globalStyles.buttonText}>Save Description</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.contentText}>
              {language === 'te' && section?.contentTe ? section.contentTe : section?.content}
            </Text>
          )}
        </View>

        {/* ─── RENDER SUB-LISTS/TABLES ─── */}
        {sectionKey === 'about' && (
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.subSectionTitle}>👥 Official Directory</Text>
            {user?.role === 'ADMIN' && (
              <TouchableOpacity style={styles.addBtn} onPress={() => openAddForm('official')}>
                <Text style={styles.addBtnText}>+ Add Official</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {sectionKey === 'water_supply' && (
          <>
            {/* OHSR Table */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.subSectionTitle}>🛢️ Overhead Service Reservoirs (OHSR)</Text>
              {user?.role === 'ADMIN' && (
                <TouchableOpacity style={styles.addBtn} onPress={() => openAddForm('ohsr')}>
                  <Text style={styles.addBtnText}>+ Add OHSR</Text>
                </TouchableOpacity>
              )}
            </View>
            {subList.map(item => (
              <View key={item.id} style={styles.subCard}>
                <Text style={styles.subCardTitle}>{item.name}</Text>
                <Text style={styles.subCardBody}>Capacity: {item.capacity} Lakh Lts</Text>
                <Text style={styles.subCardBody}>Pump Capacity: {item.pumpingCapacity || 'N/A'} HP</Text>
                <Text style={styles.subCardBody}>Location: {item.location}</Text>
                {item.remarks && <Text style={styles.subCardBody}>Note: {item.remarks}</Text>}
                {user?.role === 'ADMIN' && (
                  <View style={styles.subCardActions}>
                    <TouchableOpacity style={styles.editIconBtn} onPress={() => openEditForm('ohsr', item)}>
                      <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIconBtn} onPress={() => handleSubItemDelete('ohsr', item.id)}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            {/* GLSR Table */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.subSectionTitle}>⛲ Ground Level Reservoirs (GLSR)</Text>
              {user?.role === 'ADMIN' && (
                <TouchableOpacity style={styles.addBtn} onPress={() => openAddForm('glsr')}>
                  <Text style={styles.addBtnText}>+ Add GLSR</Text>
                </TouchableOpacity>
              )}
            </View>
            {subList2.map(item => (
              <View key={item.id} style={styles.subCard}>
                <Text style={styles.subCardTitle}>{item.name}</Text>
                <Text style={styles.subCardBody}>Capacity: {item.capacity} Lakh Lts</Text>
                <Text style={styles.subCardBody}>Location: {item.location}</Text>
                {user?.role === 'ADMIN' && (
                  <View style={styles.subCardActions}>
                    <TouchableOpacity style={styles.editIconBtn} onPress={() => openEditForm('glsr', item)}>
                      <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIconBtn} onPress={() => handleSubItemDelete('glsr', item.id)}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            {/* Direct Pumping */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.subSectionTitle}>🔌 Direct Pumping Systems</Text>
              {user?.role === 'ADMIN' && (
                <TouchableOpacity style={styles.addBtn} onPress={() => openAddForm('direct-pumping')}>
                  <Text style={styles.addBtnText}>+ Add Pump</Text>
                </TouchableOpacity>
              )}
            </View>
            {subList3.map(item => (
              <View key={item.id} style={styles.subCard}>
                <Text style={styles.subCardTitle}>{item.pumpName}</Text>
                <Text style={styles.subCardBody}>Source: {item.source}</Text>
                <Text style={styles.subCardBody}>Capacity: {item.capacity} HP</Text>
                <Text style={styles.subCardBody}>Status: {item.status}</Text>
                {user?.role === 'ADMIN' && (
                  <View style={styles.subCardActions}>
                    <TouchableOpacity style={styles.editIconBtn} onPress={() => openEditForm('direct-pumping', item)}>
                      <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIconBtn} onPress={() => handleSubItemDelete('direct-pumping', item.id)}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Street light Assets */}
        {sectionKey === 'street_lights' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.subSectionTitle}>📍 Street Light Assets</Text>
              {user?.role === 'ADMIN' && (
                <TouchableOpacity style={styles.addBtn} onPress={() => openAddForm('street-light-asset')}>
                  <Text style={styles.addBtnText}>+ Add Asset</Text>
                </TouchableOpacity>
              )}
            </View>
            {subList.map(item => (
              <View key={item.id} style={styles.subCard}>
                <Text style={styles.subCardTitle}>{item.area}</Text>
                <Text style={styles.subCardBody}>Poles: {item.poleCount} | LEDs: {item.ledCount}</Text>
                <Text style={styles.subCardBody}>Status: {item.workingStatus}</Text>
                {item.lastMaintenance && <Text style={styles.subCardBody}>Last Serviced: {new Date(item.lastMaintenance).toLocaleDateString()}</Text>}
                {user?.role === 'ADMIN' && (
                  <View style={styles.subCardActions}>
                    <TouchableOpacity style={styles.editIconBtn} onPress={() => openEditForm('street-light-asset', item)}>
                      <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIconBtn} onPress={() => handleSubItemDelete('street-light-asset', item.id)}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Health directory list */}
        {sectionKey === 'health' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.subSectionTitle}>🩺 Medical & ASHA Staff</Text>
              {user?.role === 'ADMIN' && (
                <TouchableOpacity style={styles.addBtn} onPress={() => openAddForm('health-staff')}>
                  <Text style={styles.addBtnText}>+ Add Staff</Text>
                </TouchableOpacity>
              )}
            </View>
            {subList.map(item => (
              <View key={item.id} style={styles.subCard}>
                <Text style={styles.subCardTitle}>{item.name}</Text>
                <Text style={styles.subCardSub}>{item.designation} • {item.area}</Text>
                <Text style={styles.subCardBody}>📞 {item.phone}</Text>
                {user?.role === 'ADMIN' && (
                  <View style={styles.subCardActions}>
                    <TouchableOpacity style={styles.editIconBtn} onPress={() => openEditForm('health-staff', item)}>
                      <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIconBtn} onPress={() => handleSubItemDelete('health-staff', item.id)}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Schools list */}
        {sectionKey === 'education' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.subSectionTitle}>🏫 Schools & Literacy Centres</Text>
              {user?.role === 'ADMIN' && (
                <TouchableOpacity style={styles.addBtn} onPress={() => openAddForm('school')}>
                  <Text style={styles.addBtnText}>+ Add School</Text>
                </TouchableOpacity>
              )}
            </View>
            {subList.map(item => (
              <View key={item.id} style={styles.subCard}>
                <Text style={styles.schoolName}>{item.schoolName}</Text>
                <Text style={styles.subCardSub}>{item.type} • {item.category}</Text>
                <Text style={styles.subCardBody}>Location: {item.location}</Text>
                <Text style={styles.subCardBody}>Strength: {item.total} (Boys: {item.boys} | Girls: {item.girls})</Text>
                {user?.role === 'ADMIN' && (
                  <View style={styles.subCardActions}>
                    <TouchableOpacity style={styles.editIconBtn} onPress={() => openEditForm('school', item)}>
                      <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIconBtn} onPress={() => handleSubItemDelete('school', item.id)}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Anganwadi list */}
        {sectionKey === 'anganwadi' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.subSectionTitle}>🧸 Anganwadi Centres</Text>
              {user?.role === 'ADMIN' && (
                <TouchableOpacity style={styles.addBtn} onPress={() => openAddForm('anganwadi-centre')}>
                  <Text style={styles.addBtnText}>+ Add Centre</Text>
                </TouchableOpacity>
              )}
            </View>
            {subList.map(item => (
              <View key={item.id} style={styles.subCard}>
                <Text style={styles.subCardTitle}>{item.centreName}</Text>
                <Text style={styles.subCardBody}>Location: {item.location}</Text>
                <Text style={styles.subCardBody}>Children: {item.total} (Boys: {item.boys} | Girls: {item.girls})</Text>
                {user?.role === 'ADMIN' && (
                  <View style={styles.subCardActions}>
                    <TouchableOpacity style={styles.editIconBtn} onPress={() => openEditForm('anganwadi-centre', item)}>
                      <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIconBtn} onPress={() => handleSubItemDelete('anganwadi-centre', item.id)}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* MGNREGS Works List */}
        {sectionKey === 'mgnregs' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.subSectionTitle}>🛠️ NREGS Projects</Text>
              {user?.role === 'ADMIN' && (
                <TouchableOpacity style={styles.addBtn} onPress={() => openAddForm('mgnregs-work')}>
                  <Text style={styles.addBtnText}>+ Add Work</Text>
                </TouchableOpacity>
              )}
            </View>
            {subList.map(item => (
              <View key={item.id} style={styles.subCard}>
                <Text style={styles.subCardTitle}>{item.workName}</Text>
                <Text style={styles.subCardSub}>{item.village} • Budget: ₹{item.budget}</Text>
                <Text style={styles.subCardBody}>Status: {item.status}</Text>
                {item.remarks && <Text style={styles.subCardBody}>Remarks: {item.remarks}</Text>}
                {user?.role === 'ADMIN' && (
                  <View style={styles.subCardActions}>
                    <TouchableOpacity style={styles.editIconBtn} onPress={() => openEditForm('mgnregs-work', item)}>
                      <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIconBtn} onPress={() => handleSubItemDelete('mgnregs-work', item.id)}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Pensions List */}
        {sectionKey === 'pensions' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.subSectionTitle}>👵 Pension Beneficiary Categories</Text>
              {user?.role === 'ADMIN' && (
                <TouchableOpacity style={styles.addBtn} onPress={() => openAddForm('pension-category')}>
                  <Text style={styles.addBtnText}>+ Add Category</Text>
                </TouchableOpacity>
              )}
            </View>
            {subList.map(item => (
              <View key={item.id} style={styles.subCard}>
                <Text style={styles.subCardTitle}>{item.category}</Text>
                <Text style={styles.subCardBody}>Beneficiaries: {item.beneficiaries}</Text>
                <Text style={styles.subCardBody}>Monthly Disbursement: ₹{item.monthlyAmount}</Text>
                {item.remarks && <Text style={styles.subCardBody}>Details: {item.remarks}</Text>}
                {user?.role === 'ADMIN' && (
                  <View style={styles.subCardActions}>
                    <TouchableOpacity style={styles.editIconBtn} onPress={() => openEditForm('pension-category', item)}>
                      <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIconBtn} onPress={() => handleSubItemDelete('pension-category', item.id)}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* VO Groups */}
        {sectionKey === 'shg_vo' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.subSectionTitle}>🏢 Village Organizations (VO)</Text>
              {user?.role === 'ADMIN' && (
                <TouchableOpacity style={styles.addBtn} onPress={() => openAddForm('vo-group')}>
                  <Text style={styles.addBtnText}>+ Add VO</Text>
                </TouchableOpacity>
              )}
            </View>
            {subList.map(item => (
              <View key={item.id} style={styles.subCard}>
                <Text style={styles.subCardTitle}>{item.voName}</Text>
                <Text style={styles.subCardSub}>{item.village} • President: {item.president}</Text>
                <Text style={styles.subCardBody}>Members: {item.members} | Phone: {item.phone}</Text>
                {user?.role === 'ADMIN' && (
                  <View style={styles.subCardActions}>
                    <TouchableOpacity style={styles.editIconBtn} onPress={() => openEditForm('vo-group', item)}>
                      <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIconBtn} onPress={() => handleSubItemDelete('vo-group', item.id)}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Community Assets */}
        {sectionKey === 'community_assets' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.subSectionTitle}>🏰 Community Assets List</Text>
              {user?.role === 'ADMIN' && (
                <TouchableOpacity style={styles.addBtn} onPress={() => openAddForm('community-asset')}>
                  <Text style={styles.addBtnText}>+ Add Asset</Text>
                </TouchableOpacity>
              )}
            </View>
            {subList.map(item => (
              <View key={item.id} style={styles.subCard}>
                <Text style={styles.subCardTitle}>{item.name}</Text>
                <Text style={styles.subCardBody}>Location: {item.location}</Text>
                <Text style={styles.subCardBody}>Condition: {item.condition}</Text>
                {item.remarks && <Text style={styles.subCardBody}>Note: {item.remarks}</Text>}
                {user?.role === 'ADMIN' && (
                  <View style={styles.subCardActions}>
                    <TouchableOpacity style={styles.editIconBtn} onPress={() => openEditForm('community-asset', item)}>
                      <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIconBtn} onPress={() => handleSubItemDelete('community-asset', item.id)}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Official Directory List */}
        {sectionKey === 'about' && (
          <FlatList
            data={subList}
            renderItem={renderOfficialCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}
      </ScrollView>

      {/* ─────────────────────────────────────────────────────────────────────────────
          CRUD FORM MODAL
          ───────────────────────────────────────────────────────────────────────────── */}
      <Modal visible={showFormModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {selectedItem ? 'Edit Entry' : 'Add New Entry'}
              </Text>
              <View style={styles.divider} />

              {/* ABOUT GP GENERAL METRICS FORM */}
              {activeFormType === 'about-gp' && (
                <>
                  <Text style={globalStyles.label}>GP Name</Text>
                  <TextInput style={globalStyles.input} value={formData.gpName} onChangeText={t => setFormData({ ...formData, gpName: t })} />
                  <Text style={globalStyles.label}>Mandal</Text>
                  <TextInput style={globalStyles.input} value={formData.mandal} onChangeText={t => setFormData({ ...formData, mandal: t })} />
                  <Text style={globalStyles.label}>District</Text>
                  <TextInput style={globalStyles.input} value={formData.district} onChangeText={t => setFormData({ ...formData, district: t })} />
                  <Text style={globalStyles.label}>GP Extent</Text>
                  <TextInput style={globalStyles.input} value={formData.gpExtent} onChangeText={t => setFormData({ ...formData, gpExtent: t })} />
                  <Text style={globalStyles.label}>Formation Details</Text>
                  <TextInput style={globalStyles.input} value={formData.formationDetails} onChangeText={t => setFormData({ ...formData, formationDetails: t })} />
                  <Text style={globalStyles.label}>Proceedings Number</Text>
                  <TextInput style={globalStyles.input} value={formData.proceedingsNumber} onChangeText={t => setFormData({ ...formData, proceedingsNumber: t })} />
                  <Text style={globalStyles.label}>Panchayat Secretary</Text>
                  <TextInput style={globalStyles.input} value={formData.panchayatSecretary} onChangeText={t => setFormData({ ...formData, panchayatSecretary: t })} />
                  <Text style={globalStyles.label}>Executive Officer</Text>
                  <TextInput style={globalStyles.input} value={formData.executiveOfficer} onChangeText={t => setFormData({ ...formData, executiveOfficer: t })} />
                  <Text style={globalStyles.label}>Male Population</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.malePopulation || '')} onChangeText={t => setFormData({ ...formData, malePopulation: t })} />
                  <Text style={globalStyles.label}>Female Population</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.femalePopulation || '')} onChangeText={t => setFormData({ ...formData, femalePopulation: t })} />
                  <Text style={globalStyles.label}>SC Population</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.scPopulation || '')} onChangeText={t => setFormData({ ...formData, scPopulation: t })} />
                  <Text style={globalStyles.label}>ST Population</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.stPopulation || '')} onChangeText={t => setFormData({ ...formData, stPopulation: t })} />
                  <Text style={globalStyles.label}>Total Assessments</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.totalAssessments || '')} onChangeText={t => setFormData({ ...formData, totalAssessments: t })} />
                  <Text style={globalStyles.label}>Audit Status</Text>
                  <TextInput style={globalStyles.input} value={formData.auditStatus} onChangeText={t => setFormData({ ...formData, auditStatus: t })} />
                  <Text style={globalStyles.label}>APIIC Estate Sy.37 (Acres)</Text>
                  <TextInput style={globalStyles.input} value={formData.apiicEstate37} onChangeText={t => setFormData({ ...formData, apiicEstate37: t })} />
                  <Text style={globalStyles.label}>APIIC Estate Sy.04 (Acres)</Text>
                  <TextInput style={globalStyles.input} value={formData.apiicEstate04} onChangeText={t => setFormData({ ...formData, apiicEstate04: t })} />
                  <Text style={globalStyles.label}>APIIC Total Acres</Text>
                  <TextInput style={globalStyles.input} value={formData.apiicTotalAcres} onChangeText={t => setFormData({ ...formData, apiicTotalAcres: t })} />
                  <Text style={globalStyles.label}>Utilisation of Savings - Target</Text>
                  <TextInput style={globalStyles.input} value={formData.savingsTarget} onChangeText={t => setFormData({ ...formData, savingsTarget: t })} />
                  <Text style={globalStyles.label}>Utilisation of Savings - Achievement</Text>
                  <TextInput style={globalStyles.input} value={formData.savingsAchievement} onChangeText={t => setFormData({ ...formData, savingsAchievement: t })} />
                  <Text style={globalStyles.label}>Utilisation of Savings - Percentage</Text>
                  <TextInput style={globalStyles.input} value={formData.savingsPercentage} onChangeText={t => setFormData({ ...formData, savingsPercentage: t })} />
                  <Text style={globalStyles.label}>Misappropriation Cases</Text>
                  <TextInput style={globalStyles.input} value={formData.misappropriationCases} onChangeText={t => setFormData({ ...formData, misappropriationCases: t })} />
                  <Text style={globalStyles.label}>Misappropriation Amount</Text>
                  <TextInput style={globalStyles.input} value={formData.misappropriationAmount} onChangeText={t => setFormData({ ...formData, misappropriationAmount: t })} />
                  <Text style={globalStyles.label}>Recovery Amount</Text>
                  <TextInput style={globalStyles.input} value={formData.recoveryAmount} onChangeText={t => setFormData({ ...formData, recoveryAmount: t })} />
                  <Text style={globalStyles.label}>FPOs in GP</Text>
                  <TextInput style={globalStyles.input} value={formData.fposInGp} onChangeText={t => setFormData({ ...formData, fposInGp: t })} />
                  <Text style={globalStyles.label}>Sri Nidhi Loans Granted</Text>
                  <TextInput style={globalStyles.input} value={formData.sriNidhiLoansGranted} onChangeText={t => setFormData({ ...formData, sriNidhiLoansGranted: t })} />
                  <Text style={globalStyles.label}>Sri Nidhi Amount</Text>
                  <TextInput style={globalStyles.input} value={formData.sriNidhiAmount} onChangeText={t => setFormData({ ...formData, sriNidhiAmount: t })} />
                  <Text style={globalStyles.label}>NPA</Text>
                  <TextInput style={globalStyles.input} value={formData.npa} onChangeText={t => setFormData({ ...formData, npa: t })} />
                  <Text style={globalStyles.label}>PNPA</Text>
                  <TextInput style={globalStyles.input} value={formData.pnpa} onChangeText={t => setFormData({ ...formData, pnpa: t })} />
                  <Text style={globalStyles.label}>Community Hall Location</Text>
                  <TextInput style={globalStyles.input} value={formData.communityHallLocation} onChangeText={t => setFormData({ ...formData, communityHallLocation: t })} />
                  <Text style={globalStyles.label}>Library Location</Text>
                  <TextInput style={globalStyles.input} value={formData.libraryLocation} onChangeText={t => setFormData({ ...formData, libraryLocation: t })} />
                </>
              )}

              {/* CUSTOM FIELDS FORM */}
              {activeFormType === 'custom-field' && (
                <>
                  <Text style={globalStyles.label}>Field / Row Label Name</Text>
                  <TextInput style={globalStyles.input} value={formData.fieldName} onChangeText={t => setFormData({ ...formData, fieldName: t })} placeholder="e.g. Total Area (Acres)" />
                  <Text style={globalStyles.label}>Row Value / Details</Text>
                  <TextInput style={globalStyles.input} value={formData.fieldValue} onChangeText={t => setFormData({ ...formData, fieldValue: t })} placeholder="e.g. 15.52 Sq Km" />
                </>
              )}

              {/* OFFICIALS DIRECTORY FORM */}
              {activeFormType === 'official' && (
                <>
                  <Text style={globalStyles.label}>Name</Text>
                  <TextInput style={globalStyles.input} value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} />
                  <Text style={globalStyles.label}>Designation</Text>
                  <TextInput style={globalStyles.input} value={formData.designation} onChangeText={t => setFormData({ ...formData, designation: t })} />
                  <Text style={globalStyles.label}>Phone Number</Text>
                  <TextInput keyboardType="phone-pad" style={globalStyles.input} value={formData.phoneNumber} onChangeText={t => setFormData({ ...formData, phoneNumber: t })} />
                  <Text style={globalStyles.label}>Office / Sachivalayam</Text>
                  <TextInput style={globalStyles.input} value={formData.office} onChangeText={t => setFormData({ ...formData, office: t })} />
                  <Text style={globalStyles.label}>Responsibilities</Text>
                  <TextInput style={globalStyles.input} value={formData.responsibilities} onChangeText={t => setFormData({ ...formData, responsibilities: t })} />
                  <Text style={globalStyles.label}>Status (ACTIVE / INACTIVE)</Text>
                  <TextInput style={globalStyles.input} value={formData.status} onChangeText={t => setFormData({ ...formData, status: t })} />
                </>
              )}

              {/* WATER SUPPLY STATS FORM */}
              {activeFormType === 'water-detail' && (
                <>
                  <Text style={globalStyles.label}>Total Water Schemes</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.totalWaterSchemes || '')} onChangeText={t => setFormData({ ...formData, totalWaterSchemes: t })} />
                  <Text style={globalStyles.label}>Private Tap Connections</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.privateConnections || '')} onChangeText={t => setFormData({ ...formData, privateConnections: t })} />
                  <Text style={globalStyles.label}>Public Tap Connections</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.publicConnections || '')} onChangeText={t => setFormData({ ...formData, publicConnections: t })} />
                  <Text style={globalStyles.label}>Hand Pumps</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.handPumps || '')} onChangeText={t => setFormData({ ...formData, handPumps: t })} />
                  <Text style={globalStyles.label}>Private Tap Fee Demand</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.privateTapFeeDemand || '')} onChangeText={t => setFormData({ ...formData, privateTapFeeDemand: t })} />
                  <Text style={globalStyles.label}>Total OHSRs</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.totalOHSRs || '')} onChangeText={t => setFormData({ ...formData, totalOHSRs: t })} />
                  <Text style={globalStyles.label}>Total GLSRs</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.totalGLSRs || '')} onChangeText={t => setFormData({ ...formData, totalGLSRs: t })} />
                  <Text style={globalStyles.label}>Direct Pumping Schemes</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.totalDirectPumping || '')} onChangeText={t => setFormData({ ...formData, totalDirectPumping: t })} />
                </>
              )}

              {/* OHSR FORM */}
              {activeFormType === 'ohsr' && (
                <>
                  <Text style={globalStyles.label}>Reservoir Name</Text>
                  <TextInput style={globalStyles.input} value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} />
                  <Text style={globalStyles.label}>Capacity (Lakh Lts)</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.capacity || '')} onChangeText={t => setFormData({ ...formData, capacity: t })} />
                  <Text style={globalStyles.label}>Pump Capacity (HP)</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.pumpingCapacity || '')} onChangeText={t => setFormData({ ...formData, pumpingCapacity: t })} />
                  <Text style={globalStyles.label}>Location</Text>
                  <TextInput style={globalStyles.input} value={formData.location} onChangeText={t => setFormData({ ...formData, location: t })} />
                  <Text style={globalStyles.label}>Remarks</Text>
                  <TextInput style={globalStyles.input} value={formData.remarks} onChangeText={t => setFormData({ ...formData, remarks: t })} />
                </>
              )}

              {/* GLSR FORM */}
              {activeFormType === 'glsr' && (
                <>
                  <Text style={globalStyles.label}>Reservoir Name</Text>
                  <TextInput style={globalStyles.input} value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} />
                  <Text style={globalStyles.label}>Capacity (Lakh Lts)</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.capacity || '')} onChangeText={t => setFormData({ ...formData, capacity: t })} />
                  <Text style={globalStyles.label}>Location</Text>
                  <TextInput style={globalStyles.input} value={formData.location} onChangeText={t => setFormData({ ...formData, location: t })} />
                </>
              )}

              {/* DIRECT PUMPING FORM */}
              {activeFormType === 'direct-pumping' && (
                <>
                  <Text style={globalStyles.label}>Pump Name</Text>
                  <TextInput style={globalStyles.input} value={formData.pumpName} onChangeText={t => setFormData({ ...formData, pumpName: t })} />
                  <Text style={globalStyles.label}>Source</Text>
                  <TextInput style={globalStyles.input} value={formData.source} onChangeText={t => setFormData({ ...formData, source: t })} />
                  <Text style={globalStyles.label}>Capacity (HP)</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.capacity || '')} onChangeText={t => setFormData({ ...formData, capacity: t })} />
                  <Text style={globalStyles.label}>Status</Text>
                  <TextInput style={globalStyles.input} value={formData.status} onChangeText={t => setFormData({ ...formData, status: t })} />
                </>
              )}

              {/* STREET LIGHT DETAILS FORM */}
              {activeFormType === 'street-light-detail' && (
                <>
                  <Text style={globalStyles.label}>Total Poles</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.totalPoles || '')} onChangeText={t => setFormData({ ...formData, totalPoles: t })} />
                  <Text style={globalStyles.label}>Total LED Lights</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.totalLEDs || '')} onChangeText={t => setFormData({ ...formData, totalLEDs: t })} />
                  <Text style={globalStyles.label}>Lighting Staff</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.lightingStaff || '')} onChangeText={t => setFormData({ ...formData, lightingStaff: t })} />
                </>
              )}

              {/* STREET LIGHT ASSETS FORM */}
              {activeFormType === 'street-light-asset' && (
                <>
                  <Text style={globalStyles.label}>Area Name</Text>
                  <TextInput style={globalStyles.input} value={formData.area} onChangeText={t => setFormData({ ...formData, area: t })} />
                  <Text style={globalStyles.label}>Poles</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.poleCount || '')} onChangeText={t => setFormData({ ...formData, poleCount: t })} />
                  <Text style={globalStyles.label}>LED Lights</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.ledCount || '')} onChangeText={t => setFormData({ ...formData, ledCount: t })} />
                  <Text style={globalStyles.label}>Status</Text>
                  <TextInput style={globalStyles.input} value={formData.workingStatus} onChangeText={t => setFormData({ ...formData, workingStatus: t })} />
                  <Text style={globalStyles.label}>Remarks</Text>
                  <TextInput style={globalStyles.input} value={formData.remarks} onChangeText={t => setFormData({ ...formData, remarks: t })} />
                </>
              )}

              {/* TAX & REVENUE FORM */}
              {activeFormType === 'tax-revenue' && (
                <>
                  <Text style={globalStyles.label}>Financial Year</Text>
                  <TextInput style={globalStyles.input} value={formData.financialYear} onChangeText={t => setFormData({ ...formData, financialYear: t })} />
                  <Text style={globalStyles.label}>House Tax</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.houseTax || '')} onChangeText={t => setFormData({ ...formData, houseTax: t })} />
                  <Text style={globalStyles.label}>Library Cess</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.libraryCess || '')} onChangeText={t => setFormData({ ...formData, libraryCess: t })} />
                  <Text style={globalStyles.label}>Water Tax</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.waterTax || '')} onChangeText={t => setFormData({ ...formData, waterTax: t })} />
                  <Text style={globalStyles.label}>Lighting Tax</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.lightingTax || '')} onChangeText={t => setFormData({ ...formData, lightingTax: t })} />
                  <Text style={globalStyles.label}>Drainage Tax</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.drainageTax || '')} onChangeText={t => setFormData({ ...formData, drainageTax: t })} />
                  <Text style={globalStyles.label}>Sports Tax</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.sportsTax || '')} onChangeText={t => setFormData({ ...formData, sportsTax: t })} />
                  <Text style={globalStyles.label}>Fire Cess</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.fireCess || '')} onChangeText={t => setFormData({ ...formData, fireCess: t })} />
                  <Text style={globalStyles.label}>House Tax Collection</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.houseTaxCollection || '')} onChangeText={t => setFormData({ ...formData, houseTaxCollection: t })} />
                  <Text style={globalStyles.label}>General Funds</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.generalFund || '')} onChangeText={t => setFormData({ ...formData, generalFund: t })} />
                  <Text style={globalStyles.label}>15th Finance Comm</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.fifteenthFC || '')} onChangeText={t => setFormData({ ...formData, fifteenthFC: t })} />
                </>
              )}

              {/* HEALTH STATS FORM */}
              {activeFormType === 'health-details' && (
                <>
                  <Text style={globalStyles.label}>Hospital Name</Text>
                  <TextInput style={globalStyles.input} value={formData.hospitalName} onChangeText={t => setFormData({ ...formData, hospitalName: t })} />
                  <Text style={globalStyles.label}>Health Centre</Text>
                  <TextInput style={globalStyles.input} value={formData.healthCentre} onChangeText={t => setFormData({ ...formData, healthCentre: t })} />
                  <Text style={globalStyles.label}>ASHA Workers</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.ashaWorkers || '')} onChangeText={t => setFormData({ ...formData, ashaWorkers: t })} />
                  <Text style={globalStyles.label}>ANMs</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.anms || '')} onChangeText={t => setFormData({ ...formData, anms: t })} />
                </>
              )}

              {/* HEALTH STAFF FORM */}
              {activeFormType === 'health-staff' && (
                <>
                  <Text style={globalStyles.label}>Name</Text>
                  <TextInput style={globalStyles.input} value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} />
                  <Text style={globalStyles.label}>Designation</Text>
                  <TextInput style={globalStyles.input} value={formData.designation} onChangeText={t => setFormData({ ...formData, designation: t })} />
                  <Text style={globalStyles.label}>Phone</Text>
                  <TextInput keyboardType="phone-pad" style={globalStyles.input} value={formData.phone} onChangeText={t => setFormData({ ...formData, phone: t })} />
                  <Text style={globalStyles.label}>Area Assigned</Text>
                  <TextInput style={globalStyles.input} value={formData.area} onChangeText={t => setFormData({ ...formData, area: t })} />
                  <Text style={globalStyles.label}>Status (ACTIVE / INACTIVE)</Text>
                  <TextInput style={globalStyles.input} value={formData.status} onChangeText={t => setFormData({ ...formData, status: t })} />
                </>
              )}

              {/* SCHOOLS FORM */}
              {activeFormType === 'school' && (
                <>
                  <Text style={globalStyles.label}>School Name</Text>
                  <TextInput style={globalStyles.input} value={formData.schoolName} onChangeText={t => setFormData({ ...formData, schoolName: t })} />
                  <Text style={globalStyles.label}>Type (GOVT / PRIVATE)</Text>
                  <TextInput style={globalStyles.input} value={formData.type} onChangeText={t => setFormData({ ...formData, type: t })} />
                  <Text style={globalStyles.label}>Category</Text>
                  <TextInput style={globalStyles.input} value={formData.category} onChangeText={t => setFormData({ ...formData, category: t })} />
                  <Text style={globalStyles.label}>Location</Text>
                  <TextInput style={globalStyles.input} value={formData.location} onChangeText={t => setFormData({ ...formData, location: t })} />
                  <Text style={globalStyles.label}>Boys Count</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.boys || '')} onChangeText={t => setFormData({ ...formData, boys: t })} />
                  <Text style={globalStyles.label}>Girls Count</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.girls || '')} onChangeText={t => setFormData({ ...formData, girls: t })} />
                </>
              )}

              {/* ANGANWADI STATS FORM */}
              {activeFormType === 'anganwadi-stats' && (
                <>
                  <Text style={globalStyles.label}>SAM Children</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.samChildren || '')} onChangeText={t => setFormData({ ...formData, samChildren: t })} />
                  <Text style={globalStyles.label}>MAM Children</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.mamChildren || '')} onChangeText={t => setFormData({ ...formData, mamChildren: t })} />
                </>
              )}

              {/* ANGANWADI CENTRE FORM */}
              {activeFormType === 'anganwadi-centre' && (
                <>
                  <Text style={globalStyles.label}>Centre Name</Text>
                  <TextInput style={globalStyles.input} value={formData.centreName} onChangeText={t => setFormData({ ...formData, centreName: t })} />
                  <Text style={globalStyles.label}>Location</Text>
                  <TextInput style={globalStyles.input} value={formData.location} onChangeText={t => setFormData({ ...formData, location: t })} />
                  <Text style={globalStyles.label}>Boys</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.boys || '')} onChangeText={t => setFormData({ ...formData, boys: t })} />
                  <Text style={globalStyles.label}>Girls</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.girls || '')} onChangeText={t => setFormData({ ...formData, girls: t })} />
                </>
              )}

              {/* MGNREGS DETAILS FORM */}
              {activeFormType === 'mgnregs-detail' && (
                <>
                  <Text style={globalStyles.label}>Job Cards</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.jobCards || '')} onChangeText={t => setFormData({ ...formData, jobCards: t })} />
                  <Text style={globalStyles.label}>Active Job Cards</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.activeJobCards || '')} onChangeText={t => setFormData({ ...formData, activeJobCards: t })} />
                  <Text style={globalStyles.label}>Works logged</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.works || '')} onChangeText={t => setFormData({ ...formData, works: t })} />
                  <Text style={globalStyles.label}>Estimated Cost</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.estimateCost || '')} onChangeText={t => setFormData({ ...formData, estimateCost: t })} />
                  <Text style={globalStyles.label}>Gokulam Sheds</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.gokulamSheds || '')} onChangeText={t => setFormData({ ...formData, gokulamSheds: t })} />
                  <Text style={globalStyles.label}>Sramika Sanghalu</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.sramikaSanghalu || '')} onChangeText={t => setFormData({ ...formData, sramikaSanghalu: t })} />
                  <Text style={globalStyles.label}>Completed Gokulam</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.completedGokulam || '')} onChangeText={t => setFormData({ ...formData, completedGokulam: t })} />
                </>
              )}

              {/* MGNREGS WORKS FORM */}
              {activeFormType === 'mgnregs-work' && (
                <>
                  <Text style={globalStyles.label}>Work Name</Text>
                  <TextInput style={globalStyles.input} value={formData.workName} onChangeText={t => setFormData({ ...formData, workName: t })} />
                  <Text style={globalStyles.label}>Village</Text>
                  <TextInput style={globalStyles.input} value={formData.village} onChangeText={t => setFormData({ ...formData, village: t })} />
                  <Text style={globalStyles.label}>Budget</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.budget || '')} onChangeText={t => setFormData({ ...formData, budget: t })} />
                  <Text style={globalStyles.label}>Status</Text>
                  <TextInput style={globalStyles.input} value={formData.status} onChangeText={t => setFormData({ ...formData, status: t })} />
                  <Text style={globalStyles.label}>Remarks</Text>
                  <TextInput style={globalStyles.input} value={formData.remarks} onChangeText={t => setFormData({ ...formData, remarks: t })} />
                </>
              )}

              {/* PENSION CATEGORIES FORM */}
              {activeFormType === 'pension-category' && (
                <>
                  <Text style={globalStyles.label}>Category</Text>
                  <TextInput style={globalStyles.input} value={formData.category} onChangeText={t => setFormData({ ...formData, category: t })} />
                  <Text style={globalStyles.label}>Beneficiaries</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.beneficiaries || '')} onChangeText={t => setFormData({ ...formData, beneficiaries: t })} />
                  <Text style={globalStyles.label}>Monthly Amount</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.monthlyAmount || '')} onChangeText={t => setFormData({ ...formData, monthlyAmount: t })} />
                  <Text style={globalStyles.label}>Remarks</Text>
                  <TextInput style={globalStyles.input} value={formData.remarks} onChangeText={t => setFormData({ ...formData, remarks: t })} />
                </>
              )}

              {/* AGRICULTURE STATS FORM */}
              {activeFormType === 'agriculture-stats' && (
                <>
                  <Text style={globalStyles.label}>Cultivable Land (Acres)</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.cultivableLand || '')} onChangeText={t => setFormData({ ...formData, cultivableLand: t })} />
                  <Text style={globalStyles.label}>Rabi Area (Acres)</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.rabiArea || '')} onChangeText={t => setFormData({ ...formData, rabiArea: t })} />
                  <Text style={globalStyles.label}>Land Sown (Acres)</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.landSown || '')} onChangeText={t => setFormData({ ...formData, landSown: t })} />
                  <Text style={globalStyles.label}>Groundnut (Quintals)</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.groundnutQuintals || '')} onChangeText={t => setFormData({ ...formData, groundnutQuintals: t })} />
                  <Text style={globalStyles.label}>Polam Badies</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.polamBadies || '')} onChangeText={t => setFormData({ ...formData, polamBadies: t })} />
                  <Text style={globalStyles.label}>Samples Collected</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.samplesCollected || '')} onChangeText={t => setFormData({ ...formData, samplesCollected: t })} />
                  <Text style={globalStyles.label}>Samples Analysed</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.samplesAnalysed || '')} onChangeText={t => setFormData({ ...formData, samplesAnalysed: t })} />
                  <Text style={globalStyles.label}>Soil Cards</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.soilCards || '')} onChangeText={t => setFormData({ ...formData, soilCards: t })} />
                  <Text style={globalStyles.label}>PM Kisan Beneficiaries</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.pmKisan || '')} onChangeText={t => setFormData({ ...formData, pmKisan: t })} />
                  <Text style={globalStyles.label}>Amount Paid</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.amountPaid || '')} onChangeText={t => setFormData({ ...formData, amountPaid: t })} />
                  <Text style={globalStyles.label}>Crop Insurance Farmers</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.cropInsuranceFarmers || '')} onChangeText={t => setFormData({ ...formData, cropInsuranceFarmers: t })} />
                  <Text style={globalStyles.label}>Heavy Rain Affected Farmers</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.heavyRainAffectedFarmers || '')} onChangeText={t => setFormData({ ...formData, heavyRainAffectedFarmers: t })} />
                  <Text style={globalStyles.label}>Heavy Rain Damage Area (Acres)</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.heavyRainDamageArea || '')} onChangeText={t => setFormData({ ...formData, heavyRainDamageArea: t })} />
                  <Text style={globalStyles.label}>Heavy Rain Damage Amount (Lakhs)</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.heavyRainDamageAmount || '')} onChangeText={t => setFormData({ ...formData, heavyRainDamageAmount: t })} />
                </>
              )}

              {/* HORTICULTURE STATS FORM */}
              {activeFormType === 'horticulture-stats' && (
                <>
                  <Text style={globalStyles.label}>Area (Acres)</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.area || '')} onChangeText={t => setFormData({ ...formData, area: t })} />
                  <Text style={globalStyles.label}>Production (Tonnes)</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.production || '')} onChangeText={t => setFormData({ ...formData, production: t })} />
                  <Text style={globalStyles.label}>MIDH Target (Physical)</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.midhPhysical || '')} onChangeText={t => setFormData({ ...formData, midhPhysical: t })} />
                  <Text style={globalStyles.label}>MIDH Target (Budget)</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.midhTotal || '')} onChangeText={t => setFormData({ ...formData, midhTotal: t })} />
                  <Text style={globalStyles.label}>RKVM Target (Physical)</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.rkvmPhysical || '')} onChangeText={t => setFormData({ ...formData, rkvmPhysical: t })} />
                  <Text style={globalStyles.label}>RKVM Target (Budget)</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.rkvmTotal || '')} onChangeText={t => setFormData({ ...formData, rkvmTotal: t })} />
                </>
              )}

              {/* ANIMAL HUSBANDRY FORM */}
              {activeFormType === 'animal-husbandry-stats' && (
                <>
                  <Text style={globalStyles.label}>Cattle</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.cattle || '')} onChangeText={t => setFormData({ ...formData, cattle: t })} />
                  <Text style={globalStyles.label}>Buffaloes</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.buffaloes || '')} onChangeText={t => setFormData({ ...formData, buffaloes: t })} />
                  <Text style={globalStyles.label}>Sheep</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.sheep || '')} onChangeText={t => setFormData({ ...formData, sheep: t })} />
                  <Text style={globalStyles.label}>Goats</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.goats || '')} onChangeText={t => setFormData({ ...formData, goats: t })} />
                  <Text style={globalStyles.label}>Vaccinations Achieved</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.vaccination || '')} onChangeText={t => setFormData({ ...formData, vaccination: t })} />
                  <Text style={globalStyles.label}>Mini Gokulam units</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.gokulamInaugurated || '')} onChangeText={t => setFormData({ ...formData, gokulamInaugurated: t })} />
                </>
              )}

              {/* SHG STATS FORM */}
              {activeFormType === 'shg-stats' && (
                <>
                  <Text style={globalStyles.label}>Total SHGs</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.totalSHGs || '')} onChangeText={t => setFormData({ ...formData, totalSHGs: t })} />
                  <Text style={globalStyles.label}>Active SHGs</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.activeSHGs || '')} onChangeText={t => setFormData({ ...formData, activeSHGs: t })} />
                  <Text style={globalStyles.label}>Loans Disbursed</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.loans || '')} onChangeText={t => setFormData({ ...formData, loans: t })} />
                  <Text style={globalStyles.label}>Savings</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.savings || '')} onChangeText={t => setFormData({ ...formData, savings: t })} />
                  <Text style={globalStyles.label}>Recovery Percentage</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.recovery || '')} onChangeText={t => setFormData({ ...formData, recovery: t })} />
                  <Text style={globalStyles.label}>Sri Nidhi Funding</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.sriNidhi || '')} onChangeText={t => setFormData({ ...formData, sriNidhi: t })} />
                </>
              )}

              {/* VO GROUP FORM */}
              {activeFormType === 'vo-group' && (
                <>
                  <Text style={globalStyles.label}>VO Name</Text>
                  <TextInput style={globalStyles.input} value={formData.voName} onChangeText={t => setFormData({ ...formData, voName: t })} />
                  <Text style={globalStyles.label}>Village</Text>
                  <TextInput style={globalStyles.input} value={formData.village} onChangeText={t => setFormData({ ...formData, village: t })} />
                  <Text style={globalStyles.label}>Members</Text>
                  <TextInput keyboardType="numeric" style={globalStyles.input} value={String(formData.members || '')} onChangeText={t => setFormData({ ...formData, members: t })} />
                  <Text style={globalStyles.label}>President Name</Text>
                  <TextInput style={globalStyles.input} value={formData.president} onChangeText={t => setFormData({ ...formData, president: t })} />
                  <Text style={globalStyles.label}>Phone Number</Text>
                  <TextInput keyboardType="phone-pad" style={globalStyles.input} value={formData.phone} onChangeText={t => setFormData({ ...formData, phone: t })} />
                  <Text style={globalStyles.label}>Status</Text>
                  <TextInput style={globalStyles.input} value={formData.status} onChangeText={t => setFormData({ ...formData, status: t })} />
                </>
              )}

              {/* COMMUNITY ASSETS FORM */}
              {activeFormType === 'community-asset' && (
                <>
                  <Text style={globalStyles.label}>Asset Name</Text>
                  <TextInput style={globalStyles.input} value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} />
                  <Text style={globalStyles.label}>Location</Text>
                  <TextInput style={globalStyles.input} value={formData.location} onChangeText={t => setFormData({ ...formData, location: t })} />
                  <Text style={globalStyles.label}>Condition</Text>
                  <TextInput style={globalStyles.input} value={formData.condition} onChangeText={t => setFormData({ ...formData, condition: t })} />
                  <Text style={globalStyles.label}>Remarks</Text>
                  <TextInput style={globalStyles.input} value={formData.remarks} onChangeText={t => setFormData({ ...formData, remarks: t })} />
                </>
              )}

              {/* SUBMIT ACTIONS */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.cancelBtn]}
                  onPress={() => setShowFormModal(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.saveBtn]}
                  onPress={async () => {
                    if (
                      activeFormType === 'about-gp' ||
                      activeFormType === 'water-detail' ||
                      activeFormType === 'street-light-detail' ||
                      activeFormType === 'tax-revenue' ||
                      activeFormType === 'health-details' ||
                      activeFormType === 'anganwadi-stats' ||
                      activeFormType === 'mgnregs-detail' ||
                      activeFormType === 'agriculture-stats' ||
                      activeFormType === 'horticulture-stats' ||
                      activeFormType === 'animal-husbandry-stats' ||
                      activeFormType === 'shg-stats'
                    ) {
                      await updateGeneralStats(activeFormType, formData);
                      setShowFormModal(false);
                    } else {
                      await handleSubItemSubmit();
                    }
                  }}
                >
                  <Text style={styles.saveText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SectionDetailScreen;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  editBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  contentText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: COLORS.surface, // Pure White card
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#2E294E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  statsEditBtn: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statsEditBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  addBtn: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  subCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  schoolName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subCardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  subCardBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  editIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  deleteText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionBtn: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  saveBtn: {
    backgroundColor: COLORS.accent, // Gold
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  saveText: {
    color: '#2E294E', // Space Indigo text on Gold
    fontWeight: 'bold',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#2E294E', // Space Indigo Header
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  tableCellActions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    justifyContent: 'flex-end',
  },
  tableCellActionsHeader: {
    width: 60,
    textAlign: 'right',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#FFFFFF', // White text on Space Indigo header
  },
  noDataText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
    fontStyle: 'italic',
  },
});
