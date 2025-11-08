import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { authService } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { ConfirmationModal } from '../components';

type SettingsNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

export const SettingsScreen = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const { signOut } = useAuth();
  const [isDeleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleteAccountModalVisible(false);
    const { success, error } = await authService.requestAccountDeletion();
    
    if (error) {
      showErrorToast('Error', error);
    } else {
      showSuccessToast('Deletion Request Submitted', 'Your deletion request has been submitted.');
      // Wait a moment for toast, then sign out
      setTimeout(async () => {
        await signOut();
      }, 2000);
    }
  };

  const handleSendFeedback = async () => {
    const mailtoUrl = 'mailto:itsmemahin.bd@outlook.com?subject=Toiletree App Feedback';
    
    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        showErrorToast(
          'Error',
          'Unable to open email client. Please send feedback to itsmemahin.bd@outlook.com'
        );
      }
    } catch (error) {
      showErrorToast(
        'Error',
        'Unable to open email client. Please send feedback to itsmemahin.bd@outlook.com'
      );
    }
  };

  const settingsOptions = [
    {
      id: 'about',
      title: 'About Toiletree',
      iconName: 'information-outline' as const,
      screen: 'About' as keyof RootStackParamList,
    },
    {
      id: 'team',
      title: 'Meet the Team',
      iconName: 'account-group-outline' as const,
      screen: 'Team' as keyof RootStackParamList,
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      iconName: 'shield-lock-outline' as const,
      screen: 'PrivacyPolicy' as keyof RootStackParamList,
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      iconName: 'file-document-outline' as const,
      screen: 'Terms' as keyof RootStackParamList,
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      iconName: 'message-alert-outline' as const,
      screen: null as any,
      onPress: handleSendFeedback,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Settings</Text>

        {settingsOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionItem}
            onPress={() => {
              if (option.onPress) {
                option.onPress();
              } else if (option.screen) {
                navigation.navigate(option.screen);
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <MaterialCommunityIcons name={option.iconName} size={24} color="#1F2937" style={{ marginRight: 12 }} />
              <Text style={styles.optionText}>{option.title}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Delete Account Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setDeleteAccountModalVisible(true)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="delete-forever-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        isVisible={isDeleteAccountModalVisible}
        title="Delete Account"
        description="Are you sure you want to request account deletion? Your account and data will be permanently deleted within 24 hours."
        confirmText="Delete Account"
        cancelText="Cancel"
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteAccountModalVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
  },
  optionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  chevron: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

