import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

interface CustomHeaderProps {
  navigation: any;
  route: any;
  options: any;
  back?: any;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ navigation, route, options, back }) => {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();

  const slideAnim = useRef(new Animated.Value(language === 'en' ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: language === 'en' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();
  }, [language]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 48],
  });

  const activeTabRoute = getFocusedRouteNameFromRoute(route);

  // Map route names to centered page titles
  const getHeaderTitle = () => {
    const activeRouteName = activeTabRoute || route.name;
    switch (activeRouteName) {
      case 'FileComplaint':
      case 'GenerateTicket':
        return t('raiseTicketTitle');
      case 'Home':
      case 'HomeScreen':
        return t('panchayatServices');
      case 'MyTickets':
        return t('myComplaintsTitle');
      case 'AssignedTickets':
        return t('assignedWardsTitle');
      case 'Tickets':
        return t('manageTicketsTitle');
      case 'Employees':
        return t('manageEmployeesTitle');
      case 'NotificationsTab':
      case 'Notifications':
        return t('notificationsTitle');
      case 'Profile':
      case 'CitizenDashboard':
        return t('myProfileTitle');
      case 'TicketDetail':
        return t('complaintTracking');
      case 'TicketAction':
        return t('updateProgressTitle');
      default:
        return options.title || activeRouteName;
    }
  };

  const getHeaderIcon = (): any => {
    const routeToShow = activeTabRoute || route.name;
    switch (routeToShow) {
      case 'Home':
        return 'home';
      case 'MyTickets':
      case 'AssignedTickets':
      case 'Tickets':
        return 'clipboard';
      case 'Employees':
        return 'people';
      case 'Notifications':
      case 'NotificationsTab':
        return 'notifications';
      case 'Profile':
      case 'CitizenDashboard':
      case 'AdminDashboard':
      case 'EmployeeDashboard':
        return 'person';
      default:
        return 'cube';
    }
  };

  const title = getHeaderTitle();
  const leftIcon = getHeaderIcon();

  const AlertConfirmLogout = () => {
    logout();
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      {/* LEFT SIDE: Back Button OR Page Icon */}
      <View style={styles.leftContainer}>
        {back ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoContainer}>
            <Ionicons name={leftIcon} size={20} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* CENTER SIDE: Perfectly Centered Title */}
      <View style={styles.centerContainer}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* RIGHT SIDE: Language Switcher and Logout */}
      <View style={styles.rightContainer}>
        <View style={styles.langPillContainer}>
          <Animated.View style={[styles.activePillSlider, { transform: [{ translateX }] }]} />
          <TouchableOpacity
            onPress={() => changeLanguage('en')}
            style={styles.langSegment}
            activeOpacity={0.8}
          >
            <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => changeLanguage('te')}
            style={styles.langSegment}
            activeOpacity={0.8}
          >
            <Text style={[styles.langTextTe, language === 'te' && styles.langTextActiveTe]}>తెలుగు</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={AlertConfirmLogout}
          style={styles.logoutButton}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFD6D6" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#1E40AF',   // Rich blue (Blue-800)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#1E3A8A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  leftContainer: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  logoContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  rightContainer: {
    width: 145,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
    gap: 8,
  },
  logoutButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  langPillContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 16,
    padding: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    width: 98,
    height: 30,
  },
  langSegment: {
    width: 46,
    height: 24,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  activePillSlider: {
    position: 'absolute',
    width: 46,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
    top: 2,
  },
  langText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  langTextTe: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  langTextActive: {
    color: '#820263', // Matches primary brand plum color!
  },
  langTextActiveTe: {
    color: '#820263',
    fontSize: 9,
    fontWeight: '900',
  },
});
