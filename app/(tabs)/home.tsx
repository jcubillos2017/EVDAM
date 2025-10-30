import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido! 👋🎉</Text>
      <Text style={styles.subtitle}>Esta es la pantalla Home.</Text>
      <Text style={styles.clock}>Hora actual: {now.toLocaleTimeString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#d3cdcdff', padding: 24 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#0e0c0cff', marginBottom: 16 },
  clock: { fontSize: 14, color: '#0c0b0bff' }
});
