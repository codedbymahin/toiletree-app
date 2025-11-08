import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/context/AuthContext';
import { Navigation } from './src/navigation';
import { initializeMapbox } from './src/utils/mapbox';
import { toastConfig } from './src/utils/toastConfig';
import './global.css';

LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

// Initialize Mapbox before app renders
initializeMapbox();

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Navigation />
        <StatusBar style="auto" />
        <Toast config={toastConfig} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
