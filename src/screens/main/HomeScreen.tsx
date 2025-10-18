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
  StatusBar,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { useAuth } from '../../services/auth/AuthContext';
import { supabase } from '../../services/api/supabase';
import AddressSelectionModal from '../../components/AddressSelectionModal';
import { getRandomVegetableImage } from '../../utils/imageUtils';
// Inline location calculation functions to avoid import issues
interface Location {
  latitude: number;
  longitude: number;
}

function calculateDistance(point1: Location, point2: Location): number {
  const R = 6371; // Earth's radius in kilometers

  const lat1Rad = (point1.latitude * Math.PI) / 180;
  const lat2Rad = (point2.latitude * Math.PI) / 180;
  const deltaLatRad = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const deltaLngRad = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLngRad / 2) *
      Math.sin(deltaLngRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function calculateDeliveryDuration(distance: number): number {
  // Base time: 15 minutes for order preparation
  const baseTime = 15;

  // Additional time based on distance (assuming 10 minutes per km for delivery)
  const travelTime = distance * 10;

  return Math.round(baseTime + travelTime);
}

function formatDeliveryDuration(minutes: number): string {
  // Show only the base time (minimum possible)
  return `${minutes} mins`;
}

function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance.toFixed(1)} km`;
  }
}

function calculateDeliveryFee(distance: number): number {
  // Base fee: ₹20
  // Additional ₹10 per km after first km
  if (distance <= 1) {
    return 20;
  } else {
    return 20 + Math.ceil((distance - 1) * 10);
  }
}

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
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userDefaultAddress, setUserDefaultAddress] = useState<any | null>(null);
  const [closestAddress, setClosestAddress] = useState<any | null>(null);
  const [currentDeliveryAddress, setCurrentDeliveryAddress] = useState<any | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const { user, signOut, isAuthenticated } = useAuth();

  // Warehouse location coordinates
  const WAREHOUSE_LOCATION = {
    latitude: 17.35878,
    longitude: 78.5534077
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

  // Find closest address to current location
  const findClosestAddress = (currentLoc: Location, addresses: any[]) => {
    if (!addresses.length) return null;

    let closest = addresses[0];
    let shortestDistance = calculateDistance(currentLoc, {
      latitude: addresses[0].latitude,
      longitude: addresses[0].longitude
    });

    for (let i = 1; i < addresses.length; i++) {
      const distance = calculateDistance(currentLoc, {
        latitude: addresses[i].latitude,
        longitude: addresses[i].longitude
      });

      if (distance < shortestDistance) {
        shortestDistance = distance;
        closest = addresses[i];
      }
    }

    return closest;
  };

  // Load user's addresses and find closest to current location
  const loadUserDeliveryInfo = async () => {
    if (!isAuthenticated || !user) return;

    try {
      // Get all user's addresses
      const { data: addresses, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading user addresses:', error);
        return;
      }

      if (addresses && addresses.length > 0) {
        setUserAddresses(addresses);

        // Find closest address to current location
        if (currentLocation) {
          const closest = findClosestAddress(currentLocation, addresses);
          if (closest) {
            setClosestAddress(closest);
            setCurrentDeliveryAddress(closest);

            // Calculate distance and time from warehouse to closest address
            const distance = calculateDistance(WAREHOUSE_LOCATION, {
              latitude: closest.latitude,
              longitude: closest.longitude
            });

            const duration = calculateDeliveryDuration(distance);
            const fee = calculateDeliveryFee(distance);

            setDeliveryInfo({
              distance: formatDistance(distance),
              duration: formatDeliveryDuration(duration),
              fee: fee,
              storeName: 'veg7 Warehouse'
            });
          }
        } else {
          // If no current location, use default address
          const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];
          setUserDefaultAddress(defaultAddress);
          setCurrentDeliveryAddress(defaultAddress);

          if (defaultAddress) {
            const distance = calculateDistance(WAREHOUSE_LOCATION, {
              latitude: defaultAddress.latitude,
              longitude: defaultAddress.longitude
            });

            const duration = calculateDeliveryDuration(distance);
            const fee = calculateDeliveryFee(distance);

            setDeliveryInfo({
              distance: formatDistance(distance),
              duration: formatDeliveryDuration(duration),
              fee: fee,
              storeName: 'veg7 Warehouse'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading delivery info:', error);
    }
  };

  const handleAddressSelect = (address: any) => {
    setCurrentDeliveryAddress(address);
    // Recalculate delivery info for the selected address
    const distance = calculateDistance(WAREHOUSE_LOCATION, {
      latitude: address.latitude,
      longitude: address.longitude
    });

    const duration = calculateDeliveryDuration(distance);
    const fee = calculateDeliveryFee(distance);

    setDeliveryInfo({
      distance: formatDistance(distance),
      duration: formatDeliveryDuration(duration),
      fee: fee,
      storeName: 'veg7 Warehouse'
    });
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

      const locationData: Location = {
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
      // Calculate distance from warehouse
      const distance = calculateDistance(WAREHOUSE_LOCATION, {
        latitude,
        longitude
      });

      const duration = calculateDeliveryDuration(distance);
      const fee = calculateDeliveryFee(distance);

      setDeliveryInfo({
        distance: formatDistance(distance),
        duration: formatDeliveryDuration(duration),
        fee: fee,
        storeName: 'veg7 Warehouse'
      });
    } catch (error) {
      console.error('Error calculating delivery info:', error);
    }
  };

  useEffect(() => {
    loadData();
    // Try to get user location on component mount
    getCurrentLocation();
  }, []);

  useEffect(() => {
    // Load delivery info when user authentication state or current location changes
    if (isAuthenticated && user) {
      loadUserDeliveryInfo();
    }
  }, [isAuthenticated, user, currentLocation]);

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
      onPress={() => navigation.navigate('Products', { categoryId: item.id })}
    >
      <Image
        source={getRandomVegetableImage()}
        style={styles.categoryImage}
        resizeMode="cover"
      />
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <Image
        source={getRandomVegetableImage()}
        style={styles.productImage}
        resizeMode="cover"
      />
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
    <>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent={true}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingTop: 0 }}
        >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Image
                source={require('../../../assets/veg7.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.titleContainer}>
                <Text style={styles.title}>veg7</Text>
                <Text style={styles.subtitle}>Fresh Vegetables</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerBottom}>
            <Text style={styles.greeting}>
              Hello, {isAuthenticated ? (user?.full_name || 'User') : 'Guest'}
            </Text>
            <Text style={styles.subGreeting}>What fresh vegetables do you need today?</Text>

            {/* Delivery Information - Side by Side Display */}
            {isAuthenticated && deliveryInfo && (
              <TouchableOpacity
                style={styles.deliveryInfoContainer}
                onPress={() => setShowAddressModal(true)}
              >
                <View style={styles.deliveryRow}>
                  <View style={styles.deliveryItem}>
                    <Text style={styles.deliveryIcon}>📍</Text>
                    <View style={styles.deliveryInfo}>
                      <Text style={styles.deliveryLabel}>Delivering to:</Text>
                      <Text style={styles.deliveryAddress}>
                        {currentDeliveryAddress?.street_address}, {currentDeliveryAddress?.city}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.deliveryItem}>
                    <Text style={styles.deliveryIcon}>🚚</Text>
                    <View style={styles.deliveryInfo}>
                      <Text style={styles.deliveryLabel}>Delivery in:</Text>
                      <Text style={styles.deliveryTime}>{deliveryInfo.duration}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.changeAddressText}>Tap to change address</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>


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
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
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

        </ScrollView>

        {/* Address Selection Modal */}
        <AddressSelectionModal
          visible={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          onAddressSelect={handleAddressSelect}
          currentAddress={currentDeliveryAddress}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'ios' ? 50 : 44, // Add padding for status bar
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
    marginBottom: 10,
  },
  headerTop: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerBottom: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 110,
    height: 65,
    marginRight: 15,
    backgroundColor: 'transparent',
  },
  titleContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2E7D32',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#558B2F',
    fontWeight: '600',
    letterSpacing: 0.5,
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
    marginTop: 5,
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
  deliveryInfoContainerOld: {
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
  // Address and delivery info styles
  addressContainer: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ffcc02',
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 11,
    color: '#e65100',
    fontWeight: '500',
  },
  deliveryInfoContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  deliveryIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
    marginRight: 8,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryLabel: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 2,
  },
  deliveryAddress: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '400',
    lineHeight: 16,
  },
  deliveryTime: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '700',
  },
  changeAddressText: {
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  placeholderImage: {
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
});

export default HomeScreen;