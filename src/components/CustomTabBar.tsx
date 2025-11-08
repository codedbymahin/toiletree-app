import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Nunito_400Regular, Nunito_500Medium } from '@expo-google-fonts/nunito';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabButtonProps {
  route: any;
  index: number;
  state: any;
  descriptors: any;
  navigation: any;
  isSubmitButton?: boolean;
  fontsLoaded?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({
  route,
  index,
  state,
  descriptors,
  navigation,
  isSubmitButton = false,
  fontsLoaded = false,
}) => {
  const { options } = descriptors[route.key];
  const label =
    options.tabBarLabel !== undefined
      ? options.tabBarLabel
      : options.title !== undefined
      ? options.title
      : route.name;

  const isFocused = state.index === index;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const onPress = () => {
    // Animate button press
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.85,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const onLongPress = () => {
    navigation.emit({
      type: 'tabLongPress',
      target: route.key,
    });
  };

  // Get icon name from route
  const getIconName = (routeName: string): string => {
    switch (routeName) {
      case 'Map':
        return 'map-outline';
      case 'List':
        return 'format-list-bulleted';
      case 'Submit':
        return 'plus';
      case 'Profile':
        return 'account-outline';
      case 'Admin':
        return 'shield-account';
      case 'LoginWall':
        return 'login';
      default:
        return 'circle';
    }
  };

  const iconName = getIconName(route.name);
  const activeColor = '#D62828';
  const inactiveColor = '#9CA3AF';
  const iconColor = isFocused ? activeColor : inactiveColor;
  const textColor = isFocused ? activeColor : inactiveColor;

  // Special handling for Submit button
  if (isSubmitButton) {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.submitButtonContainer}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.submitButton,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#EAF4F4', '#D62828']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitButtonGradient}
          >
            <MaterialCommunityIcons name={iconName} size={28} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  // Regular tab button
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.tabButtonContent,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
        <Text
          style={[
            styles.tabLabel,
            { color: textColor },
            fontsLoaded && { fontFamily: 'Nunito_500Medium' },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
  });
  const insets = useSafeAreaInsets();

  // Find the Submit button index
  const submitIndex = state.routes.findIndex((route) => route.name === 'Submit');

  // Render even if fonts aren't loaded yet - will use system fonts as fallback

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isSubmitButton = index === submitIndex && submitIndex !== -1;
          
          return (
            <TabButton
              key={route.key}
              route={route}
              index={index}
              state={state}
              descriptors={descriptors}
              navigation={navigation}
              isSubmitButton={isSubmitButton}
              fontsLoaded={fontsLoaded}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    minHeight: 70,
    position: 'relative',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  tabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  submitButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -35, // Raise the button above the tab bar to create notch effect
    marginHorizontal: 4,
    width: 64,
    height: 64,
  },
  submitButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D62828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

