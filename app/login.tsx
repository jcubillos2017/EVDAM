import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, type Href } from 'expo-router';

// Usa tu helper de fetch y la ruta de login de tu config
import { apiFetch } from '../src/services/http';
import { API_URL } from '../src/services/config';


const AUTH_LOGIN_PATH =
  (process.env.EXPO_PUBLIC_AUTH_LOGIN_PATH as string) ||
  '/auth/login'; 

type LoginResponse =
  | { success: true; token?: string; accessToken?: string; data?: { token?: string } }
  | { success?: boolean; token?: string; accessToken?: string; data?: any; message?: string; error?: any };

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa email y contraseña.');
      return;
    }

    setLoading(true);
    try {
      // Hacemos POST al endpoint de login
      const res = await apiFetch<LoginResponse>(AUTH_LOGIN_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
       
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
        
        skipAuthRedirect: true,
      });

      // Extraemos token en distintas formas posibles
      const token =
        (res as any)?.token ||
        (res as any)?.accessToken ||
        (res as any)?.data?.token;

      if (!token) {
        // Algunos backends devuelven {success:false,message:"..."}
        const msg =
          (res as any)?.message ||
          (res as any)?.error?.message ||
          'Token no recibido';
        throw new Error(msg);
      }

      // Persistimos token y email
      await AsyncStorage.setItem('evdam:token', String(token));
      await AsyncStorage.setItem('evdam:email', email.trim());

      // Navegamos al Home de tabs
      
      router.replace('/(tabs)/home' as unknown as Href);
    } catch (e: any) {
      const reason = e?.message || 'API Error';
      Alert.alert('No se pudo iniciar sesión', reason);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={{ flex: 1 }}
      >
        <View style={s.headerWrap}>
          <Ionicons name="lock-closed" size={48} color="#0ea5e9" />
          <Text style={s.header}>Iniciar sesión</Text>
          <Text style={s.subtitle} numberOfLines={2}>
            API_URL: {API_URL}
          </Text>
        </View>

        <View style={s.form}>
          <Text style={s.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="tu@correo.com"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            style={s.input}
          />

          <Text style={[s.label, { marginTop: 12 }]}>Contraseña</Text>
          <View style={s.passRow}>
            <TextInput
              placeholder="********"
              placeholderTextColor="#9ca3af"
              secureTextEntry={secure}
              value={password}
              onChangeText={setPassword}
              style={[s.input, { flex: 1, marginBottom: 0 }]}
            />
            <Pressable
              onPress={() => setSecure((x) => !x)}
              style={s.eyeBtn}
              hitSlop={10}
            >
              <Ionicons
                name={secure ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#6b7280"
              />
            </Pressable>
          </View>

          <Pressable onPress={onLogin} disabled={loading} style={s.btn}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={18} color="#fff" />
                <Text style={s.btnText}>Iniciar sesión</Text>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  headerWrap: { alignItems: 'center', marginTop: 12, marginBottom: 24, gap: 8 },
  header: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 12, color: '#6b7280' },
  form: { marginTop: 8 },
  label: { fontWeight: '700', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  passRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: {
    marginLeft: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  btn: {
    marginTop: 16,
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
