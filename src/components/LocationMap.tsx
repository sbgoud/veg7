import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

interface LocationMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  height?: number;
}

const LocationMap: React.FC<LocationMapProps> = ({
  latitude,
  longitude,
  address,
  height = 200,
}) => {
  return (
    <View style={[styles.container, { height }]}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={address || 'Selected Location'}
          description="Delivery location"
          pinColor="#4CAF50"
        />
      </MapView>

      {address && (
        <View style={styles.addressOverlay}>
          <Text style={styles.addressText}>{address}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 10,
  },
  map: {
    flex: 1,
  },
  addressOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
  },
  addressText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});

export default LocationMap;