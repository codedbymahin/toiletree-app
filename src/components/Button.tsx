import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useFonts, Nunito_500Medium } from '@expo-google-fonts/nunito';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
}) => {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);

  // Load fonts
  const [fontsLoaded] = useFonts({
    Nunito_500Medium,
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withSpring(1.05, {
        damping: 10,
        stiffness: 300,
      });
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      scale.value = withSpring(1, {
        damping: 10,
        stiffness: 300,
      });
    }
  };

  const handlePress = () => {
    if (!isDisabled && !loading) {
      onPress();
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.9}
        style={[
          {
            minHeight: 48,
            borderRadius: 24,
            paddingVertical: 14,
            paddingHorizontal: 32,
            backgroundColor: '#D62828',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#D62828',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
            opacity: isDisabled ? 0.6 : 1,
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            style={{
              color: '#fff',
              fontWeight: '700',
              fontSize: 16,
              fontFamily: 'Nunito_500Medium',
            }}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

