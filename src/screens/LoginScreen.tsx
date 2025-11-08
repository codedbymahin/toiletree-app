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
import { Button, Input } from '../components';
import { authService } from '../services/auth';
import { showErrorToast } from '../utils/toast';

interface LoginScreenProps {
  navigation: any;
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  navigation,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  
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
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const { user, error } = await authService.signIn(email, password);
      
      if (error) {
        showErrorToast('Login Failed', error);
      } else if (user) {
        onLoginSuccess();
      }
    } finally {
      setLoading(false);
    }
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
                <Text style={styles.title}>Welcome back! Let's find a clean spot.</Text>
              </View>

              {/* Login Form */}
              <View style={styles.form}>
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
                  placeholder="Enter your password"
                  autoCapitalize="none"
                  error={errors.password}
                  leftIcon="lock-outline"
                  secureTextEntry
                  showPasswordToggle
                />
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                />
              </View>

              {/* Sign Up Link */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                  <Text style={styles.footerLink}>Sign Up</Text>
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
    paddingVertical: 40,
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
    marginBottom: 36,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 28,
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
    marginBottom: 28,
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

