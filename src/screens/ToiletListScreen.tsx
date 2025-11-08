import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Nunito_400Regular, Nunito_500Medium } from '@expo-google-fonts/nunito';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Toilet } from '../types';
import { toiletsService } from '../services/toilets';
import { LoadingSpinner, StarRating } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { showErrorToast } from '../utils/toast';

type ToiletListNavigationProp = StackNavigationProp<RootStackParamList, 'ToiletList'>;
type ToiletListRouteProp = RouteProp<RootStackParamList, 'ToiletList'>;

export const ToiletListScreen = () => {
  const navigation = useNavigation<ToiletListNavigationProp>();
  const route = useRoute<ToiletListRouteProp>();
  const { user } = useAuth();
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentBounds, setCurrentBounds] = useState<{
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null>(null);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
  });

  useEffect(() => {
    // Check if toilets were passed via route params (from MapScreen)
    const routeToilets = route.params?.toilets;
    const routeBounds = route.params?.bounds;
    
    if (routeToilets !== undefined) {
      // Use toilets from map view (visible area) - even if empty array
      setToilets(routeToilets);
      // Store bounds for refresh functionality
      if (routeBounds) {
        setCurrentBounds(routeBounds);
      }
      setLoading(false);
    } else {
      // Fallback: load all toilets if not passed from map
      loadToilets();
    }
  }, [route.params?.toilets, route.params?.bounds]);

  const loadToilets = async () => {
    const { toilets: fetchedToilets, error } = await toiletsService.getToilets();
    
    if (error) {
      showErrorToast('Error', 'Failed to load toilets');
    } else {
      setToilets(fetchedToilets);
    }
    setLoading(false);
  };

  /**
   * Load toilets within bounds (for refresh when synced with map)
   */
  const loadToiletsInBounds = async (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => {
    const { toilets: fetchedToilets, error } = await toiletsService.getToiletsInBounds(bounds);
    
    if (error) {
      showErrorToast('Error', 'Failed to load toilets');
    } else {
      setToilets(fetchedToilets);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // If we have bounds from the map view, use them to refresh
    // This keeps the list synchronized with the map's visible area
    if (currentBounds) {
      await loadToiletsInBounds(currentBounds);
    } else {
      // Fallback: load all toilets if no bounds available
      await loadToilets();
    }
    
    setRefreshing(false);
  };

  const handleToiletPress = (toilet: Toilet) => {
    navigation.navigate('ToiletDetails', {
      toiletId: toilet.id,
      toilet,
    });
  };

  const renderToiletCard = ({ item }: { item: Toilet }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleToiletPress(item)}
      activeOpacity={0.8}
    >
      {item.photo_url ? (
        <Image
          source={{ uri: item.photo_url }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoPlaceholder}
            resizeMode="contain"
          />
        </View>
      )}

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cardAddress} numberOfLines={2}>
          {item.address}
        </Text>

        {/* Feature Tags */}
        <View style={styles.tagsContainer}>
          {item.is_female_friendly && (
            <View style={styles.tagFemaleFriendly}>
              <Text style={styles.tagText}>♀️ Female Friendly</Text>
            </View>
          )}
          {item.has_water_access && (
            <View style={styles.tagWater}>
              <Text style={styles.tagText}>💧 Water</Text>
            </View>
          )}
          {item.is_paid && (
            <View style={styles.tagPaid}>
              <Text style={styles.tagText}>💰 Paid</Text>
            </View>
          )}
        </View>

        {/* Rating */}
        {item.average_rating !== undefined && item.average_rating > 0 && (
          <View style={styles.ratingContainer}>
            <StarRating rating={item.average_rating} size={16} showNumber />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (!fontsLoaded || loading) {
    return <LoadingSpinner message="Loading toilets..." />;
  }

  return (
    <LinearGradient
      colors={['#EAF4F4', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            // Explicitly navigate to Map screen to prevent crashes
            // Navigate to the appropriate tab navigator based on auth state
            if (user) {
              (navigation as any).navigate('MainTabs', { screen: 'Map' });
            } else {
              (navigation as any).navigate('GuestTabs', { screen: 'Map' });
            }
          }}
        >
          <MaterialCommunityIcons name="map" size={20} color="#2563EB" style={{ marginRight: 8 }} />
          <Text style={styles.backText}>Back to Map</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Toilets Nearby</Text>
      </View>

      {/* Toilet List */}
      <FlatList
        data={toilets}
        renderItem={renderToiletCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="toilet" size={64} color="#9CA3AF" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No toilets found</Text>
            <Text style={styles.emptySubtext}>
              Be the first to submit one!
            </Text>
          </View>
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
    fontFamily: 'Nunito_500Medium',
  },
  headerTitle: {
    fontSize: 24,
    color: '#1F2937',
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  placeholderImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#EAF4F4',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    opacity: 0.6,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Nunito_500Medium',
  },
  cardAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 14,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagFemaleFriendly: {
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagWater: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagPaid: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Nunito_500Medium',
  },
  ratingContainer: {
    marginTop: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
});

