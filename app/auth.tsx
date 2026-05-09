import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useAppStore } from '@/lib/store';
import { Colors } from '@/lib/theme';
import { mockUser } from '@/lib/mock-data';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAppStore((s) => s.login);

  // Animated floating circles
  const circle1Y = useSharedValue(0);
  const circle2Y = useSharedValue(0);
  const circle3X = useSharedValue(0);

  React.useEffect(() => {
    circle1Y.value = withRepeat(
      withSequence(withTiming(-30, { duration: 3000 }), withTiming(0, { duration: 3000 })),
      -1,
      false
    );
    circle2Y.value = withRepeat(
      withSequence(withTiming(20, { duration: 4000 }), withTiming(0, { duration: 4000 })),
      -1,
      false
    );
    circle3X.value = withRepeat(
      withSequence(withTiming(25, { duration: 3500 }), withTiming(0, { duration: 3500 })),
      -1,
      false
    );
  }, []);

  const circle1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: circle1Y.value }],
  }));

  const circle2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: circle2Y.value }],
  }));

  const circle3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: circle3X.value }],
  }));

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      login({
        id: mockUser.id,
        name: mockUser.name,
        email: email || mockUser.email,
        phone: mockUser.phone,
        avatar: mockUser.avatar,
      });
      setLoading(false);
    }, 800);
  };

  const handleRegister = () => {
    setLoading(true);
    setTimeout(() => {
      login({
        id: 'user-new',
        name: name || 'Nuevo Usuario',
        email: email || 'nuevo@email.com',
        phone: '+51 999 888 777',
        avatar: mockUser.avatar,
      });
      setLoading(false);
    }, 800);
  };

  return (
    <LinearGradient
      colors={['#0F172A', '#1E3A5F', '#0F172A']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Animated floating circles */}
            <Animated.View
              style={[styles.floatingCircle1, circle1Style]}
            />
            <Animated.View
              style={[styles.floatingCircle2, circle2Style]}
            />
            <Animated.View
              style={[styles.floatingCircle3, circle3Style]}
            />

            {/* Logo */}
            <View className="items-center mt-12 mb-8">
              <Animated.View
                entering={FadeIn.duration(600)}
                style={styles.logoCircle}
              >
                <Text className="text-4xl">⚽</Text>
              </Animated.View>
              <Animated.Text
                entering={FadeInDown.duration(600).delay(200)}
                className="text-3xl font-bold text-white mt-4"
              >
                CanchaYa
              </Animated.Text>
              <Animated.Text
                entering={FadeInDown.duration(600).delay(400)}
                className="text-base text-gray-400 mt-1"
              >
                Reserva tu cancha favorita
              </Animated.Text>
            </View>

            {/* Glass Card */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(300)}
              className="mx-6 mb-8"
            >
              <BlurView intensity={40} tint="dark" style={styles.glassCard}>
                {/* Tab Toggle */}
                <View style={styles.toggleContainer}>
                  <Pressable
                    onPress={() => setIsLogin(true)}
                    style={[
                      styles.toggleButton,
                      isLogin && styles.toggleActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        isLogin && styles.toggleTextActive,
                      ]}
                    >
                      Iniciar Sesión
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setIsLogin(false)}
                    style={[
                      styles.toggleButton,
                      !isLogin && styles.toggleActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        !isLogin && styles.toggleTextActive,
                      ]}
                    >
                      Registrarse
                    </Text>
                  </Pressable>
                </View>

                {/* Form Fields */}
                <View className="mt-6 gap-4">
                  {!isLogin && (
                    <View>
                      <Text className="text-gray-400 text-sm mb-2">Nombre completo</Text>
                      <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Tu nombre"
                        placeholderTextColor="#64748B"
                        style={styles.input}
                      />
                    </View>
                  )}

                  <View>
                    <Text className="text-gray-400 text-sm mb-2">Correo electrónico</Text>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="tu@email.com"
                      placeholderTextColor="#64748B"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.input}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-400 text-sm mb-2">Contraseña</Text>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#64748B"
                      secureTextEntry
                      style={styles.input}
                    />
                    {!isLogin && (
                      <Text className="text-gray-500 text-xs mt-1">
                        Mínimo 8 caracteres
                      </Text>
                    )}
                  </View>

                  {!isLogin && (
                    <View>
                      <Text className="text-gray-400 text-sm mb-2">Confirmar contraseña</Text>
                      <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="••••••••"
                        placeholderTextColor="#64748B"
                        secureTextEntry
                        style={styles.input}
                      />
                      <Text className="text-gray-500 text-xs mt-1">
                        Debe coincidir con la contraseña
                      </Text>
                    </View>
                  )}
                </View>

                {/* Submit Button */}
                <Pressable
                  onPress={isLogin ? handleLogin : handleRegister}
                  disabled={loading}
                  style={styles.submitButton}
                >
                  <Text style={styles.submitButtonText}>
                    {loading
                      ? 'Cargando...'
                      : isLogin
                        ? 'Iniciar Sesión'
                        : 'Crear Cuenta'}
                  </Text>
                </Pressable>

                {/* Google Sign In (Login only) */}
                {isLogin && (
                  <View className="mt-4 items-center">
                    <View className="flex-row items-center gap-3 mb-4">
                      <View className="h-px flex-1 bg-white/10" />
                      <Text className="text-gray-500 text-sm">o</Text>
                      <View className="h-px flex-1 bg-white/10" />
                    </View>
                    <Pressable style={styles.googleButton}>
                      <Text className="text-2xl mr-3">🔵</Text>
                      <Text className="text-white font-semibold text-base">
                        Continuar con Google
                      </Text>
                    </Pressable>
                  </View>
                )}

                {/* Toggle link */}
                <View className="mt-6 items-center">
                  <Pressable
                    onPress={() => setIsLogin(!isLogin)}
                  >
                    <Text className="text-gray-400 text-sm">
                      {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                      <Text style={{ color: Colors.neonGreen, fontWeight: '600' }}>
                        {isLogin ? 'Regístrate' : 'Inicia sesión'}
                      </Text>
                    </Text>
                  </Pressable>
                </View>
              </BlurView>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  floatingCircle1: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.neonGreen,
    opacity: 0.06,
  },
  floatingCircle2: {
    position: 'absolute',
    top: 200,
    right: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.neonGreen,
    opacity: 0.04,
  },
  floatingCircle3: {
    position: 'absolute',
    bottom: 120,
    left: 60,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    opacity: 0.05,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(57,255,20,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(57,255,20,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
  glassCard: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleActive: {
    backgroundColor: 'rgba(57,255,20,0.15)',
  },
  toggleText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: Colors.neonGreen,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    color: '#F1F5F9',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  submitButton: {
    backgroundColor: Colors.neonGreen,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 6,
  },
  submitButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
