import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useFonts, Nunito_400Regular } from '@expo-google-fonts/nunito';

interface LoadingSpinnerProps {
  message?: string;
  text?: string; // Alias for message for consistency
  size?: 'small' | 'large'; // Deprecated, kept for backward compatibility
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  text,
  size = 'large', // Not used anymore but kept for compatibility
}) => {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
  });

  // Breathing/pulsing animation for logo
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    // Continuous breathing animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1, // Infinite repeat
      false // Don't reverse
    );

    // Subtle opacity animation
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0.85, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  // Use text prop if provided, otherwise fall back to message
  const displayText = text || message;

  // Render even if fonts aren't loaded yet (will use system font as fallback)
  return (
    <LinearGradient
      colors={['#EAF4F4', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Animated Logo */}
        <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Loading Text */}
        {displayText && (
          <Text
            style={[
              styles.loadingText,
              fontsLoaded && { fontFamily: 'Nunito_400Regular' },
            ]}
          >
            {displayText}
          </Text>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});
