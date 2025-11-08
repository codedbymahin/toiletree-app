import React, { useState } from 'react';
import { TextInput, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useFonts, Nunito_400Regular, Nunito_500Medium } from '@expo-google-fonts/nunito';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  className?: string;
  leftIcon?: string;
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  error,
  className = '',
  leftIcon,
  showPasswordToggle = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const actualSecureTextEntry = showPasswordToggle ? !showPassword : secureTextEntry;

  // Load fonts
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View className={`mb-5 ${className}`}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon as any}
            size={20}
            color={isFocused ? '#D62828' : '#9CA3AF'}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={actualSecureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.textInput,
            leftIcon && styles.textInputWithIcon,
            showPasswordToggle && styles.textInputWithToggle,
            multiline && styles.textInputMultiline,
          ]}
          placeholderTextColor="#9CA3AF"
        />
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.toggleButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Nunito_500Medium',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputContainerFocused: {
    borderColor: '#D62828',
    borderWidth: 1,
    shadowColor: '#D62828',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainerError: {
    borderColor: '#D62828',
  },
  leftIcon: {
    marginLeft: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: 'Nunito_400Regular',
  },
  textInputWithIcon: {
    paddingLeft: 8,
  },
  textInputWithToggle: {
    paddingRight: 8,
  },
  textInputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  toggleButton: {
    padding: 8,
    marginRight: 8,
  },
  errorText: {
    color: '#D62828',
    fontSize: 13,
    marginTop: 6,
    fontFamily: 'Nunito_400Regular',
  },
});

