import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SHIMMER_WIDTH = SCREEN_WIDTH * 0.6;

interface ShimmerOverlayProps {
  translateX: SharedValue<number>;
}

const ShimmerOverlay: React.FC<ShimmerOverlayProps> = ({ translateX }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <Animated.View style={[styles.shimmerContainer, animatedStyle]}>
      <LinearGradient
        colors={['transparent', 'rgba(255, 255, 255, 0.6)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.shimmerGradient}
      />
    </Animated.View>
  );
};

export const ToiletCardSkeleton: React.FC = () => {
  // Shared shimmer animation for all skeleton elements
  const shimmerTranslateX = useSharedValue(-SHIMMER_WIDTH);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    // Start continuous shimmer animation
    shimmerTranslateX.value = withRepeat(
      withTiming(SCREEN_WIDTH + SHIMMER_WIDTH, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1, // Infinite repeat
      false // Don't reverse
    );
  }, []);

  return (
    <View style={styles.card}>
      {/* Image Skeleton */}
      <View style={styles.imageSkeleton}>
        <ShimmerOverlay translateX={shimmerTranslateX} />
      </View>

      {/* Content Skeleton */}
      <View style={styles.contentSkeleton}>
        {/* Title Skeleton */}
        <View style={styles.titleSkeleton}>
          <ShimmerOverlay translateX={shimmerTranslateX} />
        </View>

        {/* Address Skeleton */}
        <View style={styles.addressSkeleton}>
          <ShimmerOverlay translateX={shimmerTranslateX} />
        </View>
        <View style={styles.addressSkeletonShort}>
          <ShimmerOverlay translateX={shimmerTranslateX} />
        </View>

        {/* Rating Skeleton */}
        <View style={styles.ratingSkeleton}>
          <ShimmerOverlay translateX={shimmerTranslateX} />
        </View>
      </View>
    </View>
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
  imageSkeleton: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  contentSkeleton: {
    padding: 20,
  },
  titleSkeleton: {
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 12,
    width: '70%',
    overflow: 'hidden',
    position: 'relative',
  },
  addressSkeleton: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 8,
    width: '90%',
    overflow: 'hidden',
    position: 'relative',
  },
  addressSkeletonShort: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 12,
    width: '60%',
    overflow: 'hidden',
    position: 'relative',
  },
  ratingSkeleton: {
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    width: '40%',
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SHIMMER_WIDTH,
  },
  shimmerGradient: {
    flex: 1,
    width: '100%',
  },
});
