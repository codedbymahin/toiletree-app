import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export const TeamScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Meet the Team</Text>

        <Text style={styles.paragraph}>
          Toiletree was developed as part of the <Text style={styles.bold}>PTIB Civic Tech Challenge 2025</Text>, an initiative by UNDP Bangladesh's "Partnerships for a Tolerant, Inclusive Bangladesh (PTIB)" project.
        </Text>

        <Text style={styles.paragraph}>
          The project was brought to life through the vision and leadership of <Text style={styles.bold}>Md Sifat Al Mahin</Text>, who served as the Founder and Team Lead. From initial ideation and UX design to the complete development of the mobile application, Mahin architected and built the core platform.
        </Text>

        <Text style={styles.paragraph}>
          The team also included <Text style={styles.bold}>Shila Khatun</Text> (CSE Student, Green University), who contributed to the development process and provided valuable support throughout the project's lifecycle.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Hasib Ashfaq Saad</Text> was another key member of the team, contributing to the collaborative effort that shaped the project.
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

