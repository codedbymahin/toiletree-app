import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button } from '../components';
import { RootStackParamList } from '../navigation/types';

type ProfileNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<ProfileNavigationProp>();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const navigateToAdmin = () => {
    navigation.navigate('Admin' as never);
  };

  const navigateToSettings = () => {
    (navigation as any).navigate('Settings');
  };

  return (
    <View className="flex-1 bg-white">
      {/* Settings Button - Header */}
      <TouchableOpacity
        onPress={navigateToSettings}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
          backgroundColor: '#F3F4F6',
          borderRadius: 20,
          width: 40,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <MaterialCommunityIcons name="cog-outline" size={20} color="#1F2937" />
      </TouchableOpacity>

      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Profile Header */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-800">
            {user?.username}
          </Text>
          {user?.is_admin && (
            <View className="mt-2 bg-blue-500 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">ADMIN</Text>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Your Activity
          </Text>
          <View className="flex-row justify-between">
            <View className="bg-blue-50 flex-1 mr-2 p-4 rounded-lg items-center">
              <Text className="text-3xl font-bold text-blue-600">-</Text>
              <Text className="text-gray-600 text-sm mt-1">Submissions</Text>
            </View>
            <View className="bg-green-50 flex-1 mx-1 p-4 rounded-lg items-center">
              <Text className="text-3xl font-bold text-green-600">-</Text>
              <Text className="text-gray-600 text-sm mt-1">Ratings</Text>
            </View>
            <View className="bg-purple-50 flex-1 ml-2 p-4 rounded-lg items-center">
              <Text className="text-3xl font-bold text-purple-600">-</Text>
              <Text className="text-gray-600 text-sm mt-1">Reviews</Text>
            </View>
          </View>
        </View>

        {/* Admin Access */}
        {user?.is_admin && (
          <TouchableOpacity
            onPress={navigateToAdmin}
            className="bg-blue-600 p-4 rounded-lg mb-4"
          >
            <Text className="text-white text-center font-semibold">
              Go to Admin Dashboard
            </Text>
          </TouchableOpacity>
        )}

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          className="mb-4"
        />
        </View>
      </ScrollView>
    </View>
  );
};

