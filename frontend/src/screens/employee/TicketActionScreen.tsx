import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomDateTimePicker from '../../components/CustomDateTimePicker';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { COLORS, globalStyles } from '../../styles/theme';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../../config/api';
import * as FileSystem from 'expo-file-system/legacy';
import { useSnackbar } from '../../context/SnackbarContext';

const TicketActionScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const { token } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { t, language } = useLanguage();

  const [remarks, setRemarks] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estDateTime, setEstDateTime] = useState(new Date());

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showSnackbar('Camera roll access is required to upload completion images.', 'warning');
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

  const handleSubmitCompletion = async () => {
    if (!remarks.trim()) {
      showSnackbar(language === 'te' ? 'దయచేసి పని పూర్తయిన వివరాల గమనికలను రాయండి.' : 'Please write completion remarks.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (imageUri) {
        const response = await FileSystem.uploadAsync(`${API_BASE_URL}/tickets/${ticketId}/status`, imageUri, {
          fieldName: 'completionImage',
          httpMethod: 'PATCH',
          uploadType: (FileSystem as any).UploadType ? (FileSystem as any).UploadType.MULTIPART : 1,
          parameters: {
            status: 'COMPLETED',
            remarks: remarks.trim(),
            expectedCompletion: estDateTime.toISOString(),
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.status !== 200) {
          let errorData = { message: 'Failed to update ticket.' };
          try {
            errorData = JSON.parse(response.body);
          } catch(e) {}
          throw new Error(errorData.message || 'Failed to update ticket.');
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'COMPLETED',
            remarks: remarks.trim(),
            expectedCompletion: estDateTime.toISOString(),
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to update ticket.');
        }
      }

      showSnackbar('Your status update has been successfully submitted.', 'success');
      navigation.navigate('EmployeeTabs', { screen: 'AssignedTickets' });
    } catch (err: any) {
      showSnackbar(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={globalStyles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={globalStyles.card}>
            <Text style={styles.header}>{t('updateProgressTitle')}</Text>
            <Text style={styles.sub}>
              {language === 'te' ? 'పని పూర్తయినట్లు ధృవీకరించడానికి ఫోటోను మరియు గమనికలను జతచేయండి.' : 'Submit photographic evidence and work remarks to mark this complaint resolved.'}
            </Text>
            <View style={styles.divider} />

            {/* Completion Remarks */}
            <Text style={globalStyles.label}>{t('remarksActionTaken')}</Text>
            <TextInput
              style={[globalStyles.input, styles.textArea]}
              placeholder={t('placeholderActionTaken')}
              placeholderTextColor={COLORS.textSecondary}
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Estimated Completion Date & Time */}
            <Text style={globalStyles.label}>{t('expectedCompletionDate')}</Text>
            <CustomDateTimePicker
              value={estDateTime}
              onChange={setEstDateTime}
              mode="datetime"
              minDate={new Date()}
              label={language === 'te' ? 'పూర్తయ్యే అంచనా సమయం' : 'Set Your Estimated Completion'}
            />
            <View style={styles.previewBox}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.previewText}>
                ETA: {estDateTime.toLocaleString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
              </Text>
            </View>

            {/* Image Picker */}
            <Text style={globalStyles.label}>{t('resolutionImage')}</Text>
            <Text style={styles.note}>{language === 'te' ? 'గమనిక: ధృవీకరణ కోసం ఫోటో ప్రూఫ్ ఐచ్ఛికం' : 'Note: Photo proof is optional for validation'}</Text>
            
            {imageUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity onPress={() => setImageUri(null)} style={styles.removeBtn}>
                  <Text style={styles.removeText}>{language === 'te' ? 'తీసివేసి మళ్ళీ తీసుకోండి' : 'Remove & Re-take'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={pickImage} style={styles.imgPickerBtn}>
                <Text style={styles.pickerText}>{t('uploadCompletionPhoto')}</Text>
              </TouchableOpacity>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[globalStyles.button, { marginTop: 24 }]}
              onPress={handleSubmitCompletion}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={globalStyles.buttonText}>{t('submitStatusUpdate')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default TicketActionScreen;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  sub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  textArea: {
    height: 100,
  },
  note: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  imgPickerBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 90,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  pickerText: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
    fontSize: 14,
  },
  previewContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  removeBtn: {
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  removeText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: 'bold',
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.primaryLight,
    marginVertical: 6,
  },
  datePickerText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  previewText: {
    fontSize: 13,
    color: '#065F46',
    fontWeight: '700',
  },
});
