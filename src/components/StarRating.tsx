import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: number;
  showNumber?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  interactive = false,
  size = 24,
  showNumber = false,
  className = '',
}) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = i <= Math.round(rating);
      const star = filled ? '★' : '☆';
      
      if (interactive && onRatingChange) {
        stars.push(
          <TouchableOpacity key={i} onPress={() => onRatingChange(i)}>
            <Text style={{ fontSize: size }} className="text-yellow-500">
              {star}
            </Text>
          </TouchableOpacity>
        );
      } else {
        stars.push(
          <Text key={i} style={{ fontSize: size }} className="text-yellow-500">
            {star}
          </Text>
        );
      }
    }
    return stars;
  };

  return (
    <View className={`flex-row items-center ${className}`}>
      {renderStars()}
      {showNumber && (
        <Text className="ml-2 text-gray-600">
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

