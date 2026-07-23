import { StyleSheet } from 'react-native';

export const COLORS = {
  background: '#EADEDA',       // Dust Grey backdrop (matches login page)
  primary: '#820263',          // Royal Plum (Primary brand color)
  primaryLight: '#FDF2FA',     // Clear soft tint for active elements
  primaryDark: '#2E294E',      // Space Indigo (Deep contrast contrast color)
  surface: '#FFFFFF',          // Pure White (Cards/Surfaces)
  text: '#0F172A',             // Dark Slate (Sophisticated text)
  textSecondary: '#64748B',    // Muted Slate (Secondary labels)
  border: '#E2E8F0',           // Modern light slate border
  accent: '#F59E0B',           // Vibrant Gold/Amber (CTA highlights)
  success: '#10B981',          // Modern Emerald green
  successLight: '#ECFDF5',     // Soft emerald tint
  error: '#EF4444',            // Modern Rose red
  errorLight: '#FEF2F2',       // Soft rose error tint
  warning: '#F59E0B',          // Warning amber
  warningLight: '#FEF3C7',     // Soft warning tint
  shadow: '#0F172A',           // Shadow base (slate-900)
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,          // Softer, modern roundness
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,       // Soft, high-end shadows
    shadowRadius: 16,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',         // Bold headline weight
    color: COLORS.text,
    fontFamily: FONTS.bold,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,          // Modern rounded button
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,        // Soft primary glow
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,          // Prominent clean inputs
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    marginVertical: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,        // Modern spacing
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
