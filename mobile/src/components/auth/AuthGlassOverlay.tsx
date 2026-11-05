/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: Frosted Dark Glass Login and Sign Up overlay displayed over the live sneaker photography slideshow.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authApi, type AuthUser } from '@/services/authApi';

export interface AuthGlassOverlayProps {
  onAuthenticated: (user: AuthUser) => void;
}

export function AuthGlassOverlay({ onAuthenticated }: AuthGlassOverlayProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorText(null);
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorText('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorText('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const response =
        mode === 'login'
          ? await authApi.login(trimmedEmail, password)
          : await authApi.signup(trimmedEmail, password, displayName.trim());

      onAuthenticated(response.user);
    } catch (err: unknown) {
      setErrorText(
        err instanceof Error ? err.message : 'Unable to authenticate right now.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setMode('login');
    setEmail('domonick@apexvault.io');
    setPassword('vault1234');
    setErrorText(null);
    setSubmitting(true);
    try {
      const response = await authApi.login('domonick@apexvault.io', 'vault1234');
      onAuthenticated(response.user);
    } catch (err: unknown) {
      setErrorText(
        err instanceof Error ? err.message : 'Demo login failed.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Brand Pill */}
          <View style={styles.brandBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.brandBadgeText}>APEX SNEAKER VAULT</Text>
          </View>

          {/* Frosted Dark Glass Card */}
          <View style={styles.cardShadow}>
            <BlurView intensity={70} tint="dark" style={styles.glassCard}>
              <LinearGradient
                colors={[
                  'rgba(18, 16, 38, 0.78)',
                  'rgba(10, 14, 32, 0.84)',
                  'rgba(28, 14, 48, 0.80)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              {/* Header */}
              <Text style={styles.title}>
                {mode === 'login' ? 'Welcome Back' : 'Create Your Vault'}
              </Text>
              <Text style={styles.subtitle}>
                {mode === 'login'
                  ? 'Sign in to access your sneaker portfolio & QR tags.'
                  : 'Register with email & password to start cataloging pairs.'}
              </Text>

              {/* Mode Segmented Toggle */}
              <View style={styles.segmentContainer}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    setMode('login');
                    setErrorText(null);
                  }}
                  style={[
                    styles.segmentButton,
                    mode === 'login' && styles.segmentButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      mode === 'login' && styles.segmentTextActive,
                    ]}
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    setMode('signup');
                    setErrorText(null);
                  }}
                  style={[
                    styles.segmentButton,
                    mode === 'signup' && styles.segmentButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      mode === 'signup' && styles.segmentTextActive,
                    ]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Display Name (Sign Up only) */}
              {mode === 'signup' ? (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>COLLECTOR NAME</Text>
                  <View style={styles.inputBox}>
                    <Ionicons
                      name="person-outline"
                      size={17}
                      color="rgba(255,255,255,0.55)"
                    />
                    <TextInput
                      value={displayName}
                      onChangeText={setDisplayName}
                      placeholder="Domonick Mack"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      autoCapitalize="words"
                      style={styles.input}
                    />
                  </View>
                </View>
              ) : null}

              {/* Email Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                <View style={styles.inputBox}>
                  <Ionicons
                    name="mail-outline"
                    size={17}
                    color="rgba(255,255,255,0.55)"
                  />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="collector@apexvault.io"
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PASSWORD</Text>
                <View style={styles.inputBox}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={17}
                    color="rgba(255,255,255,0.55)"
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Minimum 6 characters"
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="rgba(255,255,255,0.55)"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Inline Error */}
              {errorText ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color="#FF6961" />
                  <Text style={styles.errorText}>{errorText}</Text>
                </View>
              ) : null}

              {/* Primary Submit Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={submitting}
                onPress={() => void handleSubmit()}
                style={styles.submitWrap}
              >
                <LinearGradient
                  colors={['#4F46E5', '#7C3AED', '#6D28D9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitGradient}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.submitText}>
                        {mode === 'login' ? 'Sign In to Vault' : 'Create Vault Account'}
                      </Text>
                      <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* One-Tap Demo Collector Sign-In Helper */}
              <TouchableOpacity
                activeOpacity={0.75}
                disabled={submitting}
                onPress={() => void handleQuickDemoLogin()}
                style={styles.demoBtn}
              >
                <Ionicons name="sparkles-outline" size={14} color="#C4B5FD" />
                <Text style={styles.demoBtnText}>
                  Quick Sign In as Domonick (domonick@apexvault.io)
                </Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  brandBadge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    marginBottom: 18,
    gap: 7,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#30D158',
  },
  brandBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  cardShadow: {
    borderRadius: 30,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.38,
    shadowRadius: 24,
    elevation: 14,
  },
  glassCard: {
    borderRadius: 30,
    overflow: 'hidden',
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.34)',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.68)',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    borderRadius: 16,
    padding: 4,
    marginTop: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.55)',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  fieldGroup: {
    marginTop: 14,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    gap: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 0,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.42)',
  },
  errorText: {
    flex: 1,
    color: '#FFD3D0',
    fontSize: 12,
    fontWeight: '600',
  },
  submitWrap: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 6,
  },
  demoBtnText: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '700',
  },
});
