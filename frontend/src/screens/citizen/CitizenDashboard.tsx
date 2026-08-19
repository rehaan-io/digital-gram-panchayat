import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, ImageBackground, Animated, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, globalStyles } from '../../styles/theme';
import { API_BASE_URL } from '../../config/api';

const CitizenDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout, updateUser, token } = useAuth();
  
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
      Alert.alert('Validation Error', 'Fields cannot be blank.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = { ...user, fullName: fullName.trim(), phone: phone.trim() };
      await updateUser(updatedUser as any);
      Alert.alert('Profile Saved', 'Your profile details have been updated successfully.');
      setIsEditing(false);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: COLORS.background }} 
      contentContainerStyle={styles.container}
    >
      {/* Profile Header Block */}
      <View style={[globalStyles.card, styles.profileCard]}>
        <ImageBackground
          source={require('../../../assets/kalamkari_bg.png')}
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
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>VERIFIED CITIZEN</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Account Info Details */}
      <View style={globalStyles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderTitle}>Account Information</Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.editText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.divider} />

        <Text style={styles.fieldLabel}>Registered Email</Text>
        <Text style={styles.fieldVal}>{user?.email}</Text>

        <Text style={styles.fieldLabel}>Citizen ID (UUID)</Text>
        <Text style={styles.fieldValCode}>{user?.id}</Text>

        {isEditing ? (
          <View style={{ marginTop: 8 }}>
            <Text style={globalStyles.label}>Full Name</Text>
            <TextInput
              style={globalStyles.input}
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={globalStyles.label}>Phone Number</Text>
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
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.saveBtn]}
                onPress={handleUpdateProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveText}>Save Details</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.fieldLabel}>Contact Phone</Text>
            <Text style={styles.fieldVal}>{user?.phone}</Text>
          </View>
        )}
      </View>

      {/* Village Map Section */}
      <View style={globalStyles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderTitle}>Gorantla Mandal Village Map</Text>
        </View>
        <View style={styles.divider} />
        <Image 
          source={require('../../../assets/village_map.png')}
          style={styles.villageMapImage}
        />
        <Text style={styles.villageMapCaption}>
          Overview of roads, habitations, and connectivity in Gorantla Mandal.
        </Text>
      </View>

      {/* Nav Menu */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('GenerateTicket')}
        >
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>File New Complaint</Text>
            <Text style={styles.menuSub}>Submit issue to Panchayat Board</Text>
          </View>
          <Text style={styles.arrowIcon}>➔</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyTickets')}
        >
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>My Registered Tickets</Text>
            <Text style={styles.menuSub}>Track resolution and view timelines</Text>
          </View>
          <Text style={styles.arrowIcon}>➔</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Home')}
        >
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Service Portal Info</Text>
            <Text style={styles.menuSub}>Panchayat services & directory</Text>
          </View>
          <Text style={styles.arrowIcon}>➔</Text>
        </TouchableOpacity>
      </View>

      {/* Legal & Account Actions */}
      <View style={[globalStyles.card, { marginTop: 16 }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderTitle}>Legal & Support</Text>
        </View>
        <View style={styles.divider} />
        
        <TouchableOpacity 
          style={styles.actionRow}
          onPress={() => Linking.openURL(`${API_BASE_URL.replace('/api', '')}/privacy-policy`)}
        >
          <Ionicons name="document-text-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionRowText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        
        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.actionRow}
          onPress={handleDeleteAccount}
          disabled={isDeleting}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          <Text style={[styles.actionRowText, { color: COLORS.error }]}>
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.error} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

export default CitizenDashboard;

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
  verifiedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  verifiedBadgeText: {
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
  menuContainer: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  menuItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  menuSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 14,
    color: COLORS.primary,
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
  villageMapImage: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
    borderRadius: 8,
    marginTop: 8,
  },
  villageMapCaption: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
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
