import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSnackbar } from '../../context/SnackbarContext';
import { COLORS } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register, isLoading, error, clearError } = useAuth();
  const { t } = useLanguage();
  const { showSnackbar } = useSnackbar();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!fullName.trim() || !phone.trim() || !email.trim() || !password || !confirmPassword) {
      showSnackbar(t('fillAllFields'), 'error');
      return;
    }

    if (password !== confirmPassword) {
      showSnackbar('Passwords do not match.', 'error');
      return;
    }

    const result = await register({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
    });

    if (result.success) {
      showSnackbar('Registration successful! You can now log in.', 'success');
      navigation.navigate('Login');
    } else {
      showSnackbar(result.message || 'An error occurred.', 'error');
    }
  };

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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.logoCircle}>
              <Image source={require('../../../assets/ggp_logo.jpg')} style={styles.logoImg} />
            </View>

            <Text style={styles.brandTitle}>{t('brandTitle')}</Text>
            <Text style={styles.brandSub}>{t('brandSub')}</Text>
          </View>

          {/* Form Container Overlay */}
          <View style={styles.formCard}>
            <Text style={styles.welcomeTitle}>{t('registerTitle')}</Text>
            <Text style={styles.welcomeSub}>{t('registerSub')}</Text>

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Full Name Input */}
            <Text style={styles.fieldLabel}>{t('fullName')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#595959" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="E.g., Ramesh Kumar"
                placeholderTextColor="#A0AEC0"
                value={fullName}
                onChangeText={(val) => {
                  setFullName(val);
                  clearError();
                }}
              />
            </View>

            {/* Phone Input */}
            <Text style={styles.fieldLabel}>{t('phoneNumber')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={18} color="#595959" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="10-digit number"
                placeholderTextColor="#A0AEC0"
                value={phone}
                onChangeText={(val) => {
                  setPhone(val);
                  clearError();
                }}
                keyboardType="phone-pad"
              />
            </View>

            {/* Email Input */}
            <Text style={styles.fieldLabel}>{t('emailAddress')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#595959" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="name@domain.com"
                placeholderTextColor="#A0AEC0"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  clearError();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <Text style={styles.fieldLabel}>{t('desiredPassword')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#595959" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="At least 6 characters"
                placeholderTextColor="#A0AEC0"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  clearError();
                }}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Confirm Password Input */}
            <Text style={styles.fieldLabel}>{t('desiredPassword')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#595959" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Re-enter password"
                placeholderTextColor="#A0AEC0"
                value={confirmPassword}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  clearError();
                }}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signInText}>{t('registerBtn')}</Text>
              )}
            </TouchableOpacity>

          </View>

          {/* Footer Navigation */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLinkText}>{t('signIn')}</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EADEDA', // Dust Grey backdrop
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  brandHeader: {
    backgroundColor: '#2E294E', // Space Indigo
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    top: 55,
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  logoImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  brandSub: {
    fontSize: 11,
    color: '#EADEDA', // Dust Grey
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: -20,
    padding: 24,
    shadowColor: '#2E294E', // Space Indigo shadow
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F1F1F', // Dark Charcoal
    textAlign: 'center',
  },
  welcomeSub: {
    fontSize: 13,
    color: '#595959', // Slate Gray
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '600',
    marginBottom: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F43F5E',
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#595959', // Slate Gray
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D2C4C0', // Border color
    borderRadius: 14,
    backgroundColor: '#FDFDF6',
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: '#1F1F1F', // Dark Charcoal
    fontSize: 14,
    fontWeight: '600',
  },
  signInBtn: {
    backgroundColor: '#FFD400', // Gold accent
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    shadowColor: '#FFD400',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  signInText: {
    color: '#2E294E', // Space Indigo text on Gold button
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerText: {
    color: '#595959', // Slate Gray
    fontSize: 14,
    fontWeight: '600',
  },
  footerLinkText: {
    color: '#820263', // Royal Plum brand link
    fontWeight: '800',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
