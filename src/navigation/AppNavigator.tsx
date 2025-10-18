import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../services/auth/AuthContext';

// Auth screens
import AuthScreen from '../screens/auth/LoginScreen';

// Main app screens
import HomeScreen from '../screens/main/HomeScreen';
import CategoriesScreen from '../screens/main/CategoriesScreen';
import ProductsScreen from '../screens/main/ProductsScreen';
import ProductDetailScreen from '../screens/main/ProductDetailScreen';
import CartScreen from '../screens/main/CartScreen';
import CheckoutScreen from '../screens/main/CheckoutScreen';
import OrdersScreen from '../screens/main/OrdersScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Categories: undefined;
  Products: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  Orders: undefined;
  Profile: undefined;
  AuthModal: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Auth Navigator for handling Login and Signup screens
const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={AuthScreen} />
    </Stack.Navigator>
  );
};

// Auth Stack Navigator for modal authentication
const AuthStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={AuthScreen} />
    </Stack.Navigator>
  );
};

// Temporarily removed bottom tab navigator as requested

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      {/* Main app - just show HomeScreen directly for now */}
      <Stack.Screen name="Home" component={HomeScreen} />

      {/* Other screens accessible from HomeScreen */}
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />

      {/* Authentication modal */}
      {!isAuthenticated && (
        <Stack.Screen
          name="AuthModal"
          component={AuthStackNavigator}
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      )}

      {/* Protected screens - only accessible when authenticated */}
      {isAuthenticated && (
        <>
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="Orders" component={OrdersScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;