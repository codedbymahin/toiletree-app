import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ToastProps {
  text1?: string;
  text2?: string;
}

const SuccessToast: React.FC<ToastProps> = ({ text1, text2 }) => {
  return (
    <View style={styles.successContainer}>
      <View style={styles.successIndicator} />
      <View style={styles.successContent}>
        {text1 && (
          <Text style={styles.successText1}>
            {text1}
          </Text>
        )}
        {text2 && (
          <Text style={styles.successText2}>
            {text2}
          </Text>
        )}
      </View>
    </View>
  );
};

const ErrorToast: React.FC<ToastProps> = ({ text1, text2 }) => {
  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorIndicator} />
      <View style={styles.errorContent}>
        {text1 && (
          <Text style={styles.errorText1}>
            {text1}
          </Text>
        )}
        {text2 && (
          <Text style={styles.errorText2}>
            {text2}
          </Text>
        )}
      </View>
    </View>
  );
};

export const toastConfig = {
  success: SuccessToast,
  error: ErrorToast,
};

const styles = StyleSheet.create({
  successContainer: {
    flexDirection: 'row',
    minHeight: 60,
    width: '90%',
    backgroundColor: '#EAF4F4',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  successIndicator: {
    width: 5,
    backgroundColor: '#2ECC71',
  },
  successContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  successText1: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  successText2: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flexDirection: 'row',
    minHeight: 60,
    width: '90%',
    backgroundColor: '#FDE8E8',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  errorIndicator: {
    width: 5,
    backgroundColor: '#D62828',
  },
  errorContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  errorText1: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  errorText2: {
    fontSize: 14,
    color: '#6B7280',
  },
});
