import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../services/auth/AuthContext';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

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
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Products: undefined;
  Cart: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

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
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
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
      {isAuthenticated ? (
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
      ) : (
        <Tab.Screen
          name="Cart"
          component={LoginScreen}
          options={{
            tabBarLabel: 'Cart',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>🛒</Text>
            ),
            headerShown: false,
          }}
        />
      )}
      {isAuthenticated ? (
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
      ) : (
        <Tab.Screen
          name="Profile"
          component={LoginScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>👤</Text>
            ),
            headerShown: false,
          }}
        />
      )}
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main app with bottom tabs */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />

      {/* Modal screens for product details and auth */}
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

      {/* Authentication screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />

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
            name="Orders"
            component={OrdersScreen}
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: '#4CAF50' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
              title: 'My Orders',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;