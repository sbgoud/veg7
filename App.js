import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { AuthProvider, useAuth } from './src/services/auth/AuthContext';
import HomeScreen from './src/screens/main/HomeScreen';
import CategoriesScreen from './src/screens/main/CategoriesScreen';
import ProductsScreen from './src/screens/main/ProductsScreen';
import ProductDetailScreen from './src/screens/main/ProductDetailScreen';
import CartScreen from './src/screens/main/CartScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import AddressScreen from './src/screens/main/AddressScreen';
import OrdersScreen from './src/screens/main/OrdersScreen';
import OrderDetailScreen from './src/screens/main/OrderDetailScreen';
import CheckoutScreen from './src/screens/main/CheckoutScreen';
import AuthScreen from './src/screens/auth/LoginScreen';
import ProfileUpdateScreen from './src/screens/auth/ProfileUpdateScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
          headerTitle: 'veg7 - Fresh Vegetables',
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📂</Text>
          ),
          headerTitle: 'Categories',
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🥬</Text>
          ),
          headerTitle: 'All Products',
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🛒</Text>
          ),
          headerTitle: 'Shopping Cart',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📦</Text>
          ),
          headerTitle: 'My Orders',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
          headerTitle: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 18, color: '#4CAF50', fontWeight: 'bold' }}>Loading veg7...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main app with bottom tabs */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />

      {/* Product detail screen */}
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          title: 'Product Details',
        }}
      />

      {/* Authentication modal - shows when users need to login/signup */}
      <Stack.Screen
        name="AuthModal"
        component={AuthScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />

      {/* Protected screens - only accessible when authenticated */}
      {isAuthenticated && (
        <>
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: '#4CAF50' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
              title: 'Checkout',
            }}
          />
          <Stack.Screen
            name="Address"
            component={AddressScreen}
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: '#4CAF50' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
              title: 'My Addresses',
            }}
          />
          <Stack.Screen
            name="OrderDetail"
            component={OrderDetailScreen}
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: '#4CAF50' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
              title: 'Order Details',
            }}
          />
          <Stack.Screen
            name="ProfileUpdate"
            component={ProfileUpdateScreen}
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: '#4CAF50' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
              title: 'Complete Profile',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}
