import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { randomUUID } from 'expo-crypto';

export type Task = {
  id: string;
  title: string;
  imageUri: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  completed: boolean;
  createdAt: string; // ISO
};

type TasksContextType = {
  tasks: Task[];
  creating: boolean;
  createTask: (params: { title: string; camera?: boolean }) => Promise<void>;
  toggleCompleted: (id: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  pickOrCapturePhoto: (camera?: boolean) => Promise<string | null>;
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

const KEY_PREFIX = 'evdam:tasks:';
const userKey = (email: string) => `${KEY_PREFIX}${encodeURIComponent(email)}`;

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const { email, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [creating, setCreating] = useState(false);

  // Cargar tareas del usuario al cambiar de sesión
  useEffect(() => {
    (async () => {
      if (isAuthenticated && email) {
        const raw = await AsyncStorage.getItem(userKey(email));
        setTasks(raw ? JSON.parse(raw) : []);
      } else {
        setTasks([]);
      }
    })();
  }, [email, isAuthenticated]);

  const persist = useCallback(async (list: Task[]) => {
    if (!email) return;
    await AsyncStorage.setItem(userKey(email), JSON.stringify(list));
  }, [email]);

  // Utilidad: copiar imagen al sandbox de la app con ruta estable por usuario
  const savePhotoForUser = useCallback(async (srcUri: string, id: string) => {
    if (!email) throw new Error('Usuario no definido');
    const dir = `${FileSystem.documentDirectory}tasks/${encodeURIComponent(email)}/`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
    const dst = `${dir}${id}.jpg`;
    await FileSystem.copyAsync({ from: srcUri, to: dst });
    return dst;
  }, [email]);

  // Obtener ubicación con permisos + dirección
  const getCurrentLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permiso de ubicación denegado');
    }
    const pos = await Location.getCurrentPositionAsync({});
    let address: string | undefined;
    try {
      const rev = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const a = rev?.[0];
      if (a) {
        address = [a.street, a.name, a.city, a.region, a.country].filter(Boolean).join(', ');
      }
    } catch {}
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      address,
    };
  }, []);

  // Tomar foto 
  const pickOrCapturePhoto = useCallback(async (camera?: boolean) => {
    if (camera) {
      const camPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (camPerm.status !== 'granted') {
        Alert.alert('Permiso requerido', 'Habilita el acceso a la cámara.');
        return null;
      }
      const res = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: true,
      });
      if (res.canceled || !res.assets?.[0]?.uri) return null;
      return res.assets[0].uri;
    } else {
      const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libPerm.status !== 'granted') {
        Alert.alert('Permiso requerido', 'Habilita el acceso a la galería.');
        return null;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        quality: 0.7,
        allowsEditing: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (res.canceled || !res.assets?.[0]?.uri) return null;
      return res.assets[0].uri;
    }
  }, []);

  const createTask = useCallback(async ({ title, camera = true }: { title: string; camera?: boolean }) => {
    if (!email) return Alert.alert('Sesión requerida', 'Inicia sesión para crear tareas.');
    if (!title?.trim()) return Alert.alert('Título requerido', 'Ingresa un título para la tarea.');

    setCreating(true);
    try {
      // Foto
      const srcUri = await pickOrCapturePhoto(camera);
      if (!srcUri) {
        setCreating(false);
        return;
      }

      // Ubicación
      const location = await getCurrentLocation();

      // Persistir imagen en sandbox
      const id = randomUUID();
      const dst = await savePhotoForUser(srcUri, id);

      const newTask: Task = {
        id,
        title: title.trim(),
        imageUri: dst,
        location,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      const next = [newTask, ...tasks];
      setTasks(next);
      await persist(next);
    } catch (e: any) {
      Alert.alert('No se pudo crear la tarea', e?.message ?? String(e));
    } finally {
      setCreating(false);
    }
  }, [email, tasks, persist, getCurrentLocation, savePhotoForUser, pickOrCapturePhoto]);

  const toggleCompleted = useCallback(async (id: string) => {
    const next = tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTasks(next);
    await persist(next);
  }, [tasks, persist]);

  const removeTask = useCallback(async (id: string) => {
    const t = tasks.find(x => x.id === id);
    const next = tasks.filter(x => x.id !== id);
    setTasks(next);
    await persist(next);
    // borra la foto asociada
    if (t?.imageUri) {
      try { await FileSystem.deleteAsync(t.imageUri, { idempotent: true }); } catch {}
    }
  }, [tasks, persist]);

  const value = useMemo<TasksContextType>(() => ({
    tasks, creating, createTask, toggleCompleted, removeTask, pickOrCapturePhoto
  }), [tasks, creating, createTask, toggleCompleted, removeTask, pickOrCapturePhoto]);

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within a TasksProvider');
  return ctx;
}
