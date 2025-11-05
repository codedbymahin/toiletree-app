import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

/**
 * Simple redirect screen that immediately redirects guests to authentication
 * Uses reset action to prevent navigation loops
 */
export const RedirectToAuthScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Get the root navigation object by traversing up the navigation tree
    let rootNavigation = navigation;
    let parent = navigation.getParent();
    
    // Keep traversing up until we find the root navigator
    while (parent) {
      rootNavigation = parent;
      parent = parent.getParent();
    }

    // Reset navigation state to Auth screen to prevent navigation loops
    rootNavigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Auth',
            params: {
              screen: 'Login',
            },
          },
        ],
      })
    );
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.text}>Redirecting to login...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});

