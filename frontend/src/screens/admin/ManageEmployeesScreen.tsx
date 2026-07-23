import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, API_BASE_URL } from '../../context/AuthContext';
import { COLORS, globalStyles } from '../../styles/theme';

interface Employee {
  id: string;
  userId: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  department: string;
  photo?: string | null;
  leaveStatus?: 'ON_DUTY' | 'ON_LEAVE' | 'LEAVE_REQUESTED';
  activeTicketsCount: number;
}

const ManageEmployeesScreen: React.FC = () => {
  const { token } = useAuth();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Leave and Image picker states
  const [activeTab, setActiveTab] = useState<'workers' | 'leaves'>('workers');
  const [leaves, setLeaves] = useState<any[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load employee list.');
      const data = await response.json();
      setEmployees(data);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/leaves`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setLeaves(data);
      }
    } catch (err: any) {
      console.error('Fetch leaves error:', err);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permissions are required to select staff photo.');
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleUpdateLeaveStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/leaves/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        Alert.alert('Success', `Leave request status updated to ${status.toLowerCase()}.`);
        fetchLeaves();
        fetchEmployees();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to update leave request.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchLeaves();
  }, []);

  const handleCreateEmployee = async () => {
    if (!fullName.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'All mandatory fields are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (photo && (photo.startsWith('file://') || photo.startsWith('content://'))) {
        const url = `${API_BASE_URL}/admin/employees`;
        const uploadResult = await FileSystem.uploadAsync(url, photo, {
          fieldName: 'photo',
          httpMethod: 'POST',
          uploadType: (FileSystem as any).UploadType ? (FileSystem as any).UploadType.MULTIPART : 1,
          parameters: {
            fullName: fullName.trim(),
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            password,
            department: department.trim() || 'General Services',
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (uploadResult.status === 201 || uploadResult.status === 200) {
          const resJson = JSON.parse(uploadResult.body);
          Alert.alert(
            'Staff Account Created',
            `Employee created successfully!\nName: ${fullName}\nGenerated ID: ${resJson.user.employeeId}`
          );
          
          setFullName('');
          setPhone('');
          setEmail('');
          setPassword('');
          setDepartment('');
          setPhoto(null);
          setShowAddForm(false);
          fetchEmployees();
        } else {
          let errorData = { message: 'Failed to create employee.' };
          try { errorData = JSON.parse(uploadResult.body); } catch(e) {}
          Alert.alert('Error', errorData.message || 'Failed to create employee.');
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/admin/employees`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: fullName.trim(),
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            password,
            department: department.trim() || 'General Services',
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to create employee.');
        }

        Alert.alert(
          'Staff Account Created',
          `Employee created successfully!\nName: ${fullName}\nGenerated ID: ${data.user.employeeId}`
        );

        setFullName('');
        setPhone('');
        setEmail('');
        setPassword('');
        setDepartment('');
        setPhoto(null);
        setShowAddForm(false);
        fetchEmployees();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: Employee }) => {
    let statusColor = '#10B981'; // green for ON_DUTY
    let statusText = 'On Duty';
    if (item.leaveStatus === 'ON_LEAVE') {
      statusColor = '#EF4444'; // red
      statusText = 'On Leave';
    } else if (item.leaveStatus === 'LEAVE_REQUESTED') {
      statusColor = '#F59E0B'; // orange
      statusText = 'Requesting Leave';
    }

    return (
      <View style={[globalStyles.card, styles.refCardContainer]}>
        {/* Top Header Block: Avatar + Name + ID Badge */}
        <View style={styles.cardHeaderRow}>
          {item.photo ? (
            <Image source={{ uri: item.photo }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-circle-sharp" size={70} color="#CBD5E1" />
            </View>
          )}
          <View style={styles.headerDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.refEmpName} numberOfLines={1}>
                {item.fullName}
              </Text>
              <View style={styles.expBadge}>
                <Text style={styles.expBadgeText}>{item.employeeId}</Text>
              </View>
            </View>
            <Text style={styles.refDepartment} numberOfLines={1}>
              {item.department || 'General Services'}
            </Text>
          </View>
        </View>

        <View style={styles.refDivider} />

        {/* Info Rows */}
        <View style={styles.refInfoSection}>
          <Text style={styles.refInfoText}>
            <Text style={{ fontWeight: '700', color: COLORS.text }}>Speaks: </Text>
            Telugu, English, Hindi
          </Text>
          <Text style={styles.refInfoText}>
            <Text style={{ fontWeight: '700', color: COLORS.text }}>Contact: </Text>
            {item.phone}
          </Text>
          <Text style={styles.refInfoText}>
            <Text style={{ fontWeight: '700', color: COLORS.text }}>Email: </Text>
            {item.email}
          </Text>
        </View>

        {/* Footer Slots Block */}
        <View style={styles.refFooter}>
          <View style={styles.slotContainer}>
            <Text style={styles.slotLabel}>Current Status:</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.slotValue, { color: statusColor }]}>{statusText}</Text>
            </View>
          </View>
          
          <View style={styles.footerActionBtn}>
            <Text style={styles.footerActionText}>Workload: {item.activeTicketsCount} tickets</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={globalStyles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Panchayat Staff Hub</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddForm(!showAddForm)}>
          <Text style={styles.addBtnText}>{showAddForm ? 'Close Form' : 'Add Staff'}</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'workers' && styles.activeTabBtn]}
          onPress={() => setActiveTab('workers')}
        >
          <Text style={[styles.tabText, activeTab === 'workers' && styles.activeTabText]}>
            Staff Registry ({employees.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'leaves' && styles.activeTabBtn]}
          onPress={() => setActiveTab('leaves')}
        >
          <Text style={[styles.tabText, activeTab === 'leaves' && styles.activeTabText]}>
            Leave Requests ({leaves.filter(l => l.status === 'PENDING').length} New)
          </Text>
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <ScrollView style={styles.formCard} keyboardShouldPersistTaps="handled">
          <Text style={styles.formTitle}>Add New Staff Member</Text>
          <Text style={styles.formNote}>Employee accounts are created pre-verified.</Text>

          <Text style={globalStyles.label}>Full Name *</Text>
          <TextInput style={globalStyles.input} placeholder="Rajesh Patel" placeholderTextColor={COLORS.textSecondary} value={fullName} onChangeText={setFullName} />

          <Text style={globalStyles.label}>Phone Number *</Text>
          <TextInput style={globalStyles.input} placeholder="987654XXXX" placeholderTextColor={COLORS.textSecondary} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <Text style={globalStyles.label}>Email Address *</Text>
          <TextInput style={globalStyles.input} placeholder="rajesh@panchayat.gov.in" placeholderTextColor={COLORS.textSecondary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <Text style={globalStyles.label}>Credentials Password *</Text>
          <TextInput style={globalStyles.input} placeholder="Enter password" placeholderTextColor={COLORS.textSecondary} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />

          <Text style={globalStyles.label}>Department / Ward assignment</Text>
          <TextInput style={globalStyles.input} placeholder="E.g., Sanitation / Lights" placeholderTextColor={COLORS.textSecondary} value={department} onChangeText={setDepartment} />

          <Text style={globalStyles.label}>Profile Picture (Optional)</Text>
          <View style={styles.imgPickerRow}>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
              <Ionicons name="image" size={16} color={COLORS.primary} />
              <Text style={styles.imagePickerText}>{photo ? 'Change Photo' : 'Select Photo'}</Text>
            </TouchableOpacity>
            {photo && (
              <Image source={{ uri: photo }} style={styles.formImagePreview} />
            )}
          </View>

          <TouchableOpacity style={[globalStyles.button, { marginVertical: 20 }]} onPress={handleCreateEmployee} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={globalStyles.buttonText}>Register Employee</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : activeTab === 'workers' ? (
        <FlatList
          data={employees}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <Text style={styles.emptyText}>No employee staff records registered.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      ) : (
        <FlatList
          data={leaves}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={globalStyles.card}>
              <View style={styles.leaveCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.leaveCardName}>{item.employeeName}</Text>
                  <Text style={styles.leaveCardCode}>{item.employeeCode} • {item.employeeEmail}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { 
                    backgroundColor: item.status === 'APPROVED' 
                      ? COLORS.successLight 
                      : item.status === 'REJECTED' 
                        ? COLORS.errorLight 
                        : COLORS.warningLight 
                  }
                ]}>
                  <Text style={[
                    styles.statusText,
                    {
                      color: item.status === 'APPROVED' 
                        ? COLORS.success 
                        : item.status === 'REJECTED' 
                          ? COLORS.error 
                          : COLORS.warning 
                    }
                  ]}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              
              <Text style={styles.leaveDates}>
                <Text style={{ fontWeight: 'bold' }}>Duration: </Text>
                {new Date(item.startDate).toLocaleDateString()} to {new Date(item.endDate).toLocaleDateString()}
              </Text>
              
              <Text style={styles.leaveReason}>
                <Text style={{ fontWeight: 'bold' }}>Reason: </Text>
                {item.reason}
              </Text>

              {item.status === 'PENDING' && (
                <View style={styles.leaveActionsRow}>
                  <TouchableOpacity 
                    style={[styles.leaveActionBtn, styles.approveBtn]} 
                    onPress={() => handleUpdateLeaveStatus(item.id, 'APPROVED')}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.leaveActionBtnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.leaveActionBtn, styles.rejectBtn]} 
                    onPress={() => handleUpdateLeaveStatus(item.id, 'REJECTED')}
                  >
                    <Ionicons name="close-circle-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.leaveActionBtnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <Text style={styles.emptyText}>No leave requests recorded.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default ManageEmployeesScreen;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addBtnText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    maxHeight: 350,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  formNote: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  
  // ── Tab Bar ──
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
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

  // ── Image Picker Row ──
  imgPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 10,
  },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EBF0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  imagePickerText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  formImagePreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CBD5E1',
  },

  // ── Reference Circular Staff Card ──
  refCardContainer: {
    padding: 18,
    borderRadius: 18,
    shadowColor: '#2E294E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarImg: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#F1F5F9',
  },
  avatarPlaceholder: {
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  headerDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  refEmpName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2E294E',
    flex: 1,
  },
  expBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expBadgeText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  refDepartment: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  refDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  refInfoSection: {
    gap: 4,
    marginBottom: 14,
  },
  refInfoText: {
    fontSize: 13,
    color: '#595959',
    lineHeight: 18,
  },
  refFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  slotContainer: {
    justifyContent: 'center',
  },
  slotLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  slotValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  footerActionBtn: {
    backgroundColor: '#FF8A00', // Mockup orange theme action button
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  footerActionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // ── Leave Review List ──
  leaveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaveCardName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  leaveCardCode: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  leaveDates: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  leaveReason: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  leaveActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  leaveActionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  approveBtn: {
    backgroundColor: '#10B981',
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
  },
  leaveActionBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
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
