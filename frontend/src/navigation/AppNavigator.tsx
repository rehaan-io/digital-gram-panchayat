import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, Text } from 'react-native';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Custom Header Component
import CustomHeader from '../components/CustomHeader';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import LoadingScreen from '../screens/auth/LoadingScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

// Common / Shared Screens
import HomeScreen from '../screens/HomeScreen';
import SectionDetailScreen from '../screens/SectionDetailScreen';
import TicketDetailScreen from '../screens/citizen/TicketDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Citizen Screens
import CitizenDashboard from '../screens/citizen/CitizenDashboard';
import GenerateTicketScreen from '../screens/citizen/GenerateTicketScreen';
import MyTicketsScreen from '../screens/citizen/MyTicketsScreen';
import PensionRecordsScreen from '../screens/citizen/PensionRecordsScreen';

// Employee Screens
import EmployeeDashboard from '../screens/employee/EmployeeDashboard';
import TicketActionScreen from '../screens/employee/TicketActionScreen';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import ManageEmployeesScreen from '../screens/admin/ManageEmployeesScreen';
import ManageTicketsScreen from '../screens/admin/ManageTicketsScreen';
import ManageOfficialsScreen from '../screens/admin/ManageOfficialsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- CUSTOM TAB ICON WITH NOTIFICATION BADGE ---
const TabBarIconWithBadge: React.FC<{
  name: any;
  color: string;
  size: number;
  showBadge: boolean;
}> = ({ name, color, size, showBadge }) => {
  const { unreadCount } = useNotifications();

  return (
    <View style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name={name} size={size} color={color} />
      {showBadge && unreadCount > 0 && (
        <View
          style={{
            position: 'absolute',
            right: -4,
            top: -2,
            backgroundColor: '#D90368', // Berry Lipstick (matching palette!)
            borderRadius: 7,
            minWidth: 14,
            height: 14,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 2,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 8, fontWeight: '900', textAlign: 'center' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </View>
  );
};

// --- CITIZEN TABS NAVIGATOR ---
const CitizenTabNavigator = () => {
  const { t, language } = useLanguage();
  let insets: any;
  try {
    insets = useSafeAreaInsets();
  } catch (e) {
    insets = { top: 0, bottom: 0, left: 0, right: 0 };
  }
  const bottomPadding = insets && insets.bottom > 0 ? insets.bottom : 8;
  const barHeight = 60 + (insets && insets.bottom > 0 ? insets.bottom - 4 : 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'FileComplaint') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'MyTickets') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === 'NotificationsTab') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return (
            <TabBarIconWithBadge
              name={iconName}
              color={color}
              size={22}
              showBadge={route.name === 'NotificationsTab'}
            />
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: barHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('homeTab') }} />
      <Tab.Screen name="FileComplaint" component={GenerateTicketScreen} options={{ title: language === 'te' ? 'కొత్త ఫిర్యాదు' : 'Raise Ticket' }} />
      <Tab.Screen name="MyTickets" component={MyTicketsScreen} options={{ title: language === 'te' ? 'నా ఫిర్యాదులు' : 'My Tickets' }} />
      <Tab.Screen name="NotificationsTab" component={NotificationsScreen} options={{ title: language === 'te' ? 'నోటిఫికేషన్లు' : 'Alerts' }} />
      <Tab.Screen name="Profile" component={CitizenDashboard} options={{ title: t('profileTab') }} />
    </Tab.Navigator>
  );
};

// --- EMPLOYEE TABS NAVIGATOR ---
const EmployeeTabNavigator = () => {
  const { t, language } = useLanguage();
  let insets: any;
  try {
    insets = useSafeAreaInsets();
  } catch (e) {
    insets = { top: 0, bottom: 0, left: 0, right: 0 };
  }
  const bottomPadding = insets && insets.bottom > 0 ? insets.bottom : 8;
  const barHeight = 60 + (insets && insets.bottom > 0 ? insets.bottom - 4 : 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AssignedTickets') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === 'NotificationsTab') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return (
            <TabBarIconWithBadge
              name={iconName}
              color={color}
              size={22}
              showBadge={route.name === 'NotificationsTab'}
            />
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: barHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('homeTab') }} />
      <Tab.Screen name="AssignedTickets" component={EmployeeDashboard} options={{ title: language === 'te' ? 'వార్డులు' : 'Assigned Wards' }} />
      <Tab.Screen name="NotificationsTab" component={NotificationsScreen} options={{ title: language === 'te' ? 'నోటిఫికేషన్లు' : 'Alerts' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('profileTab') }} />
    </Tab.Navigator>
  );
};

// --- ADMIN TABS NAVIGATOR ---
const AdminTabNavigator = () => {
  const { t, language } = useLanguage();
  let insets: any;
  try {
    // safe area check
    insets = useSafeAreaInsets();
  } catch (e) {
    insets = { top: 0, bottom: 0, left: 0, right: 0 };
  }
  const bottomPadding = insets && insets.bottom > 0 ? insets.bottom : 8;
  const barHeight = 60 + (insets && insets.bottom > 0 ? insets.bottom - 4 : 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Tickets') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === 'Employees') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: barHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} options={{ title: language === 'te' ? 'డ్యాష్‌బోర్డ్' : 'Dashboard' }} />
      <Tab.Screen name="Tickets" component={ManageTicketsScreen} options={{ title: language === 'te' ? 'ఫిర్యాదులు' : 'Tickets' }} />
      <Tab.Screen name="Employees" component={ManageEmployeesScreen} options={{ title: language === 'te' ? 'సిబ్బంది' : 'Employees' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('profileTab') }} />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { token, user, isLoading } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || showSplash) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          header: (props) => <CustomHeader {...props} />,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
      {token === null || user === null ? (
        // AUTHENTICATION FLOW (No CustomHeader display needed)
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Citizen Registration', header: undefined }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot Password', header: undefined }} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset Password', header: undefined }} />
        </>
      ) : (
        // LOGGED-IN PORTAL TABS
        <>
          {user?.role === 'CITIZEN' && (
            <Stack.Screen name="CitizenTabs" component={CitizenTabNavigator} />
          )}

          {user?.role === 'EMPLOYEE' && (
            <Stack.Screen name="EmployeeTabs" component={EmployeeTabNavigator} />
          )}

          {user?.role === 'ADMIN' && (
            <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
          )}

          {/* Sub-screens (Detail views and forms opened from tabs) */}
          <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Home Details' }} />
          <Stack.Screen name="SectionDetail" component={SectionDetailScreen} options={{ title: 'Panchayat Services' }} />
          <Stack.Screen name="PensionRecords" component={PensionRecordsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ title: 'Complaint Tracking' }} />
          <Stack.Screen name="GenerateTicket" component={GenerateTicketScreen} options={{ title: 'File a Complaint' }} />
          <Stack.Screen name="TicketAction" component={TicketActionScreen} options={{ title: 'Update Progress' }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
          <Stack.Screen name="ManageOfficials" component={ManageOfficialsScreen} options={{ title: 'Manage Officials' }} />
        </>
      )}
    </Stack.Navigator>
    </>
  );
};
