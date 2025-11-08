import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Nunito_400Regular, Nunito_500Medium } from '@expo-google-fonts/nunito';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { Toilet, Review } from '../types';
import { StarRating, ReviewItem, LoadingSpinner, Input, Button } from '../components';
import { toiletsService } from '../services/toilets';
import { ratingsService } from '../services/ratings';
import { reviewsService } from '../services/reviews';
import { showSuccessToast, showErrorToast } from '../utils/toast';

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

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
  });

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
      showErrorToast('Error', 'Failed to load toilet details');
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
      showErrorToast('Error', error);
    } else {
      setUserRating(stars);
      showSuccessToast('Success', 'Rating submitted!');
      // Refresh toilet details to update average rating
      loadToiletDetails();
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      showErrorToast('Error', 'Please enter a review');
      return;
    }

    setSubmittingReview(true);
    const { success, error } = await reviewsService.addReview(toiletId, reviewText);
    setSubmittingReview(false);

    if (error) {
      showErrorToast('Error', error);
    } else {
      showSuccessToast('Success', 'Review submitted!');
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

  if (!fontsLoaded || loading) {
    return <LoadingSpinner message="Loading details..." />;
  }

  if (!toilet) {
    return (
      <LinearGradient
        colors={['#EAF4F4', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Toilet not found</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#EAF4F4', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Toilet Image */}
        {toilet.photo_url ? (
          <Image
            source={{ uri: toilet.photo_url }}
            style={styles.toiletImage}
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

        {/* Content Card */}
        <View style={styles.contentCard}>
          {/* Name and Address */}
          <Text style={styles.toiletName}>
            {toilet.name}
          </Text>
          <Text style={styles.toiletAddress}>{toilet.address}</Text>

          {/* Feature Tags */}
          <View style={styles.tagsContainer}>
            {toilet.is_female_friendly && (
              <View style={styles.tagFemaleFriendly}>
                <MaterialCommunityIcons name="gender-female" size={16} color="#BE185D" style={{ marginRight: 6 }} />
                <Text style={styles.tagText}>Female Friendly</Text>
              </View>
            )}
            {toilet.has_water_access && (
              <View style={styles.tagWater}>
                <MaterialCommunityIcons name="water" size={16} color="#1E40AF" style={{ marginRight: 6 }} />
                <Text style={styles.tagText}>Water Available</Text>
              </View>
            )}
            {toilet.is_paid && (
              <View style={styles.tagPaid}>
                <MaterialCommunityIcons name="cash" size={16} color="#B45309" style={{ marginRight: 6 }} />
                <Text style={styles.tagText}>Paid</Text>
              </View>
            )}
          </View>

          {/* Average Rating */}
          {toilet.average_rating !== undefined && toilet.average_rating > 0 && (
            <View style={styles.ratingSection}>
              <Text style={styles.sectionLabel}>
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
            <View style={styles.userRatingSection}>
              <Text style={styles.sectionLabel}>
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
            <View style={styles.guestPrompt}>
              <Text style={styles.guestPromptTitle}>
                Sign in to rate and review
              </Text>
              <Text style={styles.guestPromptText}>
                Create an account to rate toilets and share your experience with the community.
              </Text>
              <TouchableOpacity
                onPress={redirectToAuth}
                style={styles.guestPromptButton}
              >
                <Text style={styles.guestPromptButtonText}>
                  Sign In or Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              onPress={handleGetDirections}
              style={styles.primaryButton}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                Get Directions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReportIssue}
              style={styles.outlineButton}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineButtonText}>
                Report Issue
              </Text>
            </TouchableOpacity>
          </View>

          {/* Add Review - Only show for logged in users */}
          {user && (
            <View style={styles.reviewSection}>
              <Text style={styles.sectionTitle}>
                Write a Review
              </Text>
              <View style={styles.reviewInputContainer}>
                <Input
                  value={reviewText}
                  onChangeText={setReviewText}
                  placeholder="Share your experience..."
                  multiline
                  numberOfLines={4}
                />
              </View>
              <TouchableOpacity
                onPress={handleSubmitReview}
                disabled={submittingReview}
                style={[styles.primaryButton, styles.submitReviewButton, submittingReview && styles.buttonDisabled]}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Reviews List */}
          <View style={styles.reviewsListSection}>
            <Text style={styles.sectionTitle}>
              Reviews ({reviews.length})
            </Text>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))
            ) : (
              <Text style={styles.noReviewsText}>
                No reviews yet. Be the first to review!
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Nunito_400Regular',
  },
  toiletImage: {
    width: '100%',
    height: 280,
  },
  placeholderImage: {
    width: '100%',
    height: 280,
    backgroundColor: '#EAF4F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    opacity: 0.5,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 40,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  toiletName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    fontFamily: 'Poppins_700Bold',
  },
  toiletAddress: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 28,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 32,
  },
  tagFemaleFriendly: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagWater: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagPaid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Nunito_500Medium',
  },
  ratingSection: {
    marginBottom: 32,
  },
  userRatingSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    fontFamily: 'Nunito_500Medium',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    fontFamily: 'Poppins_700Bold',
  },
  guestPrompt: {
    backgroundColor: '#F3F4F6',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  guestPromptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Nunito_500Medium',
  },
  guestPromptText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 20,
  },
  guestPromptButton: {
    backgroundColor: '#D62828',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  guestPromptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Nunito_500Medium',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#D62828',
    minHeight: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    shadowColor: '#D62828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Nunito_500Medium',
  },
  outlineButton: {
    flex: 1,
    backgroundColor: 'transparent',
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  outlineButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Nunito_500Medium',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  reviewSection: {
    marginBottom: 32,
  },
  reviewInputContainer: {
    marginBottom: 20,
  },
  submitReviewButton: {
    marginTop: 0,
  },
  reviewsListSection: {
    marginTop: 8,
  },
  noReviewsText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 32,
    fontFamily: 'Nunito_400Regular',
  },
});
