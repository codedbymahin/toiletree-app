import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  className = '',
}) => {
  return (
    <View className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <Text className="text-red-800 font-medium mb-2">Error</Text>
      <Text className="text-red-600 mb-3">{message}</Text>
      {onRetry && (
        <Button
          title="Try Again"
          onPress={onRetry}
          variant="danger"
          className="mt-2"
        />
      )}
    </View>
  );
};

