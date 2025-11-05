import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

export const LoginWallScreen = () => {
  const { redirectToAuth } = useAuthRedirect();

  useEffect(() => {
    // Immediately redirect to login
    redirectToAuth();
  }, [redirectToAuth]);

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

