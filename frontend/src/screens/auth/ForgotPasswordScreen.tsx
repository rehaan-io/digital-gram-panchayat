import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { COLORS, globalStyles } from '../../styles/theme';

const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { forgotPassword } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert(t('errorTitle'), t('fillAllFields'));
      return;
    }

    setIsSubmitting(true);
    const result = await forgotPassword(email.trim().toLowerCase());
    setIsSubmitting(false);

    if (result.success) {
      Alert.alert(
        'Code Sent',
        'Verification code has been sent. Please check your console/email.',
        [
          {
            text: 'Reset Password Now',
            onPress: () => navigation.navigate('ResetPassword', { email: email.trim().toLowerCase() }),
          },
        ]
      );
    } else {
      Alert.alert(t('errorTitle'), result.message || 'Failed to send reset code.');
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
            <Text style={styles.headerText}>{t('recoverPassword')}</Text>
            <Text style={styles.subText}>
              Enter your registered email address below. We will send you a 6-digit verification code to reset your password.
            </Text>

            <Text style={globalStyles.label}>{t('emailAddress')}</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="name@domain.com"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity 
              style={[globalStyles.button, { marginTop: 20 }]} 
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={globalStyles.buttonText}>Send Code</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;

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
