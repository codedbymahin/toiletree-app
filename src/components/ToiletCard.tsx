import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Toilet } from '../types';
import { StarRating } from './StarRating';

interface ToiletCardProps {
  toilet: Toilet;
  onPress: () => void;
}

export const ToiletCard: React.FC<ToiletCardProps> = ({ toilet, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg shadow-md mb-3 overflow-hidden"
    >
      {toilet.photo_url ? (
        <Image
          source={{ uri: toilet.photo_url }}
          className="w-full h-40"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-40 bg-gray-200 justify-center items-center">
          <Text className="text-gray-400 text-4xl">🚽</Text>
        </View>
      )}
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800 mb-1">
          {toilet.name}
        </Text>
        <Text className="text-gray-600 text-sm mb-2">
          {toilet.address}
        </Text>
        {toilet.average_rating !== undefined && toilet.average_rating > 0 && (
          <StarRating
            rating={toilet.average_rating}
            size={18}
            showNumber
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

