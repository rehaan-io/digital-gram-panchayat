import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TextInput,
  TouchableOpacity, Image, ActivityIndicator,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard,
  Modal,
} from 'react-native';
import { useAuth, API_BASE_URL } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSnackbar } from '../../context/SnackbarContext';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';

export const CATEGORIES_MAP = [
  { key: 'Road', te: 'రోడ్డు', en: 'Road' },
  { key: 'Street Light', te: 'వీధి దీపం', en: 'Street Light' },
  { key: 'Garbage', te: 'చెత్త / వ్యర్థాలు', en: 'Garbage' },
  { key: 'Water Supply', te: 'తాగునీటి సరఫరా', en: 'Water Supply' },
  { key: 'Water Stocked', te: 'నిల్వ ఉన్న నీరు', en: 'Water Stocked' },
  { key: 'Drainage', te: 'డ్రైనేజీ', en: 'Drainage' },
  { key: 'Hygiene', te: 'శుభ్రత / ఆరోగ్యం', en: 'Hygiene' },
  { key: 'Pest Control', te: 'దోమల / కీటకాల నివారణ', en: 'Pest Control' },
  { key: 'Electricity', te: 'విద్యుత్ సమస్య', en: 'Electricity' },
  { key: 'Others', te: 'ఇతరములు', en: 'Others' },
];

interface FieldErrors {
  category?: string;
  title?: string;
  description?: string;
  location?: string;
}

const GenerateTicketScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { token, user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { t, language } = useLanguage();

  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showSnackbar('Camera roll access is required to upload images.', 'warning');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showSnackbar('Location access is required to use this feature.', 'warning');
        return;
      }
      const coords = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const [address] = await Location.reverseGeocodeAsync({
        latitude: coords.coords.latitude,
        longitude: coords.coords.longitude,
      });

      const parts = [
        address.name,
        address.street,
        address.district,
        address.city,
        address.region,
        address.postalCode,
      ].filter(Boolean);

      const fullAddress = parts.join(', ');
      setLocation(fullAddress);
      setErrors((prev) => ({ ...prev, location: undefined }));
    } catch (err) {
      showSnackbar('Could not fetch location. Please enter it manually.', 'error');
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};
    if (!category) newErrors.category = language === 'te' ? 'దయచేసి ఒక విభాగాన్ని ఎంచుకోండి.' : 'Please select a complaint category.';
    if (!title.trim()) newErrors.title = language === 'te' ? 'సమస్య శీర్షిక అవసరం.' : 'Problem title is required.';
    if (!description.trim()) newErrors.description = language === 'te' ? 'సమస్య వివరణ అవసరం.' : 'Description is required.';
    if (!location.trim()) newErrors.location = language === 'te' ? 'సమస్య ఉన్న స్థలం / చిరునామా అవసరం.' : 'Location / address is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateTicket = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (imageUri) {
        const response = await FileSystem.uploadAsync(`${API_BASE_URL}/tickets`, imageUri, {
          fieldName: 'image',
          httpMethod: 'POST',
          uploadType: (FileSystem as any).UploadType ? (FileSystem as any).UploadType.MULTIPART : 1,
          parameters: {
            category,
            title: title.trim(),
            description: description.trim(),
            location: location.trim(),
            ...(alternatePhone.trim() ? { alternatePhone: alternatePhone.trim() } : {})
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.status !== 201 && response.status !== 200) {
          let errorData = { message: 'Failed to submit complaint.' };
          try {
            errorData = JSON.parse(response.body);
          } catch(e) {}
          throw new Error(errorData.message || 'Failed to submit complaint.');
        }
        
        const data = JSON.parse(response.body);
        setSuccessTicketId(data.ticket.ticketId || data.ticket.id);
      } else {
        const formData = new FormData();
        formData.append('category', category);
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('location', location.trim());
        if (alternatePhone.trim()) formData.append('alternatePhone', alternatePhone.trim());

        const response = await fetch(`${API_BASE_URL}/tickets`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to submit complaint.');
        setSuccessTicketId(data.ticket.ticketId || data.ticket.id);
      }

      // Reset form
      setCategory(''); setTitle(''); setDescription('');
      setLocation(''); setAlternatePhone(''); setImageUri(null); setErrors({});

    } catch (error: any) {
      showSnackbar(error.message || 'An error occurred.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? (
      <View style={styles.errorRow}>
        <Ionicons name="alert-circle" size={14} color="#F43F5E" />
        <Text style={styles.errorText}>{msg}</Text>
      </View>
    ) : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          
          {/* Curved Brand Header */}
          <View style={styles.brandHeader}>
            {/* User Info Corners */}
            <View style={styles.headerUserInfo}>
              <View style={styles.headerUserLeft}>
                <Ionicons name="person-circle" size={14} color="#FFD400" />
                <Text style={styles.headerUserText} numberOfLines={1}>{user?.fullName}</Text>
              </View>
              <View style={styles.headerUserRight}>
                <Ionicons name="call" size={12} color="#FFD400" />
                <Text style={styles.headerUserText}>{user?.phone}</Text>
              </View>
            </View>

            <View style={styles.logoCircle}>
              <Ionicons name="megaphone" size={36} color="#2E294E" />
            </View>
            <Text style={styles.brandTitle}>{t('raiseTicketTitle')}</Text>
            <Text style={styles.brandSub}>{language === 'te' ? 'మీ ఫిర్యాదును నమోదు చేయండి' : 'Report an issue to your Panchayat'}</Text>
          </View>

          {/* Form Card Overlay */}
          <View style={styles.formCard}>
            
            {/* Horizontal Scrolling Category Chips */}
            <View style={styles.fieldHeaderRow}>
              <Text style={styles.fieldLabel}>{t('issueCategory')} <Text style={styles.required}>*</Text></Text>
              <View style={styles.scrollHint}>
                <Text style={styles.scrollHintText}>Swipe</Text>
                <Ionicons name="arrow-forward" size={10} color="#A0AEC0" />
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
              {CATEGORIES_MAP.map((cat) => {
                const isActive = category === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[styles.categoryChip, isActive && styles.activeChip]}
                    onPress={() => { setCategory(cat.key); setErrors((p) => ({ ...p, category: undefined })); }}
                  >
                    <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                      {language === 'te' ? cat.te : cat.en}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <FieldError msg={errors.category} />

            {/* Title Input */}
            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>{language === 'te' ? 'సమస్య శీర్షిక' : 'Problem Title'} <Text style={styles.required}>*</Text></Text>
            <View style={[styles.inputWrapper, errors.title && styles.inputWrapperError]}>
              <Ionicons name="text-outline" size={18} color="#595959" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder={language === 'te' ? 'సమస్యను క్లుప్తంగా రాయండి' : 'Short title of the problem'}
                placeholderTextColor="#A0AEC0"
                value={title}
                onChangeText={(t) => { setTitle(t); setErrors((p) => ({ ...p, title: undefined })); }}
              />
            </View>
            <FieldError msg={errors.title} />

            {/* Description Input */}
            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>{t('descriptionLabel')} <Text style={styles.required}>*</Text></Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper, errors.description && styles.inputWrapperError]}>
              <TextInput
                style={styles.textAreaInput}
                placeholder={t('placeholderDescribe')}
                placeholderTextColor="#A0AEC0"
                value={description}
                onChangeText={(t) => { setDescription(t); setErrors((p) => ({ ...p, description: undefined })); }}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            <FieldError msg={errors.description} />

            {/* Location Input with embedded GPS button */}
            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>{language === 'te' ? 'స్థలం / చిరునామా' : 'Location Address'} <Text style={styles.required}>*</Text></Text>
            <View style={[styles.inputWrapper, styles.locationWrapper, errors.location && styles.inputWrapperError]}>
              <Ionicons name="location-outline" size={18} color="#595959" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder={language === 'te' ? 'వార్డు నంబర్ లేదా చిరునామా ఎంటర్ చేయండి' : 'Address / Ward details'}
                placeholderTextColor="#A0AEC0"
                value={location}
                onChangeText={(t) => { setLocation(t); setErrors((p) => ({ ...p, location: undefined })); }}
              />
              <TouchableOpacity
                style={styles.gpsBtn}
                onPress={handleUseCurrentLocation}
                disabled={isFetchingLocation}
              >
                {isFetchingLocation ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="locate" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
            <FieldError msg={errors.location} />

            {/* Alternate Phone */}
            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>{t('alternatePhone')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={18} color="#595959" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder={language === 'te' ? 'సంప్రదించవలసిన నంబర్' : 'Contact details'}
                placeholderTextColor="#A0AEC0"
                value={alternatePhone}
                onChangeText={setAlternatePhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Image Upload Area */}
            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>{t('attachPhoto')} <Text style={styles.optionalNote}>(Optional)</Text></Text>
            
            {imageUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity onPress={() => setImageUri(null)} style={styles.removeImgBtn}>
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={pickImage} style={styles.imgPickerBtn}>
                <View style={styles.imgIconCircle}>
                  <Ionicons name="camera-outline" size={24} color="#820263" />
                </View>
                <Text style={styles.pickerText}>{t('chooseGallery')}</Text>
                <Text style={styles.pickerSubText}>Max 200KB — auto-compressed</Text>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleCreateTicket}
              disabled={isSubmitting}
              activeOpacity={0.9}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitText}>{t('submitTicket')}</Text>
                  <Ionicons name="paper-plane" size={18} color="#2E294E" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Modern Success Overlay Modal */}
      <Modal visible={successTicketId !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-sharp" size={42} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>{language === 'te' ? 'ఫిర్యాదు సమర్పించబడింది!' : 'Ticket Created!'}</Text>
            <Text style={styles.successSubtitle}>
              {language === 'te' ? 'మీ ఫిర్యాదు విజయవంతంగా నమోదు చేయబడింది.' : 'Your issue has been reported and queued for assignment.'}
            </Text>

            <View style={styles.ticketIdBadge}>
              <Text style={styles.ticketIdText}>{language === 'te' ? 'ఫిర్యాదు ఐడి' : 'ID'}: {successTicketId}</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.closeBtn]}
                onPress={() => setSuccessTicketId(null)}
              >
                <Text style={styles.closeBtnText}>{language === 'te' ? 'రద్దు చేయి' : 'Dismiss'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.viewBtn]}
                onPress={() => {
                  setSuccessTicketId(null);
                  navigation.navigate('CitizenTabs', { screen: 'MyTickets' });
                }}
              >
                <Text style={styles.viewBtnText}>{t('myComplaintsTitle')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
};

export default GenerateTicketScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EADEDA', // Dust Grey backdrop
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  brandHeader: {
    backgroundColor: '#2E294E', // Space Indigo
    paddingTop: 60,
    paddingBottom: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
  },
  headerUserInfo: {
    position: 'absolute',
    top: 50, // To avoid status bar
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerUserLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  headerUserRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerUserText: {
    color: '#EADEDA',
    fontSize: 12,
    fontWeight: '700',
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFD400',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#FFD400',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  brandSub: {
    fontSize: 12,
    color: '#EADEDA', 
    fontWeight: '600',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: -30,
    padding: 24,
    shadowColor: '#2E294E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#595959',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 8,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scrollHintText: {
    fontSize: 10,
    color: '#A0AEC0',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  required: {
    color: '#F43F5E',
  },
  optionalNote: {
    textTransform: 'none',
    color: '#A0AEC0',
    fontSize: 10,
    fontWeight: '600',
  },
  categoryContainer: {
    paddingVertical: 4,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: '#FFD400',
    borderColor: '#FFD400',
    shadowColor: '#FFD400',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  chipText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '700',
  },
  activeChipText: {
    color: '#2E294E',
    fontWeight: '900',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D2C4C0',
    borderRadius: 14,
    backgroundColor: '#FDFDF6',
    paddingHorizontal: 14,
    marginBottom: 6,
    height: 50,
  },
  inputWrapperError: {
    borderColor: '#F43F5E',
    backgroundColor: '#FFF1F2',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: '#1F1F1F',
    fontSize: 14,
    fontWeight: '600',
  },
  textAreaWrapper: {
    height: 100,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  textAreaInput: {
    flex: 1,
    width: '100%',
    color: '#1F1F1F',
    fontSize: 14,
    fontWeight: '600',
  },
  locationWrapper: {
    paddingRight: 6, // Make room for GPS button
  },
  gpsBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#820263', // Royal Plum
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 4,
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
  },
  imgPickerBtn: {
    borderWidth: 1.5,
    borderColor: '#D2C4C0',
    borderStyle: 'dashed',
    borderRadius: 16,
    height: 110,
    backgroundColor: '#FDFDF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  imgIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FCE7F3', // Light pink
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickerText: {
    color: '#820263',
    fontWeight: '800',
    fontSize: 14,
  },
  pickerSubText: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  previewContainer: {
    marginTop: 4,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EADEDA',
  },
  removeImgBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFD400', // Gold accent
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FFD400',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  submitText: {
    color: '#2E294E', // Space Indigo text
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(46, 41, 78, 0.7)', // Indigo tint blur
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2E294E', // Indigo
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2E294E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F1F1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#595959',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  ticketIdBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  ticketIdText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#820263', // Royal Plum
    letterSpacing: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    backgroundColor: '#F3F4F6',
  },
  closeBtnText: {
    color: '#595959',
    fontWeight: '800',
    fontSize: 14,
  },
  viewBtn: {
    backgroundColor: '#820263', // Royal Plum
  },
  viewBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
