import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export const TermsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Terms of Service for Toiletree</Text>

        <Text style={styles.lastUpdated}>Last Updated: November 4, 2025</Text>

        <Text style={styles.paragraph}>
          Welcome to Toiletree! By using our app, you agree to these terms.
        </Text>

        <Text style={styles.sectionTitle}>1. Using Our App</Text>

        <Text style={styles.paragraph}>
          You agree to use Toiletree for its intended purpose: to find and share information about public toilets to help the community. You agree not to misuse the service, submit false information, or post offensive, abusive, or inappropriate content.
        </Text>

        <Text style={styles.sectionTitle}>2. User-Generated Content</Text>

        <Text style={styles.paragraph}>
          You are responsible for the content you submit, including the accuracy of toilet locations, photos, and reviews. By submitting content, you grant Toiletree a license to display it to other users. We reserve the right to remove any content that violates our guidelines without notice.
        </Text>

        <Text style={styles.sectionTitle}>3. Account Responsibility</Text>

        <Text style={styles.paragraph}>
          You are responsible for keeping your account password confidential. You are responsible for all activities that occur under your account.
        </Text>

        <Text style={styles.sectionTitle}>4. Disclaimers</Text>

        <Text style={styles.paragraph}>
          Toiletree is a community-driven platform. While we encourage accurate submissions, we cannot guarantee the safety, cleanliness, or existence of any toilet listed in the app. The information is provided "as is" without warranty of any kind. Always use your own judgment and be aware of your surroundings.
        </Text>

        <Text style={styles.sectionTitle}>5. Termination</Text>

        <Text style={styles.paragraph}>
          We may terminate or suspend your access to the app at any time, without prior notice, for any reason, including a breach of these Terms.
        </Text>

        <Text style={styles.sectionTitle}>6. Copyright</Text>

        <Text style={styles.paragraph}>
          This project is licensed under the MIT License.
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>

        <Text style={styles.paragraph}>
          If you have any questions about these Terms, please contact us at itsmemahin.bd@outlook.com.
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
});

