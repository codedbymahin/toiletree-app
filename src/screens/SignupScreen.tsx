import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Nunito_400Regular, Nunito_500Medium } from '@expo-google-fonts/nunito';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Input } from '../components';
import { authService } from '../services/auth';
import { showSuccessToast, showErrorToast } from '../utils/toast';

interface SignupScreenProps {
  navigation: any;
  onSignupSuccess: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({
  navigation,
  onSignupSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
  });

  // Logo animation using react-native-reanimated
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, {
      damping: 7,
      stiffness: 50,
    });
    logoOpacity.value = withTiming(1, {
      duration: 600,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
      opacity: logoOpacity.value,
    };
  });

  // Show loading state while fonts are loading
  if (!fontsLoaded) {
    return null;
  }

  const validate = () => {
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
      isValid = false;
    } else if (fullName.length < 2) {
      newErrors.fullName = 'Full Name must be at least 2 characters';
      isValid = false;
    }

    // Password validation - check length
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Confirm password validation - check if passwords match
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!agreedToTerms) {
      showErrorToast('Terms Required', 'Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    // Validate before submitting
    if (!validate()) return;

    setLoading(true);
    try {
      const { user, error } = await authService.signUp(email, password, fullName);
      
      if (error) {
        showErrorToast('Signup Failed', error);
      } else if (user) {
        showSuccessToast('Success', 'Account created successfully. Please log in.');
        // Wait a moment for the toast to show, then trigger callback
        setTimeout(() => {
          onSignupSuccess();
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToTerms = () => {
    navigation.navigate('Terms');
  };

  const handleNavigateToPrivacy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#EAF4F4', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Premium Card Container */}
            <View style={styles.cardContainer}>
              {/* Header Area */}
              <View style={styles.header}>
                <Animated.View style={logoAnimatedStyle}>
                  <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </Animated.View>
                <Text style={styles.title}>Create your account</Text>
              </View>

              {/* Signup Form */}
              <View style={styles.form}>
                <Input
                  label="Full Name"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    // Clear error when user starts typing
                    if (errors.fullName) {
                      setErrors({ ...errors, fullName: '' });
                    }
                  }}
                  placeholder="John Doe"
                  autoCapitalize="words"
                  error={errors.fullName}
                  leftIcon="account-outline"
                />

                <Input
                  label="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    // Clear error when user starts typing
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  placeholder="your@email.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  error={errors.email}
                  leftIcon="email-outline"
                />

                <Input
                  label="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    // Clear password error when user starts typing
                    if (errors.password) {
                      setErrors({ ...errors, password: '' });
                    }
                    // Check password length in real-time
                    if (text.length > 0 && text.length < 6) {
                      setErrors({ ...errors, password: 'Password must be at least 6 characters' });
                    }
                    // Clear confirm password error if passwords now match
                    if (confirmPassword && text === confirmPassword && errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: '' });
                    }
                    // Set confirm password error if passwords don't match
                    if (confirmPassword && text !== confirmPassword) {
                      setErrors({ ...errors, confirmPassword: 'Passwords do not match' });
                    }
                  }}
                  placeholder="At least 6 characters"
                  autoCapitalize="none"
                  error={errors.password}
                  leftIcon="lock-outline"
                  secureTextEntry
                  showPasswordToggle
                />

                <Input
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    // Clear error when user starts typing
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: '' });
                    }
                    // Check if passwords match in real-time
                    if (password && text !== password) {
                      setErrors({ ...errors, confirmPassword: 'Passwords do not match' });
                    }
                  }}
                  placeholder="Confirm your password"
                  autoCapitalize="none"
                  error={errors.confirmPassword}
                  leftIcon="lock-outline"
                  secureTextEntry
                  showPasswordToggle
                />
              </View>

              {/* Terms Agreement */}
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                  style={styles.checkboxContainer}
                  activeOpacity={0.7}
                >
                <MaterialCommunityIcons
                  name={agreedToTerms ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={24}
                  color={agreedToTerms ? '#D62828' : '#9CA3AF'}
                />
                </TouchableOpacity>
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>I agree to the </Text>
                  <TouchableOpacity onPress={handleNavigateToTerms} activeOpacity={0.7}>
                    <Text style={styles.termsLink}>Terms of Service</Text>
                  </TouchableOpacity>
                  <Text style={styles.termsText}> and </Text>
                  <TouchableOpacity onPress={handleNavigateToPrivacy} activeOpacity={0.7}>
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </TouchableOpacity>
                  <Text style={styles.termsText}>.</Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Create Account"
                  onPress={handleSignup}
                  loading={loading}
                  disabled={!agreedToTerms || loading}
                />
              </View>

              {/* Login Link */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={styles.footerLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    minHeight: '100%',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 36,
    fontFamily: 'Poppins_700Bold',
  },
  form: {
    marginBottom: 24,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  termsText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    fontFamily: 'Nunito_400Regular',
  },
  termsLink: {
    color: '#D62828',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Nunito_500Medium',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'Nunito_400Regular',
  },
  footerLink: {
    color: '#D62828',
    fontWeight: '600',
    fontSize: 15,
    fontFamily: 'Nunito_500Medium',
  },
});

