import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../services/auth/AuthContext';
import { supabase } from '../../services/api/supabase';
import { findNearestStore, formatDeliveryDuration, calculateDeliveryFee } from '../../utils/locationUtils';

type AddressScreenNavigationProp = any;

interface Address {
  id: string;
  type: string;
  street_address: string;
  landmark?: string; // Updated to match database schema
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

interface Props {
  navigation: AddressScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.35;

const AddressScreen: React.FC<Props> = ({ navigation }) => {
  // UI state
  const [activeView, setActiveView] = useState<'list' | 'add'>('list');

  // Location and Map state
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<{
    duration: string;
    distance: string;
    fee: number;
  } | null>(null);

  // Addresses list state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  // Form state
  const [type, setType] = useState('home');
  const [houseNumber, setHouseNumber] = useState('');
  const [apartmentRoad, setApartmentRoad] = useState('');
  const [directions, setDirections] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [pincode, setPincode] = useState('500001');
  const [latitude, setLatitude] = useState<number>(17.3850);
  const [longitude, setLongitude] = useState<number>(78.4867);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const mapRef = useRef<MapView>(null);

  // Load user's addresses
  const loadAddresses = async () => {
    if (!isAuthenticated || !user) return;

    setAddressesLoading(true);
    try {
      const { data: addressesData, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading addresses:', error);
      } else {
        setAddresses(addressesData || []);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setAddressesLoading(false);
    }
  };

  // Request location permissions and get current location
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

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setCurrentLocation(coords);
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      // Calculate delivery info for current location
      await calculateDeliveryInfo(location.coords.latitude, location.coords.longitude);

      // Animate map to new location
      if (mapRef.current) {
        mapRef.current.animateToRegion(coords, 1000);
      }

    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Unable to get your location');
      Alert.alert('Error', 'Unable to get your location. Please check your permissions.');
    } finally {
      setLocationLoading(false);
    }
  };

  const calculateDeliveryInfo = async (lat: number, lng: number) => {
    try {
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true);

      if (!storesError && storesData && storesData.length > 0) {
        const nearestStoreInfo = findNearestStore(
          { latitude: lat, longitude: lng },
          storesData.map(store => ({
            name: store.name,
            address: store.address,
            latitude: store.latitude,
            longitude: store.longitude,
          }))
        );

        if (nearestStoreInfo) {
          setDeliveryInfo({
            duration: formatDeliveryDuration(nearestStoreInfo.duration),
            distance: `${nearestStoreInfo.distance.toFixed(1)} km`,
            fee: calculateDeliveryFee(nearestStoreInfo.distance),
          });
        }
      }
    } catch (error) {
      console.error('Error calculating delivery info:', error);
    }
  };

  useEffect(() => {
    const initializeScreen = async () => {
      console.log('=== ADDRESS SCREEN INITIALIZE ===');
      console.log('Current user:', user);
      console.log('isAuthenticated:', isAuthenticated);

      // Load user's addresses
      await loadAddresses();

      // Initialize with Hyderabad location
      setCurrentLocation({
        latitude: 17.3850,
        longitude: 78.4867,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Get user's current location
      await getCurrentLocation();
    };

    initializeScreen();
  }, [user, isAuthenticated]);

  const saveAddress = async () => {
    console.log('=== SAVE ADDRESS DEBUG ===');
    console.log('User object:', user);
    console.log('isAuthenticated:', isAuthenticated);

    if (!user) {
      Alert.alert('Error', 'Please login to save addresses');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert('Error', 'Authentication required. Please login again.');
      return;
    }

    // Validation
    if (!houseNumber.trim()) {
      Alert.alert('Error', 'Please enter house/flat/block number');
      return;
    }
    if (!apartmentRoad.trim()) {
      Alert.alert('Error', 'Please enter apartment/road/area');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Error', 'Please enter city');
      return;
    }
    if (!state.trim()) {
      Alert.alert('Error', 'Please enter state');
      return;
    }
    if (!pincode.trim() || pincode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return;
    }
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }

    console.log('Attempting to save address for user ID:', user.id);

    setIsSubmitting(true);
    try {
      // First, ensure the user profile exists in the users table
      console.log('Ensuring user profile exists...');

      // Check if user profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileCheckError && profileCheckError.code === 'PGRST116') {
        // Profile doesn't exist, try to create it
        console.log('User profile not found, creating it...');

        const { error: createProfileError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.full_name || 'User',
            phone: user.phone || '',
            role: 'user',
            is_active: true,
          });

        if (createProfileError) {
          console.error('Error creating user profile:', createProfileError);
          Alert.alert('Error', 'Failed to create user profile. Please try logging out and back in.');
          return;
        } else {
          console.log('User profile created successfully');
        }
      } else if (profileCheckError) {
        console.error('Error checking user profile:', profileCheckError);
        Alert.alert('Error', 'Failed to verify user profile. Please try again.');
        return;
      }

      console.log('User profile verified, attempting to save address...');

      // Now try to save the address
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          type: type === 'friends' ? 'other' : type,
          street_address: houseNumber.trim(),
          landmark: directions.trim() || null,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          is_default: true,
        })
        .select();

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });

        // Special handling for different types of errors
        if (error.code === '23503' && error.message.includes('addresses_user_id_fkey')) {
          Alert.alert('Error', 'User profile not found. Please log out and log back in to refresh your session.');
        } else if (error.code === '42501' && error.message.includes('row-level security policy')) {
          Alert.alert('Error', 'Permission denied. Please try logging out and back in.');
        } else {
          Alert.alert('Error', `Failed to save address: ${error.message}`);
        }
      } else {
        console.log('Address saved successfully');
        // Reload addresses and switch back to list view
        await loadAddresses();
        setActiveView('list');
        // Reset form
        resetForm();
      }
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    setLatitude(coordinate.latitude);
    setLongitude(coordinate.longitude);

    // Recalculate delivery info for new location
    calculateDeliveryInfo(coordinate.latitude, coordinate.longitude);
  };

  const resetForm = () => {
    setType('home');
    setHouseNumber('');
    setApartmentRoad('');
    setCity('');
    setState('');
    setPincode('');
    setLatitude(17.3850);
    setLongitude(78.4867);
  };

  const setDefaultAddress = async (addressId: string) => {
    if (!user) return;

    try {
      // First, set all addresses to non-default
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Then set the selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) {
        console.error('Error setting default address:', error);
        Alert.alert('Error', 'Failed to set default address');
      } else {
        // Refresh might be needed if addresses are displayed elsewhere
        console.log('Default address set successfully');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!user) return;

    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', addressId);

              if (error) {
                console.error('Error deleting address:', error);
                Alert.alert('Error', 'Failed to delete address');
              } else {
                console.log('Address deleted successfully');
                // Reload addresses to update the list
                await loadAddresses();
              }
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          }
        }
      ]
    );
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View>
          <Text style={styles.addressType}>{item.type.toUpperCase()}</Text>
          {item.is_default && (
            <Text style={styles.defaultBadge}>Default</Text>
          )}
        </View>
        <View style={styles.addressActions}>
          {!item.is_default && (
            <TouchableOpacity
              style={styles.setDefaultButton}
              onPress={() => setDefaultAddress(item.id)}
            >
              <Text style={styles.setDefaultText}>Set Default</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteAddress(item.id)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.addressText}>
        {item.street_address}
        {item.landmark && `, ${item.landmark}`}
      </Text>
      <Text style={styles.addressText}>
        {item.city}, {item.state} - {item.pincode}
      </Text>

      {item.latitude && item.longitude && (
        <Text style={styles.locationCoordinates}>
          📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
        </Text>
      )}
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <Text style={styles.unauthorizedTitle}>Login Required</Text>
          <Text style={styles.unauthorizedSubtitle}>Please login to manage addresses</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('AuthModal')}
          >
            <Text style={styles.loginButtonText}>Sign In / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show addresses list or add form based on activeView
  if (activeView === 'list') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backButton}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Manage Addresses</Text>
              <TouchableOpacity onPress={() => setActiveView('add')}>
                <Text style={styles.addButton}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Addresses List */}
            <View style={styles.addressesSection}>
              {addressesLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>Loading addresses...</Text>
                </View>
              ) : addresses.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📍</Text>
                  <Text style={styles.emptyTitle}>No Addresses Saved</Text>
                  <Text style={styles.emptySubtitle}>Add your first delivery address</Text>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => setActiveView('add')}
                  >
                    <Text style={styles.primaryButtonText}>Add Address</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>Your Addresses</Text>
                  {addresses.map((address) => (
                    <TouchableOpacity
                      key={address.id}
                      style={styles.addressCard}
                      onPress={() => {
                        // TODO: Implement address editing
                        console.log('Edit address:', address.id);
                      }}
                    >
                      <View style={styles.addressHeader}>
                        <View>
                          <Text style={styles.addressType}>{address.type.toUpperCase()}</Text>
                          {address.is_default && (
                            <Text style={styles.defaultBadge}>Default</Text>
                          )}
                        </View>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => deleteAddress(address.id)}
                        >
                          <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.addressText}>
                        {address.street_address}
                        {address.landmark && `, ${address.landmark}`}
                      </Text>
                      <Text style={styles.addressText}>
                        {address.city}, {address.state} - {address.pincode}
                      </Text>

                      {address.latitude && address.longitude && (
                        <Text style={styles.locationCoordinates}>
                          📍 {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={styles.addNewButton}
                    onPress={() => setActiveView('add')}
                  >
                    <Text style={styles.addNewIcon}>+</Text>
                    <Text style={styles.addNewText}>Add New Address</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Add new address view
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setActiveView('list')}>
              <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Address</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Map Section */}
          <View style={styles.mapSection}>
            {currentLocation && (
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                initialRegion={currentLocation}
                showsUserLocation={true}
                showsMyLocationButton={true}
                onPress={onMapPress}
              >
                {selectedLocation && (
                  <Marker
                    coordinate={selectedLocation}
                    title="Selected Location"
                    pinColor="#4CAF50"
                  />
                )}
              </MapView>
            )}

            {/* Location Button */}
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={getCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.currentLocationText}>Use Current Location</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Location Error Display */}
          {locationError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{locationError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={getCurrentLocation}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Address Display */}
          {selectedLocation && (
            <View style={styles.addressDisplaySection}>
              <View style={styles.selectedLocationCard}>
                <Text style={styles.selectedLocationIcon}>📍</Text>
                <View style={styles.selectedLocationInfo}>
                  <Text style={styles.selectedLocationTitle}>Selected Location</Text>
                  <Text style={styles.selectedLocationCoords}>
                    {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>

              {/* Delivery Info */}
              {deliveryInfo && (
                <View style={styles.deliveryInfoCard}>
                  <Text style={styles.deliveryInfoTitle}>Order will be delivered here</Text>
                  <View style={styles.deliveryDetails}>
                    <View style={styles.deliveryItem}>
                      <Text style={styles.deliveryIcon}>⏱️</Text>
                      <Text style={styles.deliveryText}>{deliveryInfo.duration}</Text>
                    </View>
                    <View style={styles.deliveryItem}>
                      <Text style={styles.deliveryIcon}>📏</Text>
                      <Text style={styles.deliveryText}>{deliveryInfo.distance}</Text>
                    </View>
                    <View style={styles.deliveryItem}>
                      <Text style={styles.deliveryIcon}>🚚</Text>
                      <Text style={styles.deliveryText}>₹{deliveryInfo.fee}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>
              A detailed address will help our Delivery Partner reach your doorstep easily
            </Text>

            {/* House/Flat/Block No. */}
            <TextInput
              style={styles.input}
              placeholder="HOUSE / FLAT / BLOCK NO."
              value={houseNumber}
              onChangeText={setHouseNumber}
              autoCapitalize="words"
            />

            {/* Apartment/Road/Area */}
            <TextInput
              style={styles.input}
              placeholder="APARTMENT / ROAD / AREA (RECOMMENDED)"
              value={apartmentRoad}
              onChangeText={setApartmentRoad}
              autoCapitalize="words"
            />

            {/* Directions to Reach */}
            <View style={styles.directionsContainer}>
              <TextInput
                style={[styles.input, styles.directionsInput]}
                placeholder="DIRECTIONS TO REACH (OPTIONAL)"
                value={directions}
                onChangeText={setDirections}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <TouchableOpacity style={styles.voiceButton}>
                <Text style={styles.voiceIcon}>🎤</Text>
                <Text style={styles.voiceText}>Tap to record voice directions</Text>
              </TouchableOpacity>
            </View>

            {/* Save As Section */}
            <View style={styles.saveAsSection}>
              <Text style={styles.saveAsLabel}>SAVE AS</Text>
              <View style={styles.addressTypeContainer}>
                <TouchableOpacity
                  style={[styles.addressTypeButton, type === 'home' && styles.addressTypeButtonActive]}
                  onPress={() => setType('home')}
                >
                  <Text style={styles.addressTypeIcon}>🏠</Text>
                  <Text style={[styles.addressTypeText, type === 'home' && styles.addressTypeTextActive]}>
                    Home
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.addressTypeButton, type === 'work' && styles.addressTypeButtonActive]}
                  onPress={() => setType('work')}
                >
                  <Text style={styles.addressTypeIcon}>💼</Text>
                  <Text style={[styles.addressTypeText, type === 'work' && styles.addressTypeTextActive]}>
                    Work
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.addressTypeButton, type === 'friends' && styles.addressTypeButtonActive]}
                  onPress={() => setType('friends')}
                >
                  <Text style={styles.addressTypeIcon}>👥</Text>
                  <Text style={[styles.addressTypeText, type === 'friends' && styles.addressTypeTextActive]}>
                    Friends and Family
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.addressTypeButton, type === 'other' && styles.addressTypeButtonActive]}
                  onPress={() => setType('other')}
                >
                  <Text style={styles.addressTypeIcon}>📍</Text>
                  <Text style={[styles.addressTypeText, type === 'other' && styles.addressTypeTextActive]}>
                    Other
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={saveAddress}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>ENTER HOUSE / FLAT / BLOCK NO.</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  unauthorizedSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Old styles removed - keeping only new styles below
  // New styles for the redesigned AddressScreen
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  backButton: {
    fontSize: 28,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerSpacer: {
    width: 28,
  },
  mapSection: {
    height: MAP_HEIGHT,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  currentLocationText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  locationIcon: {
    fontSize: 18,
    color: '#16a34a',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  retryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  addressDisplaySection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 14,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  selectedLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedLocationIcon: {
    fontSize: 22,
    color: '#16a34a',
    marginRight: 12,
  },
  selectedLocationInfo: {
    flex: 1,
  },
  selectedLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  selectedLocationCoords: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  deliveryInfoCard: {
    backgroundColor: '#f0fdf4',
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  deliveryInfoTitle: {
    fontSize: 14,
    color: '#15803d',
    marginBottom: 10,
    fontWeight: '600',
  },
  deliveryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  deliveryText: {
    fontSize: 13,
    color: '#15803d',
    fontWeight: '600',
  },
  formSection: {
    padding: 20,
  },
  formSectionTitle: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 20,
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  directionsContainer: {
    marginBottom: 16,
  },
  directionsInput: {
    height: 90,
    textAlignVertical: 'top',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  voiceIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#475569',
  },
  voiceText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  saveAsSection: {
    marginBottom: 20,
  },
  saveAsLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  addressTypeButton: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addressTypeButtonActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  addressTypeIcon: {
    fontSize: 18,
    marginBottom: 6,
  },
  addressTypeText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  addressTypeTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Address list styles
  addressesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addressType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  defaultBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setDefaultButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  setDefaultText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#dc2626',
  },
  addressText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
    lineHeight: 20,
  },
  locationCoordinates: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
    marginTop: 8,
  },
  addButton: {
    fontSize: 24,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  addNewIcon: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    marginRight: 8,
  },
  addNewText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AddressScreen;