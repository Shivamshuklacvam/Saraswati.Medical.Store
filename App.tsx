import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { COLORS } from './constants/theme';

// Auth Screens
import WelcomeScreen from './screens/WelcomeScreen';
import SignInScreen from './screens/SignInScreen';
import RegisterScreen from './screens/RegisterScreen';
import AdminSignInScreen from './screens/AdminSignInScreen';

// Customer Screens
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import CartScreen from './screens/CartScreen';
import OrderTrackingScreen from './screens/OrderTrackingScreen';
import ProfileScreen from './screens/ProfileScreen';
import PrescriptionUploadScreen from './screens/PrescriptionUploadScreen';
import MyOrdersScreen from './screens/MyOrdersScreen';
import ManageAddressScreen from './screens/ManageAddressScreen';
import MySubscriptionsScreen from './screens/MySubscriptionsScreen';
import SavedPrescriptionsScreen from './screens/SavedPrescriptionsScreen';
import PaymentSettingsScreen from './screens/PaymentSettingsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';

// Admin Screens
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import AdminInventoryScreen from './screens/admin/AdminInventoryScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, userProfile, loading } = useAuth();

  // While auth state is initializing or profile is fetching for a logged-in user
  if (loading || (user && !userProfile)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Not logged in → show auth screens + allow browsing
  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="AdminSignIn" component={AdminSignInScreen} />
        {/* Allow guest browsing */}
        <Stack.Screen name="Search" component={SearchScreen as any} />
        <Stack.Screen name="PrescriptionUpload" component={PrescriptionUploadScreen} />
      </Stack.Navigator>
    );
  }

  // Admin user → show admin screens + shared screens
  if (userProfile?.role === 'admin') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="AdminInventory" component={AdminInventoryScreen} />
        <Stack.Screen name="Search" component={SearchScreen as any} />
        <Stack.Screen name="PrescriptionUpload" component={PrescriptionUploadScreen} />
      </Stack.Navigator>
    );
  }

  // Customer user → show full customer app
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Search" component={SearchScreen as any} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen as any} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen as any} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="PrescriptionUpload" component={PrescriptionUploadScreen} />

      {/* Profile Sub-screens */}
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="ManageAddress" component={ManageAddressScreen} />
      <Stack.Screen name="MySubscriptions" component={MySubscriptionsScreen} />
      <Stack.Screen name="SavedPrescriptions" component={SavedPrescriptionsScreen} />
      <Stack.Screen name="PaymentSettings" component={PaymentSettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
