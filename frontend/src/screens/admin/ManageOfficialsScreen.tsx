import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useAuth, API_BASE_URL } from '../../context/AuthContext';
import { COLORS } from '../../styles/theme';
import { useLanguage } from '../../context/LanguageContext';

export default function ManageOfficialsScreen({ navigation }: any) {
  const { token } = useAuth();
  const { language } = useLanguage();
  const [officials, setOfficials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState<any>(null);

  // Form State
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photo, setPhoto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOfficials = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/modules/officials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setOfficials(data);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch officials');
      }
    } catch (error) {
      Alert.alert('Error', 'Network request failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficials();
  }, []);

  const openAddModal = () => {
    setEditingOfficial(null);
    setName('');
    setDesignation('');
    setPhoneNumber('');
    setPhoto('');
    setModalVisible(true);
  };

  const openEditModal = (official: any) => {
    setEditingOfficial(official);
    setName(official.name);
    setDesignation(official.designation);
    setPhoneNumber(official.phoneNumber);
    let existingPhoto = official.photo || '';
    if (existingPhoto && !existingPhoto.startsWith('http') && !existingPhoto.startsWith('file')) {
      existingPhoto = `${API_BASE_URL}${existingPhoto}`;
    }
    setPhoto(existingPhoto);
    setModalVisible(true);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0].uri) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Official', 'Are you sure you want to delete this official profile?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/modules/officials/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
              setOfficials(prev => prev.filter(o => o.id !== id));
            } else {
              Alert.alert('Error', 'Failed to delete official');
            }
          } catch (e) {
            Alert.alert('Error', 'Network request failed');
          }
        }
      }
    ]);
  };

  const handleSave = async () => {
    if (!name || !designation || !phoneNumber) {
      Alert.alert('Validation Error', 'Name, Designation, and Phone are required.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const url = editingOfficial 
        ? `${API_BASE_URL}/modules/officials/${editingOfficial.id}` 
        : `${API_BASE_URL}/modules/officials`;

      let response;
      if (photo && (photo.startsWith('file://') || photo.startsWith('content://'))) {
        response = await FileSystem.uploadAsync(url, photo, {
          fieldName: 'photo',
          httpMethod: editingOfficial ? 'PUT' : 'POST',
          uploadType: (FileSystem as any).UploadType ? (FileSystem as any).UploadType.MULTIPART : 1,
          parameters: {
            name,
            designation,
            phoneNumber,
            office: 'Gram Panchayat',
            responsibilities: 'Official Duties',
            status: 'ACTIVE',
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.status === 201 || response.status === 200) {
          Alert.alert('Success', `Official successfully ${editingOfficial ? 'updated' : 'added'}.`);
          setModalVisible(false);
          fetchOfficials();
        } else {
          let errorData = { message: 'Failed to save official.' };
          try { errorData = JSON.parse(response.body); } catch(e) {}
          Alert.alert('Error', errorData.message || 'Failed to save official.');
        }
      } else {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('designation', designation);
        formData.append('phoneNumber', phoneNumber);
        formData.append('office', 'Gram Panchayat');
        formData.append('responsibilities', 'Official Duties');
        formData.append('status', 'ACTIVE');
        
        response = await fetch(url, {
          method: editingOfficial ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });
        
        const data = await response.json();
        if (response.ok) {
          Alert.alert('Success', `Official successfully ${editingOfficial ? 'updated' : 'added'}.`);
          setModalVisible(false);
          fetchOfficials();
        } else {
          Alert.alert('Error', data.message || 'Failed to save official.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Network request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOfficial = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.designation}>{item.designation}</Text>
        <Text style={styles.phone}><Ionicons name="call" size={12} /> {item.phoneNumber}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
          <Ionicons name="pencil" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash" size={20} color="#D90368" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{language === 'te' ? 'అధికారుల నిర్వహణ' : 'Manage Officials'}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {officials.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No officials found in directory.</Text>
        </View>
      ) : (
        <FlatList
          data={officials}
          keyExtractor={item => item.id}
          renderItem={renderOfficial}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingOfficial ? 'Edit Official' : 'Add Official'}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#595959" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Full Name *</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Ashok Kumar" />

              <Text style={styles.label}>Designation *</Text>
              <TextInput style={styles.input} value={designation} onChangeText={setDesignation} placeholder="e.g. Sarpanch" />

              <Text style={styles.label}>Phone Number *</Text>
              <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="e.g. 9876543210" keyboardType="phone-pad" />

              <Text style={styles.label}>Profile Photo (Optional)</Text>
              <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                <Ionicons name="image" size={20} color="#820263" />
                <Text style={styles.imagePickerText}>{photo ? 'Change Photo' : 'Select Photo'}</Text>
              </TouchableOpacity>
              {photo ? (
                <View style={styles.imagePreviewWrapper}>
                  <Image source={{ uri: photo }} style={styles.imagePreview} />
                </View>
              ) : null}

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Official</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EADEDA', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '900', color: '#2E294E' },
  addBtn: { flexDirection: 'row', backgroundColor: '#820263', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 4 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#2E294E' },
  designation: { fontSize: 13, color: '#820263', fontWeight: '600', marginVertical: 4 },
  phone: { fontSize: 12, color: '#595959' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionBtn: { padding: 8, backgroundColor: '#F3EBF0', borderRadius: 8 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#595959', fontSize: 16 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2E294E' },
  label: { fontSize: 13, fontWeight: '600', color: '#595959', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#F3EBF0', borderRadius: 10, padding: 12, fontSize: 15, color: '#2E294E' },
  saveBtn: { backgroundColor: '#2E294E', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  saveBtnText: { color: '#FFD400', fontSize: 16, fontWeight: 'bold' },
  imagePickerBtn: { backgroundColor: '#F3EBF0', borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePickerText: { color: '#820263', fontWeight: 'bold' },
  imagePreviewWrapper: { marginTop: 16, alignItems: 'center' },
  imagePreview: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EADEDA' }
});
