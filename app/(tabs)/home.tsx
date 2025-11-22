// app/(tabs)/home.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, FlatList, Image, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTasks } from '../../src/context/TasksContext';

export default function HomeScreen() {
  const { tasks, creating, createTask, toggleCompleted, removeTask } = useTasks();
  const [title, setTitle] = useState('');
  const insets = useSafeAreaInsets();

  const onCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Título requerido', 'Ingresa un título para la tarea.');
      return;
    }
    await createTask({ title, camera: true }); // usa cámara; para galería: camera: false
    setTitle('');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.header}>Mis Tareas</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Título de la tarea"
          placeholderTextColor="#999"
        />
        <Pressable
          onPress={onCreate}
          disabled={creating}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }, creating && { opacity: 0.6 }]}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.btnText}>{creating ? 'Creando...' : 'Crear (Cámara)'}</Text>
        </Pressable>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={<Text style={styles.empty}>No hay tareas aún.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, item.completed && styles.cardDone]}>
            <Image source={{ uri: item.imageUri }} style={styles.photo} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, item.completed && styles.titleDone]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.meta} numberOfLines={2}>
                {item.location.address
                  ? item.location.address
                  : `(${item.location.latitude.toFixed(5)}, ${item.location.longitude.toFixed(5)})`}
              </Text>
              <View style={styles.row}>
                <Pressable
                  onPress={() => toggleCompleted(item.id)}
                  style={({ pressed }) => [styles.smallBtn, pressed && { opacity: 0.7 }]}
                >
                  <Ionicons name={item.completed ? 'checkmark-done' : 'checkmark-outline'} size={18} color="#fff" />
                  <Text style={styles.smallBtnText}>{item.completed ? 'Completada' : 'Marcar'}</Text>
                </Pressable>
                <Pressable
                  onPress={() => removeTask(item.id)}
                  style={({ pressed }) => [styles.smallBtnDanger, pressed && { opacity: 0.7 }]}
                >
                  <Ionicons name="trash" size={18} color="#fff" />
                  <Text style={styles.smallBtnText}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  form: { gap: 8, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  btn: {
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnText: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 24 },

  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardDone: { opacity: 0.75 },
  photo: { width: 84, height: 84, borderRadius: 8, backgroundColor: '#f3f4f6' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  titleDone: { textDecorationLine: 'line-through', color: '#6b7280' },
  meta: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  smallBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  smallBtnDanger: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  smallBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
