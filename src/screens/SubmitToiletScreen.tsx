import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, Image, Switch } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Input, Button } from '../components';
import { toiletsService } from '../services/toilets';
import { SubmitStackParamList } from '../navigation/types';

type SubmitRouteProp = RouteProp<SubmitStackParamList, 'SubmitForm'>;
type SubmitNavigationProp = StackNavigationProp<SubmitStackParamList, 'SubmitForm'>;

export const SubmitToiletScreen = () => {
  const route = useRoute<SubmitRouteProp>();
  const navigation = useNavigation<SubmitNavigationProp>();
  const { latitude: initialLatitude, longitude: initialLongitude } = route.params;

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
        Alert.alert(
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
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
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
      Alert.alert('Error', 'Failed to take photo');
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
      Alert.alert('Error', error);
    } else {
      Alert.alert(
        'Success!',
        'Your toilet submission has been sent for admin approval. Thank you for contributing to Toiletree!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
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
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Submit a Toilet
        </Text>
        <Text className="text-gray-600 mb-6">
          Help others by adding a public toilet to the map. Your submission
          will be reviewed by an admin before appearing.
        </Text>

        {/* Form */}
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

        <View className="flex-row">
          <Input
            label="Latitude"
            value={latitude}
            onChangeText={setLatitude}
            placeholder="e.g., 37.7749"
            keyboardType="numeric"
            error={errors.latitude}
            className="flex-1 mr-2"
          />
          <Input
            label="Longitude"
            value={longitude}
            onChangeText={setLongitude}
            placeholder="e.g., -122.4194"
            keyboardType="numeric"
            error={errors.longitude}
            className="flex-1 ml-2"
          />
        </View>

        {/* Feature Toggles */}
        <View className="bg-gray-100 rounded-xl p-4 mb-6">
          <Text className="text-gray-800 font-semibold mb-3">Features</Text>

          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-gray-800 font-medium">Female Friendly</Text>
              <Text className="text-gray-500 text-sm">Suitable facilities for women</Text>
            </View>
            <Switch
              value={isFemaleFriendly}
              onValueChange={setIsFemaleFriendly}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={isFemaleFriendly ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-gray-800 font-medium">Water Available</Text>
              <Text className="text-gray-500 text-sm">Handwashing or drinking water</Text>
            </View>
            <Switch
              value={hasWaterAccess}
              onValueChange={setHasWaterAccess}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={hasWaterAccess ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-800 font-medium">Paid</Text>
              <Text className="text-gray-500 text-sm">Requires payment to use</Text>
            </View>
            <Switch
              value={isPaid}
              onValueChange={setIsPaid}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={isPaid ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Photo Section */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">
            Photo (Optional)
          </Text>
          
          {photoUri ? (
            <View>
              <Image
                source={{ uri: photoUri }}
                className="w-full h-48 rounded-lg mb-2"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => {
                  setPhotoUri(null);
                  setPhotoBase64(null);
                }}
                className="bg-red-100 py-2 rounded-lg"
              >
                <Text className="text-red-600 text-center font-semibold">
                  Remove Photo
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row">
              <TouchableOpacity
                onPress={handleTakePhoto}
                className="flex-1 bg-blue-100 py-3 rounded-lg mr-2 flex-row items-center justify-center"
              >
                <MaterialCommunityIcons name="camera-outline" size={20} color="#2563EB" style={{ marginRight: 6 }} />
                <Text className="text-blue-600 text-center font-semibold">
                  Take Photo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePickImage}
                className="flex-1 bg-blue-100 py-3 rounded-lg ml-2 flex-row items-center justify-center"
              >
                <MaterialCommunityIcons name="image-outline" size={20} color="#2563EB" style={{ marginRight: 6 }} />
                <Text className="text-blue-600 text-center font-semibold">
                  Choose Photo
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <Button
          title="Submit for Approval"
          onPress={handleSubmit}
          loading={loading}
          className="mt-4"
        />
      </View>
    </ScrollView>
  );
};

