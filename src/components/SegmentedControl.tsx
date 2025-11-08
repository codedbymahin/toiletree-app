import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFonts, Nunito_500Medium } from '@expo-google-fonts/nunito';

interface SegmentedControlProps {
  options: Array<{ label: string; value: string; count?: number }>;
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedValue,
  onValueChange,
}) => {
  const [fontsLoaded] = useFonts({
    Nunito_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.segmentedControl}>
        {options.map((option, index) => {
          const isSelected = selectedValue === option.value;
          const isFirst = index === 0;
          const isLast = index === options.length - 1;

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.segment,
                isFirst && styles.segmentFirst,
                isLast && styles.segmentLast,
                isSelected && styles.segmentActive,
              ]}
              onPress={() => onValueChange(option.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentText,
                  isSelected && styles.segmentTextActive,
                  fontsLoaded && { fontFamily: 'Nunito_500Medium' },
                ]}
              >
                {option.label}
                {option.count !== undefined && ` (${option.count})`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segmentFirst: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  segmentLast: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#D62828',
    fontWeight: '600',
  },
});

