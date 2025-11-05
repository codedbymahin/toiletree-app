import React from 'react';
import { View, Text } from 'react-native';
import { Review } from '../types';

interface ReviewItemProps {
  review: Review;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View className="bg-gray-50 rounded-lg p-4 mb-3">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-semibold text-gray-800">
          {review.username || 'Anonymous'}
        </Text>
        <Text className="text-gray-500 text-xs">
          {formatDate(review.created_at)}
        </Text>
      </View>
      <Text className="text-gray-700">{review.review_text}</Text>
    </View>
  );
};

