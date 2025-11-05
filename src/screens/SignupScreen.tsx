import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Input } from '../components';
import { authService } from '../services/auth';

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
  const [username, setUsername] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });

  const validate = () => {
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
    };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

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
      Alert.alert('Terms Required', 'Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    if (!validate()) return;

    setLoading(true);
    const { user, error } = await authService.signUp(email, password, username);
    setLoading(false);

    if (error) {
      Alert.alert('Signup Failed', error);
    } else if (user) {
      Alert.alert(
        'Success',
        'Account created successfully. Please log in.',
        [{ text: 'OK', onPress: onSignupSuccess }]
      );
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
        colors={['#F8F9FA', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header Area */}
            <View style={styles.header}>
              <Image
                source={require('../../assets/logo.png.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Join the Community</Text>
            </View>

            {/* Signup Form */}
            <View style={styles.form}>
              <Input
                label="Username"
                value={username}
                onChangeText={setUsername}
                placeholder="johndoe"
                autoCapitalize="none"
                error={errors.username}
                leftIcon="account-outline"
              />

              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
                error={errors.email}
                leftIcon="email-outline"
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
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
                onChangeText={setConfirmPassword}
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
                  color={agreedToTerms ? '#D90429' : '#9CA3AF'}
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

            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              disabled={!agreedToTerms}
              className="mb-4"
              style={{ backgroundColor: '#D90429' }}
            />

            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2B2D42',
  },
  form: {
    marginBottom: 24,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
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
    color: '#2B2D42',
    fontSize: 14,
  },
  termsLink: {
    color: '#D90429',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#2B2D42',
    fontSize: 15,
  },
  footerLink: {
    color: '#D90429',
    fontWeight: '600',
    fontSize: 15,
  },
});

