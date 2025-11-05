import React, { useState, useEffect } from 'react';
import { View, Alert, TouchableOpacity, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
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
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    requestLocationPermission();
    loadToilets();
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
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location');
      setLoading(false);
    }
  };

  const loadToilets = async () => {
    const { toilets: fetchedToilets, error } = await toiletsService.getToilets();
    
    if (error) {
      Alert.alert('Error', 'Failed to load toilets');
    } else {
      setToilets(fetchedToilets);
    }
  };

  const handleMarkerPress = (toilet: Toilet) => {
    navigation.navigate('ToiletDetails' as never, { 
      toiletId: toilet.id, 
      toilet 
    } as never);
  };

  const recenterMap = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1000);
    }
  };

  const mapRef = React.useRef<MapView>(null);

  if (loading) {
    return <LoadingSpinner message="Loading map..." />;
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {toilets.map((toilet) => (
          <Marker
            key={toilet.id}
            coordinate={{
              latitude: toilet.latitude,
              longitude: toilet.longitude,
            }}
            title={toilet.name}
            description={toilet.address}
            onPress={() => handleMarkerPress(toilet)}
          >
            <MaterialCommunityIcons name="map-marker" size={30} color="#2563EB" />
          </Marker>
        ))}
      </MapView>

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

