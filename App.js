import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { AuthProvider } from './src/services/auth/AuthContext';
import HomeScreen from './src/screens/main/HomeScreen';
import CategoriesScreen from './src/screens/main/CategoriesScreen';
import ProductsScreen from './src/screens/main/ProductsScreen';
import ProductDetailScreen from './src/screens/main/ProductDetailScreen';
import CartScreen from './src/screens/main/CartScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import LoginScreen from './src/screens/auth/LoginScreen';

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

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
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
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
