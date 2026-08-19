import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ImageBackground, Animated, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, globalStyles } from '../styles/theme';
import { API_BASE_URL, FILE_BASE_URL } from '../config/api';

const ProfileScreen: React.FC = () => {
  const { user, logout, updateUser, token } = useAuth();
  const { t, language } = useLanguage();
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone. Your personal data will be anonymized, but your past civic complaints will remain for official records.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const res = await fetch(`${API_BASE_URL}/auth/delete-account`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (!res.ok) throw new Error("Failed to delete account");
              Alert.alert("Success", "Your account has been deleted.");
              await logout();
            } catch (err: any) {
              Alert.alert("Error", err.message || "An error occurred");
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleUpdateProfile = async () => {
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert(t('validationError'), t('fieldsCannotBlank'));
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = { ...user, fullName: fullName.trim(), phone: phone.trim() };
      await updateUser(updatedUser as any);
      Alert.alert(t('successTitle'), t('profileSaved'));
      setIsEditing(false);
    } catch (err: any) {
      Alert.alert(t('errorTitle'), err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={globalStyles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          style={{ flex: 1, backgroundColor: COLORS.background }} 
          contentContainerStyle={styles.container} 
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Header Block */}
          <View style={[globalStyles.card, styles.profileCard]}>
            <ImageBackground
              source={require('../../assets/kalamkari_bg.png')}
              style={styles.profileBg}
              imageStyle={{ opacity: 0.12, resizeMode: 'cover' }}
            >
              <View style={styles.profileCardContent}>
                <Animated.View style={[styles.avatarRing, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarLetter}>
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                </Animated.View>
                <View style={styles.avatarDetails}>
                  <Text style={styles.fullNameText}>{user?.fullName}</Text>
                  <Text style={styles.usernameText}>@{user?.username}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>{user?.role} PORTAL</Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>

          {/* Account Details Card */}
          <View style={globalStyles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTitle}>{t('accountInformation')}</Text>
              {!isEditing && (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text style={styles.editText}>{t('editProfile')}</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.divider} />

            <Text style={styles.fieldLabel}>{t('registeredEmail')}</Text>
            <Text style={styles.fieldVal}>{user?.email}</Text>

            <Text style={styles.fieldLabel}>{t('userAccountId')}</Text>
            <Text style={styles.fieldValCode}>{user?.id}</Text>

            {user?.role === 'EMPLOYEE' && user?.employeeId && (
              <>
                <Text style={styles.fieldLabel}>{t('staffEmployeeId')}</Text>
                <Text style={styles.fieldValCode}>{user.employeeId}</Text>

                <Text style={styles.fieldLabel}>{t('departmentWard')}</Text>
                <Text style={styles.fieldVal}>{t('municipalServices')}</Text>
              </>
            )}

            {isEditing ? (
              <View style={{ marginTop: 8 }}>
                <Text style={globalStyles.label}>{t('fullName')}</Text>
                <TextInput
                  style={globalStyles.input}
                  value={fullName}
                  onChangeText={setFullName}
                />

                <Text style={globalStyles.label}>{t('phoneNumber')}</Text>
                <TextInput
                  style={globalStyles.input}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />

                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.cancelBtn]}
                    onPress={() => {
                      setIsEditing(false);
                      setFullName(user?.fullName || '');
                      setPhone(user?.phone || '');
                    }}
                    disabled={isSaving}
                  >
                    <Text style={styles.cancelText}>{t('cancelBtn')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.saveBtn]}
                    onPress={handleUpdateProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.saveText}>{t('saveProfile')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.fieldLabel}>{t('contactPhone')}</Text>
                <Text style={styles.fieldVal}>{user?.phone}</Text>
              </View>
            )}
          </View>

          {/* Legal & Account Actions */}
          <View style={[globalStyles.card, { marginTop: 16 }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTitle}>Legal & Support</Text>
            </View>
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.actionRow}
              onPress={() => Linking.openURL(`${FILE_BASE_URL}/privacy-policy`)}
            >
              <Ionicons name="document-text-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.actionRowText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
            
            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.actionRow}
              onPress={() => Linking.openURL(`${FILE_BASE_URL}/delete-account`)}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={[styles.actionRowText, { color: COLORS.error }]}>
                Delete Account
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.error} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  profileCard: {
    padding: 0,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    overflow: 'hidden',
  },
  profileBg: {
    width: '100%',
    padding: 20,
  },
  profileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: 'bold',
  },
  avatarDetails: {
    marginLeft: 16,
    flex: 1,
  },
  fullNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  usernameText: {
    fontSize: 14,
    color: COLORS.primaryLight,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  editText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldVal: {
    fontSize: 15,
    color: COLORS.text,
    marginTop: 2,
  },
  fieldValCode: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionBtn: {
    flex: 0.48,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 16,
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionRowText: {
    fontSize: 15,
    marginLeft: 12,
    color: COLORS.text,
    fontWeight: '500',
  }
});
