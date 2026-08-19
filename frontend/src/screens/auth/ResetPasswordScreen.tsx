import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { COLORS, globalStyles } from '../../styles/theme';

const ResetPasswordScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { resetPassword } = useAuth();
  const { t } = useLanguage();
  const routeEmail = route.params?.email || '';

  const [email, setEmail] = useState(routeEmail);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async () => {
    if (!email.trim() || !token.trim() || !newPassword) {
      Alert.alert(t('errorTitle'), t('fillAllFields'));
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      Alert.alert(t('errorTitle'), 'Password must be at least 8 characters in TOTAL (including at least 1 uppercase, 1 lowercase, 1 number, and 1 special character).');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      newPassword,
    });
    setIsSubmitting(false);

    if (result.success) {
      Alert.alert(
        t('successTitle'),
        'Password has been reset successfully. Please login with your new credentials.',
        [{ text: t('okBtn'), onPress: () => navigation.navigate('Login') }]
      );
    } else {
      Alert.alert(t('errorTitle'), result.message || 'Failed to reset password.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={globalStyles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={globalStyles.card}>
            <Text style={styles.headerText}>{t('resetPassword')}</Text>
            <Text style={styles.subText}>
              Enter the 6-digit verification code sent to your email along with your new password.
            </Text>

            <Text style={globalStyles.label}>{t('emailAddress')}</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="ramesh@example.com"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={globalStyles.label}>Verification Code (6-digit)</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="123456"
              placeholderTextColor={COLORS.textSecondary}
              value={token}
              onChangeText={setToken}
              keyboardType="number-pad"
              maxLength={6}
            />

            <Text style={globalStyles.label}>{t('desiredPassword')}</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textSecondary}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity 
              style={[globalStyles.button, { marginTop: 24 }]} 
              onPress={handleReset}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={globalStyles.buttonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
});
