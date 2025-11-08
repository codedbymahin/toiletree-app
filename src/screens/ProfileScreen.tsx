import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Nunito_400Regular, Nunito_500Medium } from '@expo-google-fonts/nunito';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, ConfirmationModal } from '../components';
import { RootStackParamList } from '../navigation/types';

type ProfileNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<ProfileNavigationProp>();
  const [isSignOutModalVisible, setSignOutModalVisible] = useState(false);
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
  });

  const handleSignOut = async () => {
    setSignOutModalVisible(false);
    await signOut();
  };

  const navigateToAdmin = () => {
    navigation.navigate('Admin' as never);
  };

  const navigateToSettings = () => {
    (navigation as any).navigate('Settings');
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#EAF4F4', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          {/* Settings Button */}
          <TouchableOpacity
            onPress={navigateToSettings}
            style={styles.settingsButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="cog-outline" size={24} color="#1F2937" />
          </TouchableOpacity>

          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            <Text style={styles.username}>
              {user?.username}
            </Text>
            {user?.is_admin && (
              <View style={styles.adminTag}>
                <Text style={styles.adminTagText}>ADMIN</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Activity</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>-</Text>
              <Text style={styles.statLabel}>Submissions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>-</Text>
              <Text style={styles.statLabel}>Ratings</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>-</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* Admin Access */}
        {user?.is_admin && (
          <View style={styles.buttonContainer}>
            <Button
              title="Go to Admin Dashboard"
              onPress={navigateToAdmin}
            />
          </View>
        )}

        {/* Sign Out Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Sign Out"
            onPress={() => setSignOutModalVisible(true)}
          />
        </View>
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
        isVisible={isSignOutModalVisible}
        title="Sign Out"
        description="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={handleSignOut}
        onCancel={() => setSignOutModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  gradientHeader: {
    paddingBottom: 24,
  },
  safeArea: {
    position: 'relative',
  },
  settingsButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#EAF4F4',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  username: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Poppins_700Bold',
  },
  adminTag: {
    backgroundColor: '#FDE8E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D62828',
  },
  adminTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D62828',
    fontFamily: 'Nunito_500Medium',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'Poppins_700Bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#D62828',
    marginBottom: 8,
    fontFamily: 'Poppins_700Bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Nunito_400Regular',
  },
  buttonContainer: {
    marginBottom: 16,
  },
});
