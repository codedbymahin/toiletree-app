import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, ScrollView, FlatList, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Nunito_400Regular, Nunito_500Medium } from '@expo-google-fonts/nunito';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Toilet } from '../types';
import { toiletsService } from '../services/toilets';
import { LoadingSpinner, ToiletCard, ToiletCardSkeleton } from '../components';
import { showErrorToast } from '../utils/toast';

/**
 * Calculate bounding box from center coordinate and zoom level
 * This approximates the visible map area
 */
function calculateBoundsFromCenterAndZoom(
  centerLat: number,
  centerLon: number,
  zoomLevel: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  // Calculate meters per pixel at this zoom level
  const metersPerPixel = (40075016.686 * Math.cos((centerLat * Math.PI) / 180)) / Math.pow(2, zoomLevel + 8);
  
  // Get screen dimensions (approximate for React Native)
  const { width, height } = Dimensions.get('window');
  
  // Calculate visible area in meters
  const visibleWidthMeters = width * metersPerPixel;
  const visibleHeightMeters = height * metersPerPixel;
  
  // Convert meters to degrees (approximate)
  const latDelta = visibleHeightMeters / 111000; // ~111km per degree
  const lonDelta = visibleWidthMeters / (111000 * Math.cos((centerLat * Math.PI) / 180));
  
  return {
    minLat: centerLat - latDelta / 2,
    maxLat: centerLat + latDelta / 2,
    minLng: centerLon - lonDelta / 2,
    maxLng: centerLon + lonDelta / 2,
  };
}

/**
 * Calculate bounding box for a radius in kilometers around a center point
 */
function calculateBoundsFromRadius(
  centerLat: number,
  centerLon: number,
  radiusKm: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latDelta = radiusKm / 111; // ~111 km per degree latitude
  const lonDelta = radiusKm / (111 * Math.cos((centerLat * Math.PI) / 180));
  
  return {
    minLat: centerLat - latDelta,
    maxLat: centerLat + latDelta,
    minLng: centerLon - lonDelta,
    maxLng: centerLon + lonDelta,
  };
}

export const MapScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  // 1. State Management
  const [visibleBounds, setVisibleBounds] = useState<{
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null>(null);
  const [displayedToilets, setDisplayedToilets] = useState<Toilet[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingToilets, setFetchingToilets] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [camera, setCamera] = useState<Mapbox.Camera | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Used to force refresh without changing bounds
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map'); // Map or List view toggle
  
  // Keep viewMode ref in sync with state for use in timeout callbacks
  useEffect(() => {
    viewModeRef.current = viewMode;
    // Clear camera change timeout when switching away from map view
    if (viewMode !== 'map' && cameraChangeTimeoutRef.current) {
      clearTimeout(cameraChangeTimeoutRef.current);
      cameraChangeTimeoutRef.current = null;
    }
  }, [viewMode]);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
  });

  // Hide default header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  
  // Refs for tracking camera state
  const cameraRef = React.useRef<Mapbox.Camera>(null);
  const mapRef = React.useRef<Mapbox.MapView>(null);
  const cameraChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentCenterRef = useRef<[number, number] | null>(null);
  const currentZoomRef = useRef<number>(13);
  
  // Track component mount state to prevent state updates on unmounted component
  const isMountedRef = useRef(true);
  const viewModeRef = useRef<'map' | 'list'>('map');

  // Animated header state
  const headerTranslateY = useSharedValue(-100); // Start off-screen above
  const headerOpacity = useSharedValue(0);
  const headerAnimatedRef = useRef(false); // Track if animation has played

  // Animate header on mount (only once)
  useEffect(() => {
    if (headerAnimatedRef.current) return;
    headerAnimatedRef.current = true;

    // Animation sequence: slide down → wait 2 seconds → slide up
    const slideDownDuration = 500;
    const waitDuration = 2000;
    const slideUpDuration = 400;

    // Slide down animation
    headerTranslateY.value = withSequence(
      withTiming(0, {
        duration: slideDownDuration,
        easing: Easing.out(Easing.ease),
      }),
      withDelay(
        waitDuration,
        withTiming(-100, {
          duration: slideUpDuration,
          easing: Easing.in(Easing.ease),
        })
      )
    );

    // Fade in/out animation (synchronized)
    headerOpacity.value = withSequence(
      withTiming(1, {
        duration: slideDownDuration,
        easing: Easing.out(Easing.ease),
      }),
      withDelay(
        waitDuration,
        withTiming(0, {
          duration: slideUpDuration,
          easing: Easing.in(Easing.ease),
        })
      )
    );
  }, []);

  // 2. Initial Load - useEffect with empty dependency array
  useEffect(() => {
    isMountedRef.current = true;
    
    const initializeMap = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (!isMountedRef.current) return;
        
        if (status !== 'granted') {
          if (isMountedRef.current) {
            showErrorToast(
              'Location Permission',
              'Please enable location permissions to see toilets near you.'
            );
            setLoading(false);
          }
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        
        if (!isMountedRef.current) return;
        
        setUserLocation(location);
        
        const lat = location.coords.latitude;
        const lon = location.coords.longitude;

        // Calculate initial 5km bounding box around user's location
        const initialBounds = calculateBoundsFromRadius(lat, lon, 5);
        
        if (isMountedRef.current) {
          // Store in visibleBounds state - this will trigger the data-fetching useEffect
          setVisibleBounds(initialBounds);

          // Set initial camera position
          const initialCamera: Mapbox.Camera = {
            centerCoordinate: [lon, lat],
            zoomLevel: 13,
            animationDuration: 0,
          };
          setCamera(initialCamera);
          currentCenterRef.current = [lon, lat];
          currentZoomRef.current = 13;
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting location:', error);
        if (isMountedRef.current) {
          showErrorToast('Error', 'Failed to get your location');
          setLoading(false);
        }
      }
    };

    initializeMap();
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (cameraChangeTimeoutRef.current) {
        clearTimeout(cameraChangeTimeoutRef.current);
        cameraChangeTimeoutRef.current = null;
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, []);

  // 4. Data Fetching useEffect - This is the single source of truth for fetching toilets
  useEffect(() => {
    if (!visibleBounds || !isMountedRef.current) {
      return; // Don't fetch if bounds are not set or component is unmounted
    }

    const fetchToilets = async () => {
      // Set fetching state for skeletons (only if not initial load)
      if (!loading && isMountedRef.current) {
        setFetchingToilets(true);
      }
      
      try {
        const { toilets, error } = await toiletsService.getToiletsInBounds(visibleBounds);
        
        // Check if component is still mounted before updating state
        if (!isMountedRef.current) return;
        
        if (error) {
          console.error('Error loading toilets:', error);
          if (loading && isMountedRef.current) {
            showErrorToast('Error', 'Failed to load toilets');
          }
        } else {
          setDisplayedToilets(toilets);
        }
      } catch (error) {
        console.error('Error in fetchToilets:', error);
      } finally {
        if (isMountedRef.current) {
          setFetchingToilets(false);
        }
      }
    };

    fetchToilets();
  }, [visibleBounds, refreshKey]); // This effect runs whenever visibleBounds or refreshKey changes

  // 3. Handle camera changes when map moves
  const handleCameraChanged = (state: any) => {
    // Don't process camera changes if component is unmounted or map view is not active
    if (!isMountedRef.current || viewModeRef.current !== 'map') return;
    
    // Clear existing timeout
    if (cameraChangeTimeoutRef.current) {
      clearTimeout(cameraChangeTimeoutRef.current);
      cameraChangeTimeoutRef.current = null;
    }

    // Update refs immediately for tracking
    if (state?.properties?.center && state?.properties?.zoom !== undefined) {
      currentCenterRef.current = state.properties.center;
      currentZoomRef.current = state.properties.zoom;
    }

    // Debounce: Wait for user to stop moving the map (500ms)
    cameraChangeTimeoutRef.current = setTimeout(() => {
      // Check if component is still mounted and map view is still active before updating state
      // Use refs to avoid stale closure values
      if (!isMountedRef.current || viewModeRef.current !== 'map' || !currentCenterRef.current) {
        return;
      }

      const [centerLon, centerLat] = currentCenterRef.current;
      const zoomLevel = currentZoomRef.current;

      // Calculate new visible bounding box
      const newBounds = calculateBoundsFromCenterAndZoom(centerLat, centerLon, zoomLevel);
      
      // Update visibleBounds state - this will trigger the data-fetching useEffect
      if (isMountedRef.current && viewModeRef.current === 'map') {
        setVisibleBounds(newBounds);
      }
    }, 500);
  };

  const handleMarkerPress = (toilet: Toilet) => {
    navigation.navigate('ToiletDetails' as never, { 
      toiletId: toilet.id, 
      toilet 
    } as never);
  };

  const recenterMap = async () => {
    if (!isMountedRef.current) return;
    
    if (userLocation && cameraRef.current) {
      const lat = userLocation.coords.latitude;
      const lon = userLocation.coords.longitude;
      
      // Update camera position
      if (isMountedRef.current && cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [lon, lat],
          zoomLevel: 13,
          animationDuration: 1000,
        });
      }

      // Update refs
      currentCenterRef.current = [lon, lat];
      currentZoomRef.current = 13;

      // Calculate 5km radius bounds and update visibleBounds
      // This will trigger the data-fetching useEffect
      if (isMountedRef.current) {
        const bounds = calculateBoundsFromRadius(lat, lon, 5);
        setVisibleBounds(bounds);
      }
    }
  };

  // 5. Pull-to-refresh function - Re-triggers data fetch for current visibleBounds
  const handleRefresh = async () => {
    if (!visibleBounds || !isMountedRef.current) {
      return;
    }
    
    // Clear any existing refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    
    setRefreshing(true);
    // Re-trigger the data-fetching useEffect by incrementing refreshKey
    // This causes the useEffect to re-run and fetch toilets for the current visibleBounds
    setRefreshKey(prev => prev + 1);
    // Reset refreshing state after a short delay to allow fetch to complete
    refreshTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
      refreshTimeoutRef.current = null;
    }, 1000);
  };

  const handleToiletPress = (toilet: Toilet) => {
    navigation.navigate('ToiletDetails' as never, {
      toiletId: toilet.id,
      toilet,
    } as never);
  };

  const getUserDisplayName = () => {
    if (user?.username) {
      // Capitalize first letter of username
      return user.username.charAt(0).toUpperCase() + user.username.slice(1);
    }
    return 'Guest';
  };

  // Animated header style
  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: headerTranslateY.value }],
      opacity: headerOpacity.value,
    };
  });

  if (!fontsLoaded || loading || !camera) {
    return <LoadingSpinner message="Loading map..." />;
  }

  return (
    <View style={styles.container}>
      {/* Segmented Control at Top - Only visible in map mode */}
      {viewMode === 'map' && (
        <SafeAreaView style={styles.topSegmentedControlContainer} edges={['top']}>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segmentButton, viewMode === 'map' && styles.segmentButtonActive]}
              onPress={() => setViewMode('map')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons 
                name="map" 
                size={20} 
                color={viewMode === 'map' ? '#FFFFFF' : '#6B7280'} 
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.segmentText, viewMode === 'map' && styles.segmentTextActive]}>
                Map
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentButton, viewMode === 'list' && styles.segmentButtonActive]}
              onPress={() => setViewMode('list')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons 
                name="format-list-bulleted" 
                size={20} 
                color={viewMode === 'list' ? '#FFFFFF' : '#6B7280'} 
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.segmentText, viewMode === 'list' && styles.segmentTextActive]}>
                List
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      {/* Map View - Hidden when list view is active */}
      {viewMode === 'map' && (
        <Mapbox.MapView
          ref={mapRef}
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}
          onCameraChanged={handleCameraChanged}
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

          {displayedToilets.map((toilet) => (
            <Mapbox.PointAnnotation
              key={toilet.id}
              id={toilet.id}
              coordinate={[toilet.longitude, toilet.latitude]}
              onSelected={() => handleToiletPress(toilet)}
            >
              <MaterialCommunityIcons name="map-marker" size={30} color="#D62828" />
            </Mapbox.PointAnnotation>
          ))}
        </Mapbox.MapView>
      )}

      {/* List View - Shown when list mode is active */}
      {viewMode === 'list' && (
        <SafeAreaView style={styles.listSafeArea} edges={['top']}>
          <LinearGradient
            colors={['#EAF4F4', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.listContainer}
          >
            {/* Header */}
            <View style={styles.listHeader}>
              <View style={styles.listHeaderTop}>
                <View style={styles.listHeaderLeft}>
                  <Text style={styles.listHeaderTitle}>Toilets Nearby</Text>
                  <Text style={styles.listHeaderSubtitle}>
                    {displayedToilets.length === 1
                      ? '1 Toilet Found'
                      : `${displayedToilets.length} Toilets Found`}
                  </Text>
                </View>
                {/* Map/List Toggle */}
                <View style={styles.listHeaderToggle}>
                  <View style={styles.segmentedControlCompact}>
                    <TouchableOpacity
                      style={[styles.segmentButtonCompact, viewMode === 'map' && styles.segmentButtonActiveCompact]}
                      onPress={() => setViewMode('map')}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons 
                        name="map" 
                        size={16} 
                        color={viewMode === 'map' ? '#FFFFFF' : '#6B7280'} 
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.segmentTextCompact, viewMode === 'map' && styles.segmentTextActiveCompact]}>
                        Map
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.segmentButtonCompact, viewMode === 'list' && styles.segmentButtonActiveCompact]}
                      onPress={() => setViewMode('list')}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons 
                        name="format-list-bulleted" 
                        size={16} 
                        color={viewMode === 'list' ? '#FFFFFF' : '#6B7280'} 
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.segmentTextCompact, viewMode === 'list' && styles.segmentTextActiveCompact]}>
                        List
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <FlatList
              data={displayedToilets}
              renderItem={({ item }) => (
                <ToiletCard
                  toilet={item}
                  onPress={() => handleToiletPress(item)}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              ListEmptyComponent={
                fetchingToilets ? (
                  <View>
                    <ToiletCardSkeleton />
                    <ToiletCardSkeleton />
                    <ToiletCardSkeleton />
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="toilet" size={64} color="#9CA3AF" style={{ marginBottom: 16 }} />
                    <Text style={styles.emptyText}>No toilets found</Text>
                    <Text style={styles.emptySubtext}>
                      Move the map to explore different areas
                    </Text>
                  </View>
                )
              }
              ListHeaderComponent={
                fetchingToilets && displayedToilets.length === 0 ? null : null
              }
            />
          </LinearGradient>
        </SafeAreaView>
      )}

      {/* Animated Welcome Header - Slides down then up after 2 seconds */}
      {viewMode === 'map' && (
        <SafeAreaView style={styles.headerSafeArea} edges={['top']} pointerEvents="box-none">
          <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
            <View style={styles.headerBlur}>
              <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                  <Text style={styles.welcomeText}>Hi, {getUserDisplayName()}!</Text>
                </View>
                <TouchableOpacity
                  style={styles.notificationButton}
                  onPress={() => {
                    // TODO: Implement notifications
                    showErrorToast('Notifications', 'Notifications coming soon!');
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="bell-outline" size={24} color="#1F2937" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </SafeAreaView>
      )}

      {/* Map View - Recenter Button (only visible in map mode) */}
      {viewMode === 'map' && (
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={recenterMap}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#D62828" />
        </TouchableOpacity>
      )}

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
  listSafeArea: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  listHeaderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  listHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  listHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
  },
  listHeaderSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Nunito_400Regular',
  },
  listHeaderToggle: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 2, // Align with title text
  },
  segmentedControlCompact: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  segmentButtonCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 70,
    justifyContent: 'center',
  },
  segmentButtonActiveCompact: {
    backgroundColor: '#D62828',
    shadowColor: '#D62828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  segmentTextCompact: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'Nunito_500Medium',
  },
  segmentTextActiveCompact: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'Nunito_500Medium',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Nunito_400Regular',
  },
  topSegmentedControlContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 8,
    paddingBottom: 12,
    alignItems: 'center', // Center the segmented control horizontally
  },
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    pointerEvents: 'box-none',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 70, // Position below segmented control (height ~60px + padding)
  },
  headerBlur: {
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Poppins_700Bold',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 30, // Increased for perfect pill shape
    padding: 4,
    alignSelf: 'center', // Self-size and center
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, // Slightly increased for better visibility
    shadowRadius: 12,
    elevation: 6,
  },
  segmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    minWidth: 100,
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#D62828',
    shadowColor: '#D62828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  segmentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'Nunito_500Medium',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
});
