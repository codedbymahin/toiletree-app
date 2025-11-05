import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export const AboutScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>About Toiletree</Text>

        <Text style={styles.heading}>The Hidden Thirst: A Daily Struggle</Text>
        
        <Text style={styles.paragraph}>
          In Bangladesh, countless girls and women face a hidden daily struggle: the lack of safe, clean, and accessible public toilets. This leads to a dangerous practice known as "The Hidden Thirst," where many deliberately avoid drinking water to avoid the need for a restroom, leading to serious long-term health problems like UTIs and kidney disease. This isn't just an inconvenience; it's a public health crisis that limits freedom and mobility.
        </Text>

        <Text style={styles.heading}>Our Solution: Toiletree</Text>

        <Text style={styles.paragraph}>
          Toiletree is a community-driven mobile app designed to empower girls and women by helping them find safe and verified public toilets across the country. With just a few taps, you can locate a nearby toilet, see its features like "Female Friendly" or "Water Available," check its rating, and read reviews from other users.
        </Text>

        <Text style={styles.heading}>Our Mission</Text>

        <Text style={styles.paragraph}>
          Our mission is to build a safer and more accessible Bangladesh for everyone. By providing reliable information and building a trusted community, we believe we can end "The Hidden Thirst" and ensure that no one has to choose between their health and their freedom. Join us in making a difference, one toilet at a time.
        </Text>

        <View style={styles.divider} />

        <Text style={styles.heading}>Acknowledgements</Text>

        <Text style={styles.paragraph}>
          Toiletree was developed as part of the PTIB Civic Tech Challenge 2025, with a mission to use technology for social good.
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
    marginBottom: 24,
  },
  heading: {
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
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
  },
});

