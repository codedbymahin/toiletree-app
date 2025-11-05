import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { Navigation } from './src/navigation';
import './global.css';

LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Navigation />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
