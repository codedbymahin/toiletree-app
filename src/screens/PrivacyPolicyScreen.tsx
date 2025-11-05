import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export const PrivacyPolicyScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Privacy Policy for Toiletree</Text>

        <Text style={styles.lastUpdated}>Last Updated: November 4, 2025</Text>

        <Text style={styles.paragraph}>
          Your privacy is important to us. This Privacy Policy explains what information Toiletree collects and how we use it.
        </Text>

        <Text style={styles.sectionTitle}>Information We Collect</Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Account Information:</Text> When you create an account, we collect your username, email address, and password. Your password is encrypted and we cannot see it.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>User-Generated Content:</Text> We collect the information you voluntarily provide, such as toilet submissions (location, photos, features), ratings, and reviews.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Location Data:</Text> We use your location to center the map and to pre-fill coordinates when you submit a new toilet. We do not track your location in the background.
        </Text>

        <Text style={styles.sectionTitle}>How We Use Your Information</Text>

        <Text style={styles.paragraph}>
          • To operate and maintain the Toiletree app.{'\n'}
          • To display your username with your submissions and reviews to the community.{'\n'}
          • To allow you to log in to your account.{'\n'}
          • To improve the app and understand how it is used.
        </Text>

        <Text style={styles.sectionTitle}>Information Sharing</Text>

        <Text style={styles.paragraph}>
          We do not sell, trade, or rent your personal identification information to others. All user-generated content, such as toilet locations, reviews, and ratings, is shared publicly within the app to help the community.
        </Text>

        <Text style={styles.sectionTitle}>Data Security</Text>

        <Text style={styles.paragraph}>
          We use industry-standard security measures, provided by our backend service Supabase, to protect your information.
        </Text>

        <Text style={styles.sectionTitle}>Your Right to Delete</Text>

        <Text style={styles.paragraph}>
          You can request the deletion of your account and all associated data at any time through the "Delete Account" feature in the app's settings.
        </Text>

        <Text style={styles.sectionTitle}>Changes to This Policy</Text>

        <Text style={styles.paragraph}>
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>

        <Text style={styles.paragraph}>
          If you have any questions about this Privacy Policy, please contact us at itsmemahin.bd@outlook.com.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2B2D42',
    marginBottom: 12,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2B2D42',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    marginBottom: 16,
  },
  bold: {
    fontWeight: '600',
    color: '#2B2D42',
  },
});

