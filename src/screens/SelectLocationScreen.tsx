import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubmitStackParamList } from '../navigation/types';
import { showErrorToast } from '../utils/toast';
import { LoadingSpinner } from '../components';

export { ToiletListScreen } from './ToiletListScreen';

type SubmitNavigationProp = StackNavigationProp<SubmitStackParamList, 'SelectLocation'>;

const FALLBACK_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194,
};

export const SelectLocationScreen = () => {
  const navigation = useNavigation<SubmitNavigationProp>();
  const insets = useSafeAreaInsets();
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [cameraCenter, setCameraCenter] = useState<[number, number] | null>(null);
  const [zoomLevel, setZoomLevel] = useState(14);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const cameraUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProgrammaticUpdateRef = useRef(false);

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          showErrorToast(
            'Location Permission',
            'Location access is required to center the map on your position. You can still select a location manually.'
          );
          const fallbackCenter: [number, number] = [FALLBACK_LOCATION.longitude, FALLBACK_LOCATION.latitude];
          setSelectedLocation(FALLBACK_LOCATION);
          setCameraCenter(fallbackCenter);
          setZoomLevel(14);
          
          // Set flag to prevent camera change handler from firing during initial setup
          isProgrammaticUpdateRef.current = true;
          if (cameraRef.current) {
            cameraRef.current.setCamera({
              centerCoordinate: fallbackCenter,
              zoomLevel: 14,
              animationDuration: 0,
            });
          }
          setTimeout(() => {
            isProgrammaticUpdateRef.current = false;
          }, 100);
          
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const initialLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        const initialCenter: [number, number] = [initialLocation.longitude, initialLocation.latitude];

        setSelectedLocation(initialLocation);
        setCameraCenter(initialCenter);
        setZoomLevel(14);
        
        // Set flag to prevent camera change handler from firing during initial setup
        isProgrammaticUpdateRef.current = true;
        if (cameraRef.current) {
          cameraRef.current.setCamera({
            centerCoordinate: initialCenter,
            zoomLevel: 14,
            animationDuration: 0,
          });
        }
        setTimeout(() => {
          isProgrammaticUpdateRef.current = false;
        }, 100);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to get current location', error);
        showErrorToast('Error', 'Unable to fetch your current location. Please move the map to select a spot.');
        const fallbackCenter: [number, number] = [FALLBACK_LOCATION.longitude, FALLBACK_LOCATION.latitude];
        setSelectedLocation(FALLBACK_LOCATION);
        setCameraCenter(fallbackCenter);
        setZoomLevel(14);
        
        // Set flag to prevent camera change handler from firing during initial setup
        isProgrammaticUpdateRef.current = true;
        if (cameraRef.current) {
          cameraRef.current.setCamera({
            centerCoordinate: fallbackCenter,
            zoomLevel: 14,
            animationDuration: 0,
          });
        }
        setTimeout(() => {
          isProgrammaticUpdateRef.current = false;
        }, 100);
        
        setLoading(false);
      }
    };

    initializeLocation();
  }, []);

  // Update selected location when camera center changes
  useEffect(() => {
    if (cameraCenter) {
      const [longitude, latitude] = cameraCenter;
      setSelectedLocation({ latitude, longitude });
    }
  }, [cameraCenter]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (cameraUpdateTimeoutRef.current) {
        clearTimeout(cameraUpdateTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handle camera changes when user moves/zooms the map
   * Debounced to prevent infinite loops and excessive state updates
   */
  const handleCameraChanged = (state: any) => {
    // Ignore camera changes if we're programmatically updating the camera
    if (isProgrammaticUpdateRef.current) {
      return;
    }

    // Clear existing timeout
    if (cameraUpdateTimeoutRef.current) {
      clearTimeout(cameraUpdateTimeoutRef.current);
    }

    // Debounce the state update - only update after user stops moving map for 200ms
    cameraUpdateTimeoutRef.current = setTimeout(() => {
      if (state?.properties?.center) {
        const [longitude, latitude] = state.properties.center;
        const zoom = state.properties.zoom ?? zoomLevel;
        
        // Update camera center state, which will trigger the useEffect to update selectedLocation
        setCameraCenter([longitude, latitude]);
        if (zoom !== zoomLevel) {
          setZoomLevel(zoom);
        }
      }
    }, 200); // 200ms debounce delay
  };

  const recenterOnUser = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      // Set flag to prevent camera change handler from firing during programmatic update
      isProgrammaticUpdateRef.current = true;
      
      // Update state directly
      const newCenter: [number, number] = [newLocation.longitude, newLocation.latitude];
      setCameraCenter(newCenter);
      setZoomLevel(14);
      setSelectedLocation(newLocation);
      
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: newCenter,
          zoomLevel: 14,
          animationDuration: 500,
        });
      }

      // Reset flag after a short delay to allow camera to update
      setTimeout(() => {
        isProgrammaticUpdateRef.current = false;
      }, 600); // Slightly longer than animation duration
    } catch (error) {
      showErrorToast('Error', 'Unable to recenter on your location.');
      isProgrammaticUpdateRef.current = false;
    }
  };

  const handleConfirm = () => {
    if (!selectedLocation) {
      showErrorToast('Select a location', 'Move the map to choose where the toilet should be.');
      return;
    }

    navigation.navigate('SubmitForm', {
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
    });
  };

  if (loading || !cameraCenter || !selectedLocation) {
    return <LoadingSpinner text="Finding your location..." />;
  }

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        onCameraChanged={handleCameraChanged}
      >
        <Mapbox.Camera
          ref={cameraRef}
          defaultSettings={
            cameraCenter
              ? {
                  centerCoordinate: cameraCenter,
                  zoomLevel: zoomLevel,
                }
              : undefined
          }
        />

        <Mapbox.UserLocation
          visible={true}
          animated={true}
        />
      </Mapbox.MapView>

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

      {/* Floating Action Button - Confirm */}
      <TouchableOpacity 
        style={styles.fabButton} 
        onPress={handleConfirm} 
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="check" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
  fabButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D62828',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D62828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});

