import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { Input, Button } from '../components';
import { reportsService } from '../services/reports';

export const ReportIssueScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { toiletId, toiletName } = route.params as {
    toiletId: string;
    toiletName: string;
  };

  const [issueType, setIssueType] = useState<'closed' | 'dirty' | 'broken' | 'incorrect_location' | 'other'>('dirty');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const issueTypes = [
    { value: 'closed', label: 'Toilet is closed' },
    { value: 'dirty', label: 'Toilet is dirty' },
    { value: 'broken', label: 'Toilet is broken' },
    { value: 'incorrect_location', label: 'Incorrect location' },
    { value: 'other', label: 'Other issue' },
  ];

  const validate = () => {
    if (!description.trim()) {
      setError('Please describe the issue');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    const { success, error: submitError } = await reportsService.reportIssue(
      toiletId,
      issueType,
      description
    );
    setLoading(false);

    if (submitError) {
      Alert.alert('Error', submitError);
    } else {
      Alert.alert(
        'Report Submitted',
        'Thank you for reporting this issue. An admin will review it soon.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Report an Issue
        </Text>
        <Text className="text-gray-600 mb-6">
          Reporting issue for: <Text className="font-semibold">{toiletName}</Text>
        </Text>

        {/* Issue Type Picker */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Issue Type</Text>
          <View className="border border-gray-300 rounded-lg">
            <Picker
              selectedValue={issueType}
              onValueChange={(value) => setIssueType(value as any)}
            >
              {issueTypes.map((type) => (
                <Picker.Item
                  key={type.value}
                  label={type.label}
                  value={type.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Description */}
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Please describe the issue in detail..."
          multiline
          numberOfLines={6}
          error={error}
        />

        {/* Submit Button */}
        <Button
          title="Submit Report"
          onPress={handleSubmit}
          loading={loading}
          className="mt-4"
        />
      </View>
    </ScrollView>
  );
};

