import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  className = '',
  style,
}) => {
  const baseClasses = 'py-3 px-6 rounded-lg items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    danger: 'bg-red-600',
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${
        isDisabled ? 'opacity-50' : ''
      } ${className}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-white font-semibold text-base">{title}</Text>
      )}
    </TouchableOpacity>
  );
};

