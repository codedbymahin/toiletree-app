import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Switch, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Nunito_400Regular, Nunito_500Medium } from '@expo-google-fonts/nunito';
import { Input } from '../components';
import { toiletsService } from '../services/toilets';
import { SubmitStackParamList } from '../navigation/types';
import { showSuccessToast, showErrorToast } from '../utils/toast';

type SubmitRouteProp = RouteProp<SubmitStackParamList, 'SubmitForm'>;
type SubmitNavigationProp = StackNavigationProp<SubmitStackParamList, 'SubmitForm'>;

export const SubmitToiletScreen = () => {
  const route = useRoute<SubmitRouteProp>();
  const navigation = useNavigation<SubmitNavigationProp>();
  const insets = useSafeAreaInsets();
  const { latitude: initialLatitude, longitude: initialLongitude } = route.params;

  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
  });

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(initialLatitude.toString());
  const [longitude, setLongitude] = useState(initialLongitude.toString());
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [isFemaleFriendly, setIsFemaleFriendly] = useState(false);
  const [hasWaterAccess, setHasWaterAccess] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    const syncLocation = async () => {
      const latNum = Number(initialLatitude);
      const lngNum = Number(initialLongitude);

      if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
        return;
      }

      setLatitude(latNum.toString());
      setLongitude(lngNum.toString());

      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: latNum,
          longitude: lngNum,
        });

        if (addresses.length > 0) {
          const addr = addresses[0];
          const addressString = `${addr.street || ''} ${addr.city || ''}, ${addr.region || ''}`.trim();
          if (addressString) {
            setAddress(addressString);
          }
        }
      } catch (error) {
        console.warn('Failed to reverse geocode coordinates', error);
      }
    };

    syncLocation();
  }, [initialLatitude, initialLongitude]);

  const validate = () => {
    const newErrors = { name: '', address: '', latitude: '', longitude: '' };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!latitude || isNaN(lat)) {
      newErrors.latitude = 'Valid latitude is required';
      isValid = false;
    } else if (lat < -90 || lat > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
      isValid = false;
    }

    if (!longitude || isNaN(lng)) {
      newErrors.longitude = 'Valid longitude is required';
      isValid = false;
    } else if (lng < -180 || lng > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        showErrorToast(
          'Permission Required',
          'Please enable photo library permissions to upload a photo.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setPhotoUri(asset.uri || null);
      setPhotoBase64(asset.base64 ?? null);
    } catch (error) {
      showErrorToast('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        showErrorToast(
          'Permission Required',
          'Please enable camera permissions to take a photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setPhotoUri(asset.uri || null);
      setPhotoBase64(asset.base64 ?? null);
    } catch (error) {
      showErrorToast('Error', 'Failed to take photo');
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    const { success, error } = await toiletsService.submitToilet(
      name,
      address,
      parseFloat(latitude),
      parseFloat(longitude),
      photoUri
        ? {
            uri: photoUri,
            base64: photoBase64 ?? undefined,
          }
        : undefined,
      {
        is_female_friendly: isFemaleFriendly,
        has_water_access: hasWaterAccess,
        is_paid: isPaid,
      }
    );
    setLoading(false);

    if (error) {
      showErrorToast('Error', error);
    } else {
      showSuccessToast(
        'Success!',
        'Your toilet submission has been sent for admin approval. Thank you for contributing to Toiletree!'
      );
      // Reset form and navigate back after toast is shown
      setTimeout(() => {
        setName('');
        setAddress('');
        setLatitude(initialLatitude.toString());
        setLongitude(initialLongitude.toString());
        setPhotoUri(null);
        setPhotoBase64(null);
        setIsFemaleFriendly(false);
        setHasWaterAccess(false);
        setIsPaid(false);
        navigation.popToTop();
      }, 2000);
    }
  };

  // Don't block rendering while fonts load - they'll apply when ready
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={['#EAF4F4', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Submit a Toilet</Text>
            <Text style={styles.headerSubtitle}>
              Help others by adding a public toilet to the map. Your submission will be reviewed by an admin before appearing.
            </Text>
          </View>

          {/* Basic Information Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Basic Information</Text>
            
            <Input
              label="Toilet Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Central Park Restroom"
              error={errors.name}
            />

            <Input
              label="Address"
              value={address}
              onChangeText={setAddress}
              placeholder="Street address or location description"
              error={errors.address}
            />

            <View style={styles.coordinatesRow}>
              <View style={styles.coordinateInput}>
                <Input
                  label="Latitude"
                  value={latitude}
                  onChangeText={setLatitude}
                  placeholder="e.g., 37.7749"
                  keyboardType="numeric"
                  error={errors.latitude}
                />
              </View>
              <View style={styles.coordinateSpacer} />
              <View style={styles.coordinateInput}>
                <Input
                  label="Longitude"
                  value={longitude}
                  onChangeText={setLongitude}
                  placeholder="e.g., -122.4194"
                  keyboardType="numeric"
                  error={errors.longitude}
                />
              </View>
            </View>
          </View>

          {/* Features Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Features</Text>
            
            <View style={styles.featureRow}>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Female Friendly</Text>
                <Text style={styles.featureDescription}>Suitable facilities for women</Text>
              </View>
              <Switch
                value={isFemaleFriendly}
                onValueChange={setIsFemaleFriendly}
                trackColor={{ false: '#D1D5DB', true: '#D62828' }}
                thumbColor={isFemaleFriendly ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Water Available</Text>
                <Text style={styles.featureDescription}>Handwashing or drinking water</Text>
              </View>
              <Switch
                value={hasWaterAccess}
                onValueChange={setHasWaterAccess}
                trackColor={{ false: '#D1D5DB', true: '#D62828' }}
                thumbColor={hasWaterAccess ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <View style={[styles.featureRow, styles.featureRowLast]}>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Paid</Text>
                <Text style={styles.featureDescription}>Requires payment to use</Text>
              </View>
              <Switch
                value={isPaid}
                onValueChange={setIsPaid}
                trackColor={{ false: '#D1D5DB', true: '#D62828' }}
                thumbColor={isPaid ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>
          </View>

          {/* Photo Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Photo (Optional)</Text>
            
            {photoUri ? (
              <View>
                <Image
                  source={{ uri: photoUri }}
                  style={styles.photoPreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => {
                    setPhotoUri(null);
                    setPhotoBase64(null);
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="delete-outline" size={20} color="#D62828" style={{ marginRight: 8 }} />
                  <Text style={styles.removePhotoText}>Remove Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoButtonsRow}>
                <TouchableOpacity
                  style={[styles.photoButton, styles.photoButtonLeft]}
                  onPress={handleTakePhoto}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="camera-outline" size={20} color="#D62828" style={{ marginRight: 8 }} />
                  <Text style={styles.photoButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoButton, styles.photoButtonRight]}
                  onPress={handlePickImage}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="image-outline" size={20} color="#D62828" style={{ marginRight: 8 }} />
                  <Text style={styles.photoButtonText}>Choose Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Spacer for sticky footer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Sticky Footer with Submit Button */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit for Approval</Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120, // Extra padding for sticky footer
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Nunito_400Regular',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Nunito_500Medium',
    marginBottom: 16,
  },
  coordinatesRow: {
    flexDirection: 'row',
  },
  coordinateInput: {
    flex: 1,
  },
  coordinateSpacer: {
    width: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  featureRowLast: {
    borderBottomWidth: 0,
  },
  featureContent: {
    flex: 1,
    marginRight: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    fontFamily: 'Nunito_500Medium',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Nunito_400Regular',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  photoButtonsRow: {
    flexDirection: 'row',
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D62828',
    backgroundColor: 'transparent',
  },
  photoButtonLeft: {
    marginRight: 6,
  },
  photoButtonRight: {
    marginLeft: 6,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D62828',
    fontFamily: 'Nunito_500Medium',
  },
  removePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D62828',
    backgroundColor: 'transparent',
  },
  removePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D62828',
    fontFamily: 'Nunito_500Medium',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Nunito_400Regular',
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 100, // Space for sticky footer
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(234, 244, 244, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D62828',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D62828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Nunito_500Medium',
  },
});
