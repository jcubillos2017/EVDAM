import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';


export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { signIn } = useAuth();

  useEffect(() => {
    if (error && password.trim().length === 0) setError('');
  }, [password, error]);

  const handleLogin = () => {
    if (password !== '1234') {
      setError('Contraseña Incorrecta');
      return;
    }
    signIn(email.trim());
    router.replace('/(tabs)/home'); // redireccion 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        inputMode="email"
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="tu@email.com"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="********"
        placeholderTextColor="#999"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable onPress={handleLogin} style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}>
        
        <Text style={styles.buttonText}>Iniciar sesión</Text> 
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#d3cdcdff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 14, color: '#333', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 16, fontSize: 16 },
  error: { color: '#c62828', marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: '#0ea5e9', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
