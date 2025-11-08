import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useFonts, Nunito_400Regular, Nunito_500Medium } from '@expo-google-fonts/nunito';
import { Toilet } from '../types';
import { StarRating } from './StarRating';

interface ToiletCardProps {
  toilet: Toilet;
  onPress: () => void;
}

export const ToiletCard: React.FC<ToiletCardProps> = ({ toilet, onPress }) => {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.card}
      activeOpacity={0.8}
    >
      {toilet.photo_url ? (
        <Image
          source={{ uri: toilet.photo_url }}
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
        <Text style={styles.cardTitle}>
          {toilet.name}
        </Text>
        <Text style={styles.cardAddress}>
          {toilet.address}
        </Text>
        {toilet.average_rating !== undefined && toilet.average_rating > 0 && (
          <View style={styles.ratingContainer}>
            <StarRating
              rating={toilet.average_rating}
              size={18}
              showNumber
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  placeholderImage: {
    width: '100%',
    height: 160,
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
    marginBottom: 12,
    lineHeight: 20,
    fontFamily: 'Nunito_400Regular',
  },
  ratingContainer: {
    marginTop: 4,
  },
});

