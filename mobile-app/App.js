import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View, Alert, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WifiOff, Bell } from 'lucide-react-native';

// ...

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import MetricsScreen from './screens/MetricsScreen';
import LocationScreen from './screens/LocationScreen';
import HardwareScreen from './screens/HardwareScreen';
import ProfileScreen from './screens/ProfileScreen';
import PetDetailScreen from './screens/PetDetailScreen';
import AddPetScreen from './screens/AddPetScreen';
import EditPetScreen from './screens/EditPetScreen';
import DevicePairingScreen from './screens/DevicePairingScreen';
import AlertsScreen from './screens/AlertsScreen'; // Import added for direct nav if needed

import { LayoutDashboard, Activity, MapPin, Cpu, User } from 'lucide-react-native';
import { COLORS } from './theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#050505', // Deep Black for contrast
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.1)',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 0,
        },
        tabBarActiveTintColor: '#4F46E5', // Indigo
        tabBarInactiveTintColor: '#64748B', // Slate-400
        tabBarLabelStyle: { fontSize: 9, fontWeight: '700', marginTop: 0 }
      }}
    >
      <Tab.Screen
        name="Command"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Metrics"
        component={MetricsScreen}
        options={{
          tabBarIcon: ({ color }) => <Activity size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Sat-Nav"
        component={LocationScreen}
        options={{
          tabBarIcon: ({ color }) => <MapPin size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Hardware"
        component={HardwareScreen}
        options={{
          tabBarIcon: ({ color }) => <Cpu size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Registry"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

import { registerForPushNotificationsAsync, addNotificationListeners } from './services/notifications';

// ...

import * as NavigationBar from 'expo-navigation-bar';

// ...

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // SYSTEM POLISH: Force Dark Navigation Bar on Android
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#050505'); // Deep Black to match Tab Bar
      NavigationBar.setButtonStyleAsync('light'); // White buttons on dark bg
    }

    checkAuth();

    // Initialize Notifications (Item #41)
    registerForPushNotificationsAsync().then(token => {
      // In real app, send token to backend here
      // console.log("Push Token:", token); 
    });

    const { receivedSubscription, responseSubscription } = addNotificationListeners(
      (notification) => {
        // Handle foreground notification
        // console.log("Received:", notification);
      },
      (response) => {
        // Handle tap on notification
        // console.log("Response:", response);
      }
    );

    notificationListener.current = receivedSubscription;
    responseListener.current = responseSubscription;

    // Mock Network Monitoring
    const netInterval = setInterval(() => {
      // Randomly simulate connection drops for demo (rarely)
      // setIsOffline(Math.random() > 0.95); 
    }, 10000);

    return () => {
      clearInterval(netInterval);
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    }
  }, []);

  // Offline Banner Component
  const OfflineBanner = () => (
    <View style={{ position: 'absolute', top: 50, left: 20, right: 20, backgroundColor: COLORS.danger, padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, zIndex: 9999, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10 }}>
      <WifiOff size={16} color="#FFF" />
      <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>CONNECTION LOST - OFFLINE MODE</Text>
    </View>
  );

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setUserToken(token);
    } catch (e) {
      console.error('Failed to check auth:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (token, user, refreshToken) => {
    await AsyncStorage.setItem('token', token);
    if (refreshToken) await AsyncStorage.setItem('refresh_token', refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setUserToken(token);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'refresh_token', 'user']);
    setUserToken(null);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#FFF', fontSize: 24 }}>System Booting...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {/* {isOffline && <OfflineBanner />}  -- Uncomment to test offline mode */}
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {userToken ? (
            <>
              <Stack.Screen name="Main">
                {() => <MainTabs />}
              </Stack.Screen>
              <Stack.Screen
                name="PetDetail"
                component={PetDetailScreen}
                options={{ headerShown: true, title: 'Pet Health' }}
              />
              <Stack.Screen
                name="AddPet"
                component={AddPetScreen}
                options={{ headerShown: true, title: 'Add Pet' }}
              />
              <Stack.Screen
                name="EditPet"
                component={EditPetScreen}
                options={{ headerShown: true, title: 'Edit Pet' }}
              />
              <Stack.Screen
                name="DevicePairing"
                component={DevicePairingScreen}
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="EmergencyContacts"
                component={require('./screens/EmergencyContactsScreen').default}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Logout"
                options={{ headerShown: false }}
              >
                {({ navigation }) => {
                  handleLogout();
                  return null;
                }}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
              </Stack.Screen>
              <Stack.Screen name="Register">
                {(props) => <RegisterScreen {...props} onLogin={handleLogin} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
