import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { Toilet, Review } from '../types';
import { StarRating, ReviewItem, LoadingSpinner, Input, Button } from '../components';
import { toiletsService } from '../services/toilets';
import { ratingsService } from '../services/ratings';
import { reviewsService } from '../services/reviews';

export const ToiletDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { redirectToAuth } = useAuthRedirect();
  const { toiletId, toilet: initialToilet } = route.params as {
    toiletId: string;
    toilet?: Toilet;
  };

  // Check if there's navigation history to go back to
  const canGoBack = navigation.canGoBack();

  const [toilet, setToilet] = useState<Toilet | null>(initialToilet || null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(!initialToilet);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadToiletDetails();
    loadReviews();
    if (user) {
      loadUserRating();
    }
  }, [toiletId, user]);

  // Set up header with "Back to Map" button if there's no back navigation
  useLayoutEffect(() => {
    if (!canGoBack) {
      navigation.setOptions({
        headerLeft: () => {
          const handleBackToMap = () => {
            // Try to navigate to MainTabs (for authenticated users) or GuestTabs (for guests)
            try {
              // First try MainTabs (authenticated mode)
              navigation.navigate('MainTabs' as never, { screen: 'Map' } as never);
            } catch (error) {
              try {
                // Fallback to GuestTabs (guest mode)
                navigation.navigate('GuestTabs' as never, { screen: 'Map' } as never);
              } catch (guestError) {
                // Final fallback: go back to root
                navigation.goBack();
              }
            }
          };

          return (
            <TouchableOpacity
              onPress={handleBackToMap}
              style={{
                marginLeft: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#2563EB" />
              <Text style={{ marginLeft: 8, fontSize: 16, color: '#2563EB', fontWeight: '600' }}>
                Back to Map
              </Text>
            </TouchableOpacity>
          );
        },
      });
    } else {
      // Reset to default header if back is available
      navigation.setOptions({
        headerLeft: undefined,
      });
    }
  }, [navigation, canGoBack]);

  const loadToiletDetails = async () => {
    if (initialToilet) {
      setToilet(initialToilet);
      return;
    }

    const { toilet: fetchedToilet, error } = await toiletsService.getToiletById(toiletId);
    
    if (error) {
      Alert.alert('Error', 'Failed to load toilet details');
    } else {
      setToilet(fetchedToilet);
    }
    setLoading(false);
  };

  const loadReviews = async () => {
    const { reviews: fetchedReviews, error } = await reviewsService.getReviews(toiletId);
    
    if (!error) {
      setReviews(fetchedReviews);
    }
  };

  const loadUserRating = async () => {
    const { rating, error } = await ratingsService.getUserRating(toiletId);
    
    if (!error && rating) {
      setUserRating(rating.stars);
    }
  };

  const handleRateToilet = async (stars: number) => {
    const { success, error } = await ratingsService.rateToilet(toiletId, stars);
    
    if (error) {
      Alert.alert('Error', error);
    } else {
      setUserRating(stars);
      Alert.alert('Success', 'Rating submitted!');
      // Refresh toilet details to update average rating
      loadToiletDetails();
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      Alert.alert('Error', 'Please enter a review');
      return;
    }

    setSubmittingReview(true);
    const { success, error } = await reviewsService.addReview(toiletId, reviewText);
    setSubmittingReview(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert('Success', 'Review submitted!');
      setReviewText('');
      loadReviews();
    }
  };

  const handleGetDirections = () => {
    if (toilet) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${toilet.latitude},${toilet.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleReportIssue = () => {
    if (!user) {
      // Redirect to login for guests
      redirectToAuth();
      return;
    }
    navigation.navigate('ReportIssue' as never, {
      toiletId: toilet?.id,
      toiletName: toilet?.name,
    } as never);
  };

  if (loading) {
    return <LoadingSpinner message="Loading details..." />;
  }

  if (!toilet) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-gray-600">Toilet not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Toilet Image */}
      {toilet.photo_url ? (
        <Image
          source={{ uri: toilet.photo_url }}
          className="w-full h-64"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-64 bg-gray-200 justify-center items-center">
          <MaterialCommunityIcons name="camera-off-outline" size={64} color="#9CA3AF" />
        </View>
      )}

      <View className="p-6">
        {/* Name and Address */}
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          {toilet.name}
        </Text>
        <Text className="text-gray-600 mb-4">{toilet.address}</Text>

        {/* Feature Tags */}
        <View className="flex-row flex-wrap mb-6">
          {toilet.is_female_friendly && (
            <View className="flex-row items-center bg-pink-100 px-3 py-2 rounded-full mr-2 mb-2">
              <MaterialCommunityIcons name="gender-female" size={18} color="#BE185D" style={{ marginRight: 4 }} />
              <Text className="text-pink-700 font-medium">Female Friendly</Text>
            </View>
          )}
          {toilet.has_water_access && (
            <View className="flex-row items-center bg-blue-100 px-3 py-2 rounded-full mr-2 mb-2">
              <MaterialCommunityIcons name="water" size={18} color="#1E40AF" style={{ marginRight: 4 }} />
              <Text className="text-blue-700 font-medium">Water Available</Text>
            </View>
          )}
          {toilet.is_paid && (
            <View className="flex-row items-center bg-yellow-100 px-3 py-2 rounded-full mr-2 mb-2">
              <MaterialCommunityIcons name="cash" size={18} color="#B45309" style={{ marginRight: 4 }} />
              <Text className="text-yellow-700 font-medium">Paid</Text>
            </View>
          )}
        </View>

        {/* Average Rating */}
        {toilet.average_rating !== undefined && toilet.average_rating > 0 && (
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">
              Average Rating
            </Text>
            <StarRating
              rating={toilet.average_rating}
              size={28}
              showNumber
            />
          </View>
        )}

        {/* User Rating - Only show for logged in users */}
        {user && (
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">
              {userRating > 0 ? 'Your Rating (tap to change)' : 'Rate This Toilet'}
            </Text>
            <StarRating
              rating={userRating}
              onRatingChange={handleRateToilet}
              interactive
              size={32}
            />
          </View>
        )}

        {/* Guest Login Prompt */}
        {!user && (
          <View className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <Text className="text-blue-800 font-semibold mb-2">
              Sign in to rate and review
            </Text>
            <Text className="text-blue-600 text-sm mb-3">
              Create an account to rate toilets and share your experience with the community.
            </Text>
            <TouchableOpacity
              onPress={redirectToAuth}
              className="bg-blue-600 py-2 px-4 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">
                Sign In or Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row mb-6">
          <TouchableOpacity
            onPress={handleGetDirections}
            className="flex-1 bg-blue-600 py-3 rounded-lg mr-2"
          >
            <Text className="text-white text-center font-semibold">
              Get Directions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleReportIssue}
            className="flex-1 bg-red-600 py-3 rounded-lg ml-2"
          >
            <Text className="text-white text-center font-semibold">
              Report Issue
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Review - Only show for logged in users */}
        {user && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Write a Review
            </Text>
            <Input
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Share your experience..."
              multiline
              numberOfLines={4}
            />
            <Button
              title="Submit Review"
              onPress={handleSubmitReview}
              loading={submittingReview}
            />
          </View>
        )}

        {/* Reviews List */}
        <View>
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Reviews ({reviews.length})
          </Text>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))
          ) : (
            <Text className="text-gray-500 text-center py-4">
              No reviews yet. Be the first to review!
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

