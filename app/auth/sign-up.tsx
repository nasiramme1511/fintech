import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import ScreenWrapper from '../../components/ScreenWrapper';
import GlassPane from '../../components/GlassPane';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const { signUp } = useAuth();

  const handleSignUp = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    setError('');
    setInfo('');

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Please enter a valid full name.');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(trimmedEmail, password, trimmedName);

      if (!result.success) {
        setError(result.error || 'An error occurred.');
        return;
      }

      if (result.needsEmailConfirmation) {
        setInfo(
          'Account created. Please check your inbox and verify your email before signing in.',
        );
        return;
      }

      // Email confirmation is disabled: the user is already signed in and the
      // auth layout will redirect to the app. No manual navigation needed.
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scroll={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <View className="mb-6 items-center">
          <LinearGradient
            colors={['#D34E4E', '#7f1d1d']}
            className="w-14 h-14 rounded-2xl items-center justify-center mb-2 shadow-lg shadow-primary/20"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialIcons name="person-add" size={28} color="white" />
          </LinearGradient>
          <Text className="text-white font-display text-2xl font-bold tracking-tight text-center">Create Account</Text>
        </View>

        <GlassPane className="w-full rounded-3xl p-6">
          <View className="flex flex-col gap-4">
            
            {/* Name */}
            <View className="flex flex-col gap-2">
              <Text className="text-white/80 text-sm font-medium font-display ml-1">Full Name</Text>
              <View className="relative">
                <View className="absolute inset-y-0 left-0 pl-4 justify-center pointer-events-none z-10">
                  <MaterialIcons name="person-outline" size={20} color="rgba(255,255,255,0.4)" />
                </View>
                <TextInput
                  className="bg-white/5 border border-white/10 text-white w-full rounded-xl py-3.5 pl-11 pr-4 text-sm focus:border-primary focus:bg-white/10"
                  placeholder="John Doe"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  accessibilityLabel="Full name"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Email */}
            <View className="flex flex-col gap-2">
              <Text className="text-white/80 text-sm font-medium font-display ml-1">Email Address</Text>
              <View className="relative">
                <View className="absolute inset-y-0 left-0 pl-4 justify-center pointer-events-none z-10">
                  <MaterialIcons name="mail-outline" size={20} color="rgba(255,255,255,0.4)" />
                </View>
                <TextInput
                  className="bg-white/5 border border-white/10 text-white w-full rounded-xl py-3.5 pl-11 pr-4 text-sm focus:border-primary focus:bg-white/10"
                  placeholder="name@example.com"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  accessibilityLabel="Email address"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password */}
            <View className="flex flex-col gap-2">
              <Text className="text-white/80 text-sm font-medium font-display ml-1">Password</Text>
              <View className="relative">
                <View className="absolute inset-y-0 left-0 pl-4 justify-center pointer-events-none z-10">
                  <MaterialIcons name="lock-outline" size={20} color="rgba(255,255,255,0.4)" />
                </View>
                <TextInput
                  className="bg-white/5 border border-white/10 text-white w-full rounded-xl py-3.5 pl-11 pr-11 text-sm focus:border-primary focus:bg-white/10"
                  placeholder="Create a password"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  textContentType="newPassword"
                  accessibilityLabel="Password"
                  editable={!loading}
                />
                <TouchableOpacity 
                  className="absolute inset-y-0 right-0 pr-4 justify-center"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View className="flex flex-col gap-2">
              <Text className="text-white/80 text-sm font-medium font-display ml-1">Confirm Password</Text>
              <View className="relative">
                <View className="absolute inset-y-0 left-0 pl-4 justify-center pointer-events-none z-10">
                  <MaterialIcons name="lock-outline" size={20} color="rgba(255,255,255,0.4)" />
                </View>
                <TextInput
                  className="bg-white/5 border border-white/10 text-white w-full rounded-xl py-3.5 pl-11 pr-11 text-sm focus:border-primary focus:bg-white/10"
                  placeholder="Confirm password"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                  accessibilityLabel="Confirm password"
                  editable={!loading}
                />
                <TouchableOpacity 
                  className="absolute inset-y-0 right-0 pr-4 justify-center"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <MaterialIcons name={showConfirmPassword ? "visibility" : "visibility-off"} size={20} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Success / Info Message */}
            {info ? (
              <TouchableOpacity
                className="flex-row items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-4 py-3"
                onPress={() => router.replace('/auth/login')}
                accessibilityRole="button"
                accessibilityLabel="Go to login after confirming your email"
              >
                <MaterialIcons name="mark-email-read" size={18} color="#34d399" />
                <Text className="text-emerald-300 text-sm font-body flex-1">{info}</Text>
                <Text className="text-emerald-300 text-sm font-bold font-body">Log In</Text>
              </TouchableOpacity>
            ) : null}

            {/* Error Message */}
            {error ? (
              <View className="flex-row items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3">
                <MaterialIcons name="error-outline" size={18} color="#f87171" />
                <Text className="text-red-300 text-sm font-body flex-1">{error}</Text>
              </View>
            ) : null}

            {/* Sign Up Button */}
            <TouchableOpacity 
              className={`w-full bg-primary py-4 rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] items-center mt-2 ${loading ? 'opacity-70' : ''}`}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-display font-bold text-base">Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View className="mt-4 flex-row justify-center">
              <Text className="text-white/60 text-sm font-body">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text className="text-primary font-bold ml-1">Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlassPane>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default SignUpPage;