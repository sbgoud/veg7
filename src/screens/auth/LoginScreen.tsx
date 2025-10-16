import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../services/auth/AuthContext';
import { RootStackParamList } from '../../navigation/AppNavigator';

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation?: AuthScreenNavigationProp;
}

const AuthScreen: React.FC<Props> = ({ navigation: propNavigation }) => {
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // UI state
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{[key: string]: string}>({});
  const [signupErrors, setSignupErrors] = useState<{[key: string]: string}>({});

  const { signIn, signUp } = useAuth();

  // Use prop navigation if provided, otherwise use hook navigation
  const navigation = propNavigation || useNavigation<AuthScreenNavigationProp>();

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation for login
  const validateLoginForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!loginEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(loginEmail.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!loginPassword) {
      errors.password = 'Password is required';
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form validation for signup
  const validateSignupForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!signupFullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (signupFullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }

    if (!signupEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(signupEmail.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (signupPhone && signupPhone.trim() && !/^[\+]?[0-9\-\(\)\s]{10,15}$/.test(signupPhone.trim().replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!signupPassword) {
      errors.password = 'Password is required';
    } else if (signupPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(signupPassword)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!signupConfirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (signupPassword !== signupConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const { user, error } = await signIn({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      });

      if (error) {
        Alert.alert('Login Failed', error);
      } else {
        // Navigation will be handled automatically by AuthContext
        console.log('Login successful');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!validateSignupForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const { user, error } = await signUp({
        full_name: signupFullName.trim(),
        email: signupEmail.trim().toLowerCase(),
        phone: signupPhone.trim(),
        password: signupPassword,
      });

      if (error) {
        Alert.alert('Signup Failed', error);
      } else {
        Alert.alert(
          'Success',
          'Account created successfully! You can now sign in.',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsLoginMode(true);
                // Clear signup form
                setSignupFullName('');
                setSignupEmail('');
                setSignupPhone('');
                setSignupPassword('');
                setSignupConfirmPassword('');
                setSignupErrors({});
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    // Clear errors when switching modes
    setLoginErrors({});
    setSignupErrors({});
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.title}>veg7</Text>
            <Text style={styles.subtitle}>Fresh Vegetables Delivered</Text>

            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeButton, isLoginMode && styles.modeButtonActive]}
                onPress={() => setIsLoginMode(true)}
              >
                <Text style={[styles.modeButtonText, isLoginMode && styles.modeButtonTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, !isLoginMode && styles.modeButtonActive]}
                onPress={() => setIsLoginMode(false)}
              >
                <Text style={[styles.modeButtonText, !isLoginMode && styles.modeButtonTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Form */}
            {isLoginMode && (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, loginErrors.email && styles.inputError]}
                    placeholder="Email"
                    value={loginEmail}
                    onChangeText={(text) => {
                      setLoginEmail(text);
                      if (loginErrors.email) setLoginErrors(prev => ({ ...prev, email: '' }));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#999"
                  />
                  {loginErrors.email && <Text style={styles.errorText}>{loginErrors.email}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, loginErrors.password && styles.inputError]}
                    placeholder="Password"
                    value={loginPassword}
                    onChangeText={(text) => {
                      setLoginPassword(text);
                      if (loginErrors.password) setLoginErrors(prev => ({ ...prev, password: '' }));
                    }}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#999"
                  />
                  {loginErrors.password && <Text style={styles.errorText}>{loginErrors.password}</Text>}
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Signup Form */}
            {!isLoginMode && (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, signupErrors.fullName && styles.inputError]}
                    placeholder="Full Name"
                    value={signupFullName}
                    onChangeText={(text) => {
                      setSignupFullName(text);
                      if (signupErrors.fullName) setSignupErrors(prev => ({ ...prev, fullName: '' }));
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                    placeholderTextColor="#999"
                  />
                  {signupErrors.fullName && <Text style={styles.errorText}>{signupErrors.fullName}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, signupErrors.email && styles.inputError]}
                    placeholder="Email"
                    value={signupEmail}
                    onChangeText={(text) => {
                      setSignupEmail(text);
                      if (signupErrors.email) setSignupErrors(prev => ({ ...prev, email: '' }));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#999"
                  />
                  {signupErrors.email && <Text style={styles.errorText}>{signupErrors.email}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, signupErrors.phone && styles.inputError]}
                    placeholder="Phone (Optional)"
                    value={signupPhone}
                    onChangeText={(text) => {
                      setSignupPhone(text);
                      if (signupErrors.phone) setSignupErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    keyboardType="phone-pad"
                    placeholderTextColor="#999"
                  />
                  {signupErrors.phone && <Text style={styles.errorText}>{signupErrors.phone}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, signupErrors.password && styles.inputError]}
                    placeholder="Password"
                    value={signupPassword}
                    onChangeText={(text) => {
                      setSignupPassword(text);
                      if (signupErrors.password) setSignupErrors(prev => ({ ...prev, password: '' }));
                    }}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#999"
                  />
                  {signupErrors.password && <Text style={styles.errorText}>{signupErrors.password}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, signupErrors.confirmPassword && styles.inputError]}
                    placeholder="Confirm Password"
                    value={signupConfirmPassword}
                    onChangeText={(text) => {
                      setSignupConfirmPassword(text);
                      if (signupErrors.confirmPassword) setSignupErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#999"
                  />
                  {signupErrors.confirmPassword && <Text style={styles.errorText}>{signupErrors.confirmPassword}</Text>}
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleSignup}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  content: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 30,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    opacity: 0.6,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AuthScreen;