import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MapScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺️ Map View</Text>
      <Text style={styles.message}>
        Maps are not available on web.
      </Text>
      <Text style={styles.info}>
        Please use the Android or iOS app to view the interactive map with toilet locations.
      </Text>
      <Text style={styles.tip}>
        💡 Tip: You can still test other features like Submit, Profile, and Admin on web!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  tip: {
    fontSize: 14,
    color: '#2563EB',
    textAlign: 'center',
    marginTop: 20,
  },
});

