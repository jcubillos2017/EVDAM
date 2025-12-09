import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { email, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.email}>{email ?? '—'}</Text>

      <Pressable onPress={handleLogout} style={styles.button}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 24 },
  label: { fontSize: 16, color: '#555' },
  email: { fontSize: 18, fontWeight: '700', marginBottom: 24 },
  button: { backgroundColor: '#ef4444', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
