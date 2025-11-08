import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Nunito_400Regular, Nunito_500Medium } from '@expo-google-fonts/nunito';

interface ConfirmationModalProps {
  isVisible: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonColor?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isVisible,
  title,
  description,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmButtonColor = '#D62828',
}) => {
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.card}>
                {/* Title */}
                <Text style={styles.title}>{title}</Text>

                {/* Description */}
                <Text style={styles.description}>{description}</Text>

                {/* Buttons Container */}
                <View style={styles.buttonsContainer}>
                  {/* Cancel Button */}
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onCancel}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                  </TouchableOpacity>

                  {/* Confirm Button */}
                  <TouchableOpacity
                    style={[styles.confirmButton, { backgroundColor: confirmButtonColor }]}
                    onPress={() => {
                      onConfirm();
                      // Parent should close modal after handling the confirmation
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.confirmButtonText}>{confirmText}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    fontFamily: 'Poppins_700Bold',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'Nunito_400Regular',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Nunito_500Medium',
  },
  confirmButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D62828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginLeft: 6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Nunito_500Medium',
  },
});

