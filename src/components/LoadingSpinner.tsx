import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'large',
}) => {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size={size} color="#2563EB" />
      {message && (
        <Text className="mt-4 text-gray-600 text-center">{message}</Text>
      )}
    </View>
  );
};

