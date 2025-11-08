import Toast from 'react-native-toast-message';

/**
 * Show a success toast message
 */
export const showSuccessToast = (title: string, message?: string) => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    visibilityTime: 3000,
    position: 'top',
  });
};

/**
 * Show an error toast message
 */
export const showErrorToast = (title: string, message?: string) => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    visibilityTime: 4000,
    position: 'top',
  });
};

