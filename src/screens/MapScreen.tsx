import React, { useState, useEffect } from 'react';
import { View, Alert, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Toilet } from '../types';
import { toiletsService } from '../services/toilets';
import { LoadingSpinner } from '../components';

export const MapScreen = () => {
  const navigation = useNavigation();
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [camera, setCamera] = useState<Mapbox.Camera | null>(null);
  const cameraRef = React.useRef<Mapbox.Camera>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Please enable location permissions to see toilets near you.'
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      
      // Load nearby toilets using the new method
      await loadNearbyToilets(
        location.coords.latitude,
        location.coords.longitude
      );

      // Set initial camera position
      const initialCamera: Mapbox.Camera = {
        centerCoordinate: [location.coords.longitude, location.coords.latitude],
        zoomLevel: 13,
        animationDuration: 0,
      };
      setCamera(initialCamera);
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location');
      setLoading(false);
    }
  };

  const loadNearbyToilets = async (lat: number, lon: number) => {
    const { toilets: fetchedToilets, error } = await toiletsService.getNearbyToilets(lat, lon, 10);
    
    if (error) {
      Alert.alert('Error', 'Failed to load toilets');
    } else {
      // Remove distance property for display (it's only used for sorting)
      setToilets(fetchedToilets.map(({ distance, ...toilet }) => toilet));
    }
  };

  const handleMarkerPress = (toilet: Toilet) => {
    navigation.navigate('ToiletDetails' as never, { 
      toiletId: toilet.id, 
      toilet 
    } as never);
  };

  const recenterMap = () => {
    if (userLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [
          userLocation.coords.longitude,
          userLocation.coords.latitude,
        ],
        zoomLevel: 13,
        animationDuration: 1000,
      });
    }
  };

  if (loading || !camera) {
    return <LoadingSpinner message="Loading map..." />;
  }

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
      >
        <Mapbox.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: camera.centerCoordinate,
            zoomLevel: camera.zoomLevel,
          }}
        />

        <Mapbox.UserLocation
          visible={true}
          animated={true}
        />

        {toilets.map((toilet) => (
          <Mapbox.PointAnnotation
            key={toilet.id}
            id={toilet.id}
            coordinate={[toilet.longitude, toilet.latitude]}
            onSelected={() => handleMarkerPress(toilet)}
          >
            <MaterialCommunityIcons name="map-marker" size={30} color="#2563EB" />
          </Mapbox.PointAnnotation>
        ))}
      </Mapbox.MapView>

      {/* Recenter Button */}
      <TouchableOpacity
        style={styles.recenterButton}
        onPress={recenterMap}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#2563EB" />
      </TouchableOpacity>

      {/* List View Button */}
      <TouchableOpacity
        style={styles.listButton}
        onPress={() => navigation.navigate('ToiletList' as never)}
      >
        <MaterialCommunityIcons name="format-list-bulleted" size={22} color="#1F2937" style={{ marginRight: 6 }} />
        <Text style={{ fontWeight: '600', color: '#1F2937' }}>List</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 30,
    paddingHorizontal: 18,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

