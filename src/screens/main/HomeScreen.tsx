import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { useAuth } from '../../services/auth/AuthContext';
import { supabase } from '../../services/api/supabase';
import { findNearestStore, formatDistance, formatDeliveryDuration, calculateDeliveryFee, Location as LocationType } from '../../utils/locationUtils';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = any;

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  weight: number;
  unit: string;
  image_url: string;
  category_id: string;
}

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [deliveryInfo, setDeliveryInfo] = useState<{
    distance: string;
    duration: string;
    fee: number;
    storeName: string;
  } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationType | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { user, signOut, isAuthenticated } = useAuth();

  const navigateToProducts = () => {
    navigation.navigate('Products');
  };

  const navigateToCategories = () => {
    navigation.navigate('Categories');
  };

  const handleCategoryPress = () => {
    console.log('Categories pressed');
  };

  const handleProductPress = () => {
    console.log('Product pressed');
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationError('Error requesting location permission');
      return false;
    }
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData: LocationType = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(locationData);
      return locationData;
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Unable to get your location');
    } finally {
      setLocationLoading(false);
    }
  };

  const calculateDeliveryInfo = async (latitude: number, longitude: number) => {
    try {
      // Load stores to calculate nearest store
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true);

      if (!storesError && storesData) {
        const nearestStoreInfo = findNearestStore(
          { latitude, longitude },
          storesData.map(store => ({
            name: store.name,
            address: store.address,
            latitude: store.latitude,
            longitude: store.longitude,
          }))
        );

        if (nearestStoreInfo) {
          setDeliveryInfo({
            distance: formatDistance(nearestStoreInfo.distance),
            duration: formatDeliveryDuration(nearestStoreInfo.duration),
            fee: calculateDeliveryFee(nearestStoreInfo.distance),
            storeName: nearestStoreInfo.store.name,
          });
        }
      }
    } catch (error) {
      console.error('Error calculating delivery info:', error);
    }
  };

  useEffect(() => {
    loadData();
    // Try to get user location on component mount
    getCurrentLocation();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
      } else {
        setCategories(categoriesData || []);
      }

      // Load featured products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (productsError) {
        console.error('Error loading products:', productsError);
      } else {
        setFeaturedProducts(productsData || []);
      }

      // Load user addresses and calculate delivery info
      if (isAuthenticated && user) {
        const { data: addressesData, error: addressesError } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();

        if (!addressesError && addressesData) {
          setUserAddresses([addressesData]);
          await calculateDeliveryInfo(addressesData.latitude, addressesData.longitude);
        } else {
          // No saved address, use current location if available
          if (currentLocation) {
            await calculateDeliveryInfo(currentLocation.latitude, currentLocation.longitude);
            setUserAddresses([]);
          } else {
            setUserAddresses([]);
            setDeliveryInfo(null);
          }
        }
      } else {
        // For non-authenticated users, use current location if available
        if (currentLocation) {
          await calculateDeliveryInfo(currentLocation.latitude, currentLocation.longitude);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('Categories')}
    >
      <Image source={{ uri: item.image_url }} style={styles.categoryImage} />
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <Image source={{ uri: item.image_url }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>₹{item.price}/{item.weight}{item.unit}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {isAuthenticated ? (user?.full_name || 'User') : 'Guest'}
            </Text>
            <Text style={styles.subGreeting}>What fresh vegetables do you need today?</Text>
          </View>
          {isAuthenticated && (
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.profileButtonText}>Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Prominent Delivery Time Display */}
        {deliveryInfo && (
          <View style={styles.deliveryTimeHeader}>
            <View style={styles.deliveryTimeContainer}>
              <Text style={styles.deliveryTimeIcon}>🚚</Text>
              <View style={styles.deliveryTimeInfo}>
                <Text style={styles.deliveryTimeLabel}>Delivery in</Text>
                <Text style={styles.deliveryTimeValue}>{deliveryInfo.duration}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Text style={styles.locationButtonText}>📍 Update Location</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Location Error Display */}
        {locationError && (
          <View style={styles.locationErrorContainer}>
            <Text style={styles.locationErrorText}>{locationError}</Text>
            <TouchableOpacity
              style={styles.retryLocationButton}
              onPress={getCurrentLocation}
            >
              <Text style={styles.retryLocationText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Location Loading for non-authenticated users */}
        {!isAuthenticated && locationLoading && (
          <View style={styles.locationLoadingContainer}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.locationLoadingText}>Getting your location...</Text>
          </View>
        )}

        {/* Address and Delivery Info */}
        {isAuthenticated && deliveryInfo && (
          <View style={styles.deliveryInfo}>
            <View style={styles.addressContainer}>
              <Text style={styles.deliveryIcon}>📍</Text>
              <View>
                <Text style={styles.deliveryLabel}>Delivering to:</Text>
                <Text style={styles.addressText}>
                  {userAddresses[0]?.street_address}, {userAddresses[0]?.city}
                </Text>
              </View>
            </View>

            <View style={styles.deliveryDetails}>
              <View style={styles.deliveryItem}>
                <Text style={styles.deliveryIcon}>🏪</Text>
                <Text style={styles.deliveryText}>{deliveryInfo.storeName}</Text>
              </View>
              <View style={styles.deliveryItem}>
                <Text style={styles.deliveryIcon}>📏</Text>
                <Text style={styles.deliveryText}>{deliveryInfo.distance}</Text>
              </View>
              <View style={styles.deliveryItem}>
                <Text style={styles.deliveryIcon}>⏱️</Text>
                <Text style={styles.deliveryText}>{deliveryInfo.duration}</Text>
              </View>
              <View style={styles.deliveryItem}>
                <Text style={styles.deliveryIcon}>🚚</Text>
                <Text style={styles.deliveryText}>₹{deliveryInfo.fee}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Add Address Prompt for Authenticated Users without Address */}
        {isAuthenticated && !deliveryInfo && (
          <TouchableOpacity
            style={styles.addAddressPrompt}
            onPress={() => navigation.navigate('Address')}
          >
            <Text style={styles.addAddressIcon}>📍</Text>
            <View>
              <Text style={styles.addAddressTitle}>Add Delivery Address</Text>
              <Text style={styles.addAddressSubtitle}>Get faster delivery with your location</Text>
            </View>
            <Text style={styles.addAddressArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories.slice(0, 4)}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={featuredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
          />
        </View>

        {/* Special Offers Section */}
        <View style={styles.offersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.offersList}
          >
            <View style={styles.offerCard}>
              <Text style={styles.offerIcon}>🥬</Text>
              <View style={styles.offerInfo}>
                <Text style={styles.offerTitle}>Fresh Vegetables</Text>
                <Text style={styles.offerSubtitle}>Up to 30% OFF</Text>
              </View>
            </View>

            <View style={styles.offerCard}>
              <Text style={styles.offerIcon}>🍎</Text>
              <View style={styles.offerInfo}>
                <Text style={styles.offerTitle}>Organic Fruits</Text>
                <Text style={styles.offerSubtitle}>Free Delivery</Text>
              </View>
            </View>

            <View style={styles.offerCard}>
              <Text style={styles.offerIcon}>🥕</Text>
              <View style={styles.offerInfo}>
                <Text style={styles.offerTitle}>Seasonal Special</Text>
                <Text style={styles.offerSubtitle}>Buy 2 Get 1</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={navigateToProducts}
          >
            <Text style={styles.quickActionIcon}>🥬</Text>
            <Text style={styles.quickActionText}>All Products</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={navigateToCategories}
          >
            <Text style={styles.quickActionIcon}>📂</Text>
            <Text style={styles.quickActionText}>Categories</Text>
          </TouchableOpacity>

          {isAuthenticated ? (
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Cart')}
            >
              <Text style={styles.quickActionIcon}>🛒</Text>
              <Text style={styles.quickActionText}>Cart</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.quickActionIcon}>🔐</Text>
              <Text style={styles.quickActionText}>Login</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.quickActionIcon}>👤</Text>
            <Text style={styles.quickActionText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  profileButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profileButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryDescription: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchBar: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  categoriesList: {
    paddingVertical: 10,
  },
  categoryCard: {
    width: 80,
    alignItems: 'center',
    marginRight: 15,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  productsList: {
    paddingVertical: 10,
  },
  productCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
  },
  deliveryInfo: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  deliveryIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  deliveryLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  deliveryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  addAddressPrompt: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addAddressIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  addAddressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  addAddressSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  addAddressArrow: {
    fontSize: 24,
    color: '#4CAF50',
    marginLeft: 'auto',
  },
  deliveryTimeHeader: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 15,
  },
  deliveryTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  deliveryTimeIcon: {
    fontSize: 24,
    color: '#fff',
    marginRight: 10,
  },
  deliveryTimeInfo: {
    flex: 1,
  },
  deliveryTimeLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    textTransform: 'uppercase',
  },
  deliveryTimeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  locationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationErrorContainer: {
    backgroundColor: '#ffebee',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationErrorText: {
    color: '#c62828',
    fontSize: 14,
    flex: 1,
  },
  retryLocationButton: {
    backgroundColor: '#c62828',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  retryLocationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationLoadingContainer: {
    backgroundColor: '#e8f5e8',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationLoadingText: {
    color: '#2e7d32',
    fontSize: 14,
    marginLeft: 10,
  },
  offersSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  offersList: {
    paddingVertical: 10,
  },
  offerCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  offerInfo: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  offerSubtitle: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default HomeScreen;