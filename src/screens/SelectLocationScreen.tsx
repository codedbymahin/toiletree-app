import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SubmitStackParamList } from '../navigation/types';

export { ToiletListScreen } from './ToiletListScreen';

type SubmitNavigationProp = StackNavigationProp<SubmitStackParamList, 'SelectLocation'>;

const FALLBACK_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const SelectLocationScreen = () => {
  const navigation = useNavigation<SubmitNavigationProp>();
  const [region, setRegion] = useState<Region | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert(
            'Location Permission',
            'Location access is required to center the map on your position. You can still select a location manually.'
          );
          setRegion(FALLBACK_REGION);
          setSelectedLocation({
            latitude: FALLBACK_REGION.latitude,
            longitude: FALLBACK_REGION.longitude,
          });
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const nextRegion: Region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(nextRegion);
        setSelectedLocation({
          latitude: nextRegion.latitude,
          longitude: nextRegion.longitude,
        });
        setLoading(false);
      } catch (error) {
        console.error('Failed to get current location', error);
        Alert.alert('Error', 'Unable to fetch your current location. Please move the map to select a spot.');
        setRegion(FALLBACK_REGION);
        setSelectedLocation({
          latitude: FALLBACK_REGION.latitude,
          longitude: FALLBACK_REGION.longitude,
        });
        setLoading(false);
      }
    };

    initializeLocation();
  }, []);

  const handleRegionChangeComplete = (nextRegion: Region) => {
    setRegion(nextRegion);
    setSelectedLocation({ latitude: nextRegion.latitude, longitude: nextRegion.longitude });
  };

  const recenterOnUser = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const nextRegion: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(nextRegion);
      setSelectedLocation({ latitude: nextRegion.latitude, longitude: nextRegion.longitude });
      mapRef.current?.animateToRegion(nextRegion, 500);
    } catch (error) {
      Alert.alert('Error', 'Unable to recenter on your location.');
    }
  };

  const handleConfirm = () => {
    if (!selectedLocation) {
      Alert.alert('Select a location', 'Move the map to choose where the toilet should be.');
      return;
    }

    navigation.navigate('SubmitForm', {
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
    });
  };

  if (loading || !region || !selectedLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
      />

      <View pointerEvents="none" style={styles.markerFixed}>
        <MaterialCommunityIcons name="map-marker" size={36} color="#EF4444" />
      </View>

      <TouchableOpacity style={styles.recenterButton} onPress={recenterOnUser}>
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#2563EB" />
      </TouchableOpacity>

      <View style={styles.coordinatesBadge}>
        <Text style={styles.coordinatesText}>
          {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
        </Text>
      </View>

      <View style={styles.bottomSheet}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Confirm Position</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  markerFixed: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -18,
    marginTop: -18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recenterButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#fff',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  coordinatesBadge: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  confirmButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
});

