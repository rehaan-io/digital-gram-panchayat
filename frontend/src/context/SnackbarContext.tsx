import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, Animated, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type SnackbarType = 'success' | 'error' | 'warning' | 'info';

interface SnackbarContextProps {
  showSnackbar: (message: string, type?: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextProps | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<SnackbarType>('info');
  const [visible, setVisible] = useState(false);
  let insets: any;
  try {
    insets = useSafeAreaInsets();
  } catch (e) {
    insets = { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<any | null>(null);

  const hideSnackbar = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  }, [slideAnim, opacityAnim]);

  const showSnackbar = useCallback((msg: string, snackType: SnackbarType = 'info') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setMessage(msg);
    setType(snackType);
    setVisible(true);

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    timeoutRef.current = setTimeout(() => {
      hideSnackbar();
    }, 3800);
  }, [slideAnim, opacityAnim, hideSnackbar]);

  const getSnackbarStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'rgba(5, 150, 105, 0.95)',
          icon: 'checkmark-circle-outline',
        };
      case 'error':
        return {
          bg: 'rgba(220, 32, 32, 0.95)',
          icon: 'alert-circle-outline',
        };
      case 'warning':
        return {
          bg: 'rgba(217, 119, 6, 0.95)',
          icon: 'warning-outline',
        };
      case 'info':
      default:
        return {
          bg: 'rgba(2, 132, 199, 0.95)',
          icon: 'information-circle-outline',
        };
    }
  };

  const config = getSnackbarStyles();
  const topOffset = insets ? (Platform.OS === 'ios' ? insets.top : insets.top + 10) : 40;

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.snackbarContainer,
            {
              top: topOffset,
              opacity: opacityAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.snackbarCard, { backgroundColor: config.bg }]}>
            <Ionicons name={config.icon as any} size={22} color="#FFFFFF" style={styles.icon} />
            <Text style={styles.messageText}>{message}</Text>
            <TouchableOpacity onPress={hideSnackbar} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SnackbarContext.Provider>
  );
};

const styles = StyleSheet.create({
  snackbarContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 99999,
  },
  snackbarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#2E294E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  icon: {
    marginRight: 10,
  },
  messageText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'System',
    lineHeight: 18,
  },
  closeBtn: {
    marginLeft: 10,
    padding: 2,
  },
});
