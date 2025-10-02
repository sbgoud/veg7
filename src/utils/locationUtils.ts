// Utility functions for location-based calculations

export interface Location {
  latitude: number;
  longitude: number;
}

export interface StoreLocation extends Location {
  name: string;
  address: string;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param point1 First location coordinates
 * @param point2 Second location coordinates
 * @returns Distance in kilometers
 */
export function calculateDistance(point1: Location, point2: Location): number {
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

/**
 * Calculate estimated delivery duration based on distance
 * @param distance Distance in kilometers
 * @returns Estimated delivery time in minutes
 */
export function calculateDeliveryDuration(distance: number): number {
  // Base time: 15 minutes for order preparation
  const baseTime = 15;

  // Additional time based on distance (assuming 10 minutes per km for delivery)
  const travelTime = distance * 10;

  return Math.round(baseTime + travelTime);
}

/**
 * Find nearest store to user location
 * @param userLocation User's location coordinates
 * @param stores Array of store locations
 * @returns Nearest store with distance and duration
 */
export function findNearestStore(
  userLocation: Location,
  stores: StoreLocation[]
): { store: StoreLocation; distance: number; duration: number } | null {
  if (stores.length === 0) return null;

  let nearestStore = stores[0];
  let shortestDistance = calculateDistance(userLocation, nearestStore);

  for (let i = 1; i < stores.length; i++) {
    const distance = calculateDistance(userLocation, stores[i]);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestStore = stores[i];
    }
  }

  return {
    store: nearestStore,
    distance: Math.round(shortestDistance * 100) / 100, // Round to 2 decimal places
    duration: calculateDeliveryDuration(shortestDistance),
  };
}

/**
 * Format delivery duration for display
 * @param minutes Duration in minutes
 * @returns Formatted string (e.g., "25-35 mins")
 */
export function formatDeliveryDuration(minutes: number): string {
  // Add some variance for realistic estimates
  const minTime = Math.max(15, minutes - 5);
  const maxTime = minutes + 10;

  if (minutes <= 20) {
    return `${minutes} mins`;
  } else {
    return `${minTime}-${maxTime} mins`;
  }
}

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted string (e.g., "2.5 km")
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance.toFixed(1)} km`;
  }
}

/**
 * Get delivery fee based on distance
 * @param distance Distance in kilometers
 * @returns Delivery fee in rupees
 */
export function calculateDeliveryFee(distance: number): number {
  // Base fee: ₹20
  // Additional ₹10 per km after first km
  if (distance <= 1) {
    return 20;
  } else {
    return 20 + Math.ceil((distance - 1) * 10);
  }
}