import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  const { isAuthenticated } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 2,
          borderTopColor: '#4CAF50',
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "view-grid" : "view-grid-outline"}
              size={size}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "shopping" : "shopping-outline"}
              size={size}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />
      {isAuthenticated ? (
        <Tab.Screen
          name="Cart"
          component={CartScreen}
          options={{
            tabBarLabel: 'Cart',
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "cart" : "cart-outline"}
                size={size}
                color={color}
              />
            ),
            headerShown: false,
          }}
        />
      ) : (
        <Tab.Screen
          name="AuthCart"
          component={AuthScreen}
          options={{
            tabBarLabel: 'Sign In',
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "login" : "login"}
                size={size}
                color={color}
              />
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
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "account" : "account-outline"}
                size={size}
                color={color}
              />
            ),
            headerShown: false,
          }}
        />
      ) : (
        <Tab.Screen
          name="AuthProfile"
          component={AuthScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "account" : "account-outline"}
                size={size}
                color={color}
              />
            ),
            headerShown: false,
          }}
        />
      )}
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
        <StatusBar style="dark" backgroundColor="transparent" />
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}
