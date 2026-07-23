import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Switch,
  Image
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import { useLanguage } from '../../context/LanguageContext';
import { COLORS } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login, isLoading, error, clearError, bypassLogin } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { t, language, changeLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showSnackbar(t('fillAllFields'), 'error');
      return;
    }

    const success = await login(email.trim().toLowerCase(), password);
    if (!success) {
      // AuthContext handles setting error message
    }
  };

  const handleBypassPress = async (role: 'ADMIN' | 'CITIZEN') => {
    const bypassEmail = role === 'ADMIN' ? 'admin@panchayat.gov.in' : 'citizen@example.com';
    const bypassPassword = role === 'ADMIN' ? 'Admin@123' : 'Citizen@123';
    
    showSnackbar(`${t('loadingText')} (${role})`, 'info');
    const success = await login(bypassEmail, bypassPassword);
    if (!success) {
      await bypassLogin(role);
      showSnackbar(`Offline bypass active (${role})`, 'warning');
    } else {
      showSnackbar(`Logged in (${role})`, 'success');
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

          {/* Login Form Container Overlay */}
          <View style={styles.formCard}>
            <Text style={styles.welcomeTitle}>{t('welcomeTitle')}</Text>
            <Text style={styles.welcomeSub}>{t('welcomeSub')}</Text>

            {/* Social Icons Row */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="logo-google" size={18} color="#EA4335" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="logo-facebook" size={18} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="logo-twitter" size={18} color="#1DA1F2" />
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Email Input */}
            <Text style={styles.fieldLabel}>{t('emailLabel')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="name@domain.com"
                placeholderTextColor={COLORS.textSecondary}
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
            <Text style={styles.fieldLabel}>{t('passwordLabel')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  clearError();
                }}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Remember Me Switch Row */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{t('rememberMe')}</Text>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: '#CBD5E1', true: '#FFD400' }}
                thumbColor={rememberMe ? '#820263' : '#F4F3F4'}
              />
            </View>

            {/* Main Sign In Button */}
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signInText}>{t('signIn')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>{t('recoverPassword')}</Text>
            </TouchableOpacity>

            {/* Testing Bypass Panel */}
            <View style={styles.bypassCard}>
              <Text style={styles.bypassTitle}>{t('bypassPanelTitle')}</Text>
              <View style={styles.bypassRow}>
                <TouchableOpacity
                  style={[styles.bypassBtn, { backgroundColor: '#E8ECCB' }]}
                  onPress={() => handleBypassPress('ADMIN')}
                  disabled={isLoading}
                >
                  <Text style={styles.bypassBtnText}>{t('adminBypass')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.bypassBtn, { backgroundColor: '#E8ECCB' }]}
                  onPress={() => handleBypassPress('CITIZEN')}
                  disabled={isLoading}
                >
                  <Text style={styles.bypassBtnText}>{t('citizenBypass')}</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>

          {/* Footer Navigation */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('dontHaveAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLinkText}>{t('signUp')}</Text>
            </TouchableOpacity>
          </View>

          {/* Language Switch */}
          <View style={styles.langSwitchContainer}>
            <TouchableOpacity 
              style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.langBtn, language === 'te' && styles.langBtnActive]}
              onPress={() => changeLanguage('te')}
            >
              <Text style={[styles.langBtnText, language === 'te' && styles.langBtnTextActive]}>తెలుగు</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

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
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 18,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#595959', // Slate Gray
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
  forgotBtn: {
    alignSelf: 'center',
    marginTop: 18,
  },
  forgotText: {
    color: '#820263', // Royal Plum brand action
    fontWeight: '700',
    fontSize: 13,
  },
  bypassCard: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#D2C4C0',
  },
  bypassTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#595959', // Slate Gray
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  bypassRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bypassBtn: {
    flex: 0.48,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bypassBtnText: {
    color: '#820263', // Royal Plum brand text
    fontWeight: '800',
    fontSize: 12,
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
  langSwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  langBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  langBtnActive: {
    backgroundColor: '#FFD400',
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#595959',
  },
  langBtnTextActive: {
    color: '#2E294E',
  },
});
