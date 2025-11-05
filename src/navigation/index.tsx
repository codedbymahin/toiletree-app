import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { MapScreen } from '../screens/MapScreen';
import { SubmitToiletScreen } from '../screens/SubmitToiletScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ToiletDetailsScreen } from '../screens/ToiletDetailsScreen';
import { ReportIssueScreen } from '../screens/ReportIssueScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import {
  AuthStackParamList,
  MainTabParamList,
  RootStackParamList,
  SubmitStackParamList,
} from './types';
import { SelectLocationScreen } from '../screens/SelectLocationScreen';
import { ToiletListScreen } from '../screens/ToiletListScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { LoginWallScreen } from '../screens/LoginWallScreen';
import { RedirectToAuthScreen } from '../screens/RedirectToAuthScreen';
import { GuestTabParamList } from './types';

const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const GuestTab = createBottomTabNavigator<GuestTabParamList>();
const RootStack = createStackNavigator<RootStackParamList>();
const SubmitStack = createStackNavigator<SubmitStackParamList>();

// Auth Stack Navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login">
        {(props) => (
          <LoginScreen
            {...props}
            onLoginSuccess={async () => {
              // Navigation will be handled by auth state change
            }}
          />
        )}
      </AuthStack.Screen>
      <AuthStack.Screen name="Signup">
        {(props) => (
          <SignupScreen
            {...props}
            onSignupSuccess={async () => {
              props.navigation.goBack();
            }}
          />
        )}
      </AuthStack.Screen>
      <AuthStack.Screen
        name="Terms"
        component={TermsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Terms of Service',
        }}
      />
      <AuthStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          headerShown: true,
          headerTitle: 'Privacy Policy',
        }}
      />
    </AuthStack.Navigator>
  );
};

const SubmitNavigator = () => {
  return (
    <SubmitStack.Navigator>
      <SubmitStack.Screen
        name="SelectLocation"
        component={SelectLocationScreen}
        options={{ title: 'Choose Location' }}
      />
      <SubmitStack.Screen
        name="SubmitForm"
        component={SubmitToiletScreen}
        options={{ title: 'Submit a Toilet' }}
      />
    </SubmitStack.Navigator>
  );
};

// Guest Tab Navigator (for unauthenticated users)
const GuestTabNavigator = () => {
  return (
    <GuestTab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <GuestTab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="map" size={24} color={color} />,
          headerTitle: 'Toiletree',
        }}
      />
      <GuestTab.Screen
        name="List"
        component={ToiletListScreen}
        options={{
          tabBarLabel: 'List',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="format-list-bulleted" size={24} color={color} />,
          headerTitle: 'Toilets Nearby',
        }}
      />
      <GuestTab.Screen
        name="LoginWall"
        component={RedirectToAuthScreen}
        options={{
          tabBarLabel: 'Login',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="login" size={24} color={color} />,
          headerTitle: 'Login Required',
        }}
      />
    </GuestTab.Navigator>
  );
};

// Main Tab Navigator (for authenticated users)
const MainTabNavigator = () => {
  const { user } = useAuth();

  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <MainTab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="map" size={24} color={color} />,
          headerTitle: 'Toiletree',
        }}
      />
      <MainTab.Screen
        name="Submit"
        component={SubmitNavigator}
        options={{
          tabBarLabel: 'Submit',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="plus-circle" size={24} color={color} />,
          headerShown: false,
        }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" size={24} color={color} />,
          headerTitle: 'My Profile',
        }}
      />
      {user?.is_admin && (
        <MainTab.Screen
          name="Admin"
          component={AdminDashboardScreen}
          options={{
            tabBarLabel: 'Admin',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="shield-account" size={24} color={color} />,
            headerTitle: 'Admin Dashboard',
          }}
        />
      )}
    </MainTab.Navigator>
  );
};

// Guest Navigator (for unauthenticated users)
const GuestNavigator = () => {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen name="GuestTabs" component={GuestTabNavigator} />
      <RootStack.Screen
        name="ToiletDetails"
        component={ToiletDetailsScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Toilet Details',
        }}
      />
      <RootStack.Screen
        name="ToiletList"
        component={ToiletListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Toilets Nearby',
        }}
      />
      <RootStack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerShown: true,
          headerTitle: 'About Toiletree',
        }}
      />
      <RootStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          headerShown: true,
          headerTitle: 'Privacy Policy',
        }}
      />
      <RootStack.Screen
        name="Terms"
        component={TermsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Terms of Service',
        }}
      />
      <RootStack.Screen
        name="Auth"
        component={AuthNavigator}
        options={{
          headerShown: false,
        }}
      />
    </RootStack.Navigator>
  );
};

// Root Stack with Modals (for authenticated users)
const RootNavigator = () => {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
      <RootStack.Screen
        name="ToiletDetails"
        component={ToiletDetailsScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Toilet Details',
        }}
      />
      <RootStack.Screen
        name="ReportIssue"
        component={ReportIssueScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Report Issue',
        }}
      />
      <RootStack.Screen
        name="ToiletList"
        component={ToiletListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Toilets Nearby',
        }}
      />
      <RootStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Settings',
        }}
      />
      <RootStack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerShown: true,
          headerTitle: 'About Toiletree',
        }}
      />
      <RootStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          headerShown: true,
          headerTitle: 'Privacy Policy',
        }}
      />
      <RootStack.Screen
        name="Terms"
        component={TermsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Terms of Service',
        }}
      />
    </RootStack.Navigator>
  );
};

// Main Navigation Component
export const Navigation = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <NavigationContainer>
      {user ? <RootNavigator /> : <GuestNavigator />}
    </NavigationContainer>
  );
};

