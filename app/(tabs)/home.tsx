import React from 'react';
import {View, Text, TextInput, StyleSheet, Pressable, FlatList, Image, Alert, RefreshControl, Linking} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';

import {createTask, deleteTask, listTasks, updateTaskCompleted, TaskDTO, getTaskImageUrl, getTaskId, getTaskCoords, getTaskAddress} from '../../src/services/tasks';

type UTask = TaskDTO & { _key: string };

function formatPlacemark(p?: any): string {
  if (!p) return '';
  const parts = [
    [p.street || p.name, p.streetNumber].filter(Boolean).join(' '),
    p.subregion || p.district || p.city,
    p.region,
    p.country,
  ].filter(Boolean);
  return parts.join(', ');
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [title, setTitle] = React.useState('');
  const [photoUri, setPhotoUri] = React.useState<string | null>(null);
  const [tasks, setTasks] = React.useState<UTask[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  // Overlay local por id para no perder address/coords tras recargar
  const [recentOverlay, setRecentOverlay] = React.useState<Record<string, Partial<TaskDTO>>>({});

  // 1) Memoiza makeKey para identidad estable
  const makeKey = React.useCallback(
    (t: any, idx?: number) =>
      String(
        t?.id ??
          t?._id ??
          t?.todoId ??
          t?.uuid ??
          t?.key ??
          t?.createdAt ??
          `${t?.title ?? 't'}-${idx ?? 0}`,
      ),
    [],
  );

  // 2) Memoiza normalizeTasks y depende de makeKey
  const normalizeTasks = React.useCallback(
    (arr: any[]): UTask[] =>
      (Array.isArray(arr) ? arr : []).map((t, idx) => ({ ...t, _key: makeKey(t, idx) })),
    [makeKey],
  );

  // Aplica overlay local sobre items para mantener address/coords si el backend no los trae
  const applyOverlay = React.useCallback(
    (items: UTask[]): UTask[] => {
      if (!items.length) return items;
      return items.map((t) => {
        try {
          const id = getTaskId(t);
          const ov = recentOverlay[id];
          if (!ov) return t;

          const coords = getTaskCoords(t);
          return {
            ...t,
            // Solo rellenamos si faltan (no pisamos lo que venga del backend)
            address: getTaskAddress(t) ?? ov.address ?? (t as any).address,
            latitude: coords.latitude ?? (ov as any).latitude ?? (t as any).latitude,
            longitude: coords.longitude ?? (ov as any).longitude ?? (t as any).longitude,
          };
        } catch {
          return t; // si no tiene id usable, no aplicamos overlay
        }
      });
    },
    [recentOverlay],
  );

  // 3) load depende de applyOverlay y normalizeTasks
  const load = React.useCallback(async () => {
    try {
      const data = await listTasks();
      const normalized = normalizeTasks(data);
      const merged = applyOverlay(normalized);
      setTasks(merged);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudieron cargar las tareas');
    }
  }, [applyOverlay, normalizeTasks]);

  React.useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const pickPhoto = async () => {
    const camPerm = await ImagePicker.requestCameraPermissionsAsync();
    if (camPerm.status !== 'granted') {
      Alert.alert('Permiso requerido', 'Habilita el acceso a la cámara.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true });
    if (res.canceled || !res.assets?.[0]?.uri) return;
    setPhotoUri(res.assets[0].uri);
  };

  const onCreate = async () => {
    if (!title.trim()) return Alert.alert('Título requerido', 'Ingresa un título.');
    if (!photoUri) return Alert.alert('Foto requerida', 'Debes tomar una foto.');

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permiso requerido', 'Habilita la ubicación.');

    const pos = await Location.getCurrentPositionAsync({});
    let address = '';
    try {
      const placemarks = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      address = formatPlacemark(placemarks?.[0]);
    } catch {}

    try {
      setLoading(true);
      const created = await createTask({
        title: title.trim(),
        imageUri: photoUri,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        address,
      });

      // Guardamos overlay por id para no perder address/coords al recargar
      try {
        const id = getTaskId(created as TaskDTO);
        setRecentOverlay((prev) => ({
          ...prev,
          [id]: {
            address,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
        }));
      } catch {}

      const withKey: UTask = { ...(created as TaskDTO), _key: makeKey(created, Date.now()) };
      setTasks((prev) => [withKey, ...prev]);
      setTitle('');
      setPhotoUri(null);

      // Revalidar con backend (overlay mantiene address/coords si no vienen)
      await load();
    } catch (e: any) {
      Alert.alert('No se pudo crear', e?.message ?? 'Error creando tarea');
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (t: UTask) => {
    try {
      const id = getTaskId(t);
      setTasks((prev) => prev.map((x) => (x._key === t._key ? { ...x, completed: !t.completed } : x))); // optimista
      const updated = await updateTaskCompleted(id, !t.completed);
      setTasks((prev) => prev.map((x) => (x._key === t._key ? ({ ...(updated as TaskDTO), _key: t._key }) : x)));
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo actualizar (ID inválido)');
      load();
    }
  };

  const remove = async (t: UTask) => {
    try {
      const id = getTaskId(t);
      setTasks((prev) => prev.filter((x) => x._key !== t._key)); // optimista
      await deleteTask(id);
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo eliminar (ID inválido)');
      load();
    }
  };

  const copyUrl = async (url: string) => {
    await Clipboard.setStringAsync(url);
    Alert.alert('Copiado', 'URL de imagen copiada al portapapeles');
  };

  const openMaps = (lat: number, lon: number) => {
    const url = `https://maps.google.com/?q=${lat},${lon}`;
    Linking.openURL(url);
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
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={pickPhoto} style={styles.btnAlt}>
            <Ionicons name="camera" size={20} />
            <Text style={styles.btnAltText}>{photoUri ? 'Cambiar foto' : 'Tomar foto'}</Text>
          </Pressable>
          <Pressable onPress={onCreate} disabled={loading} style={styles.btn}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.btnText}>{loading ? 'Creando...' : 'Crear'}</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item._key}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? '' : 'No hay tareas aún.'}</Text>}
        renderItem={({ item }) => {
          const imgUrl = getTaskImageUrl(item);
          const { latitude, longitude } = getTaskCoords(item);
          const addr = getTaskAddress(item);

          return (
            <View style={[styles.card, item.completed && styles.cardDone]}>
              {imgUrl ? (
                <Image source={{ uri: imgUrl }} style={styles.photo} />
              ) : (
                <View style={[styles.photo, styles.photoPlaceholder]}>
                  <Ionicons name="image" size={24} color="#9ca3af" />
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={[styles.title, item.completed && styles.titleDone]} numberOfLines={2}>
                  {item.title}
                </Text>

                <View style={styles.urlRow}>
                  <Text style={styles.metaUrl} numberOfLines={1}>
                    {imgUrl ?? '(sin URL)'}
                  </Text>
                  {imgUrl && (
                    <Pressable onPress={() => copyUrl(imgUrl)} style={styles.linkBtnSecondary}>
                      <Text style={styles.linkBtnText}>Copiar URL</Text>
                    </Pressable>
                  )}
                </View>

                <Text style={styles.meta} numberOfLines={2}>
                  {addr ? `Ubicación: ${addr}` : 'Sin dirección'}
                </Text>

                <View style={styles.coordsRow}>
                  <Text style={styles.meta}>
                    {latitude != null && longitude != null
                      ? `(${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)})`
                      : ''}
                  </Text>
                  {latitude != null && longitude != null && (
                    <Pressable onPress={() => openMaps(Number(latitude), Number(longitude))} style={styles.linkBtn}>
                      <Text style={styles.linkBtnText}>Ver mapa</Text>
                    </Pressable>
                  )}
                </View>

                <View style={styles.row}>
                  <Pressable onPress={() => toggle(item)} style={styles.smallBtn}>
                    <Ionicons
                      name={item.completed ? 'checkmark-done' : 'checkmark-outline'}
                      size={18}
                      color="#fff"
                    />
                    <Text style={styles.smallBtnText}>
                      {item.completed ? 'Completada' : 'Marcar'}
                    </Text>
                  </Pressable>

                  <Pressable onPress={() => remove(item)} style={styles.smallBtnDanger}>
                    <Ionicons name="trash" size={18} color="#fff" />
                    <Text style={styles.smallBtnText}>Eliminar</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        }}
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
    flex: 1,
  },
  btnText: { color: '#fff', fontWeight: '700' },
  btnAlt: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#0ea5e9',
    flex: 1,
  },
  btnAltText: { color: '#0ea5e9', fontWeight: '700' },
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
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  titleDone: { textDecorationLine: 'line-through', color: '#6b7280' },
  urlRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  metaUrl: { flex: 1, fontSize: 12, color: '#2563eb' },
  coordsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  meta: { fontSize: 12, color: '#6b7280' },
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
  linkBtn: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#2563eb' },
  linkBtnSecondary: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#6b7280' },
  linkBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  smallBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
