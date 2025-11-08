import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

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
      const starColor = filled ? '#FFC700' : '#D1D5DB'; // Gold for filled, light grey for empty
      
      if (interactive && onRatingChange) {
        stars.push(
          <TouchableOpacity key={i} onPress={() => onRatingChange(i)} activeOpacity={0.7}>
            <Text style={{ fontSize: size, color: starColor }}>
              {star}
            </Text>
          </TouchableOpacity>
        );
      } else {
        stars.push(
          <Text key={i} style={{ fontSize: size, color: starColor }}>
            {star}
          </Text>
        );
      }
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      {renderStars()}
      {showNumber && (
        <Text style={[styles.ratingText, { fontSize: size * 0.7 }]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 8,
    color: '#6B7280',
  },
});

