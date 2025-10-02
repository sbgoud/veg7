export interface GeocodingResult {
  city: string;
  state: string;
  pincode: string;
  fullAddress: string;
  landmark?: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Reverse geocode coordinates to address using Nominatim (OpenStreetMap)
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'veg7-app/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.error) {
      throw new Error('No geocoding data found');
    }

    // Extract address components
    const address = data.address || {};

    // Map the address components to our format
    const city = address.city ||
                 address.town ||
                 address.village ||
                 address.suburb ||
                 address.county ||
                 '';

    const state = address.state ||
                  address.region ||
                  '';

    const pincode = address.postcode || '';

    const fullAddress = data.display_name || '';

    // Extract landmark (could be a notable place nearby)
    const landmark = address.attraction ||
                     address.building ||
                     address.shop ||
                     address.amenity ||
                     '';

    return {
      city,
      state,
      pincode,
      fullAddress,
      landmark,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Get user's current location with permission handling
 */
export async function getCurrentLocation(): Promise<LocationCoordinates | null> {
  try {
    // Import expo-location properly
    const { requestForegroundPermissionsAsync, getCurrentPositionAsync, Accuracy } = await import('expo-location');

    // Request location permission
    const { status } = await requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.log('Location permission denied by user');
      return null;
    }

    // Get current position with high accuracy
    const location = await getCurrentPositionAsync({
      accuracy: Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}

/**
 * Auto-fill address form using current location
 */
export async function autoFillAddressFromLocation(): Promise<GeocodingResult | null> {
  try {
    const location = await getCurrentLocation();

    if (!location) {
      return null;
    }

    const addressData = await reverseGeocode(location.latitude, location.longitude);

    return addressData;
  } catch (error) {
    console.error('Error auto-filling address:', error);
    return null;
  }
}