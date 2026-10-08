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
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    setError('');

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(trimmedEmail, password);

      if (!result.success) {
        setError(result.error || 'An error occurred.');
      }
      // On success the auth layout detects the new session and redirects to the
      // app, so no manual navigation is required here (avoids double navigation).
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
        {/* Logo Area */}
        <View className="mb-8 items-center">
          <LinearGradient
            colors={['#D34E4E', '#7f1d1d']}
            className="w-16 h-16 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-primary/20"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialIcons name="account-balance-wallet" size={32} color="white" />
          </LinearGradient>
          <Text className="text-white font-display text-3xl font-bold tracking-tight text-center">Welcome Back</Text>
          <Text className="text-white/60 font-body text-base mt-2 text-center max-w-[280px]">
            Manage your expenses seamlessly and securely.
          </Text>
        </View>

        {/* Glass Form Card */}
        <GlassPane className="w-full rounded-3xl p-6 sm:p-8">
          <View className="flex flex-col gap-5">
            {/* Email Field */}
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

            {/* Password Field */}
            <View className="flex flex-col gap-2">
              <Text className="text-white/80 text-sm font-medium font-display ml-1">Password</Text>
              <View className="relative">
                <View className="absolute inset-y-0 left-0 pl-4 justify-center pointer-events-none z-10">
                  <MaterialIcons name="lock-outline" size={20} color="rgba(255,255,255,0.4)" />
                </View>
                <TextInput
                  className="bg-white/5 border border-white/10 text-white w-full rounded-xl py-3.5 pl-11 pr-11 text-sm focus:border-primary focus:bg-white/10"
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
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

            {/* Forgot Password */}
            <View className="flex-row justify-end">
              <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
                <Text className="text-primary text-sm font-medium">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {error ? (
              <View className="flex-row items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3">
                <MaterialIcons name="error-outline" size={18} color="#f87171" />
                <Text className="text-red-300 text-sm font-body flex-1">{error}</Text>
              </View>
            ) : null}

            {/* Login Button */}
            <TouchableOpacity 
              className={`w-full bg-primary py-4 rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] items-center mt-2 ${loading ? 'opacity-70' : ''}`}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-display font-bold text-base">Log In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center py-6">
            <View className="flex-1 h-px bg-white/10" />
            <Text className="mx-4 text-white/40 text-xs font-medium uppercase tracking-wider">Or continue with</Text>
            <View className="flex-1 h-px bg-white/10" />
          </View>

          {/* Social Login */}
          <View className="flex-row gap-4">
            <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl py-3 active:bg-white/10">
              <AntDesign name="google" size={20} color="white" />
              <Text className="text-white text-sm font-medium">Google</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl py-3 active:bg-white/10">
              <AntDesign name="apple" size={20} color="white" />
              <Text className="text-white text-sm font-medium">Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Biometric Quick Login */}
          <View className="mt-6 flex-row justify-center">
            <TouchableOpacity className="w-12 h-12 rounded-full border border-primary/30 items-center justify-center active:bg-primary/10">
              <MaterialIcons name="face" size={24} color="#D34E4E" />
            </TouchableOpacity>
          </View>

          {/* Footer Sign Up */}
          <View className="mt-8 flex-row justify-center">
            <Text className="text-white/60 text-sm font-body">{"Don't have an account? "}</Text>
            <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
              <Text className="text-primary font-bold ml-1">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </GlassPane>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default LoginPage;