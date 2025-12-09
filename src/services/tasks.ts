import { apiFetch } from './http';
import {
  API_URL,
  TASKS_PATH,
  IMAGES_PATH,
  UPLOAD_MODE,
  FILE_FIELD,
  IMAGE_URL_PROP,
} from './config';
// Alternativa base64 (opcional)
import * as FileSystem from 'expo-file-system/legacy';

export type TaskDTO = {
  id?: string;
  _id?: string;
  todoId?: string;
  uuid?: string;
  key?: string;
  title: string;
  completed: boolean;
  latitude?: number | string;
  longitude?: number | string;
  address?: string;
  [key: string]: any; // photoUri / imageUrl / createdAt, etc.
};

function unwrap<T>(resp: any): T {
  if (resp?.success === false) {
    const msg =
      resp?.message ||
      resp?.error?.message ||
      (typeof resp?.error === 'string' ? resp.error : 'API Error');
    throw new Error(msg);
  }
  return (resp?.data ?? resp) as T;
}

export function getTaskId(t: TaskDTO): string {
  const raw = t?.id ?? t?._id ?? t?.todoId ?? t?.uuid ?? t?.key;
  if (raw == null) throw new Error('ID de tarea no disponible');
  return String(raw);
}

export async function listTasks(): Promise<TaskDTO[]> {
  const resp = await apiFetch<any>(TASKS_PATH, { method: 'GET' });
  const out = unwrap<any>(resp);
  return Array.isArray(out) ? (out as TaskDTO[]) : (Array.isArray(resp?.data) ? resp.data : []);
}

export function getTaskImageUrl(t: TaskDTO): string | undefined {
  return (t as any)[IMAGE_URL_PROP] ?? (t as any)['image_url'] ?? (t as any)['imageUrl'];
}

// ---------- Ubicación y dirección (acepta varios formatos) ----------
const num = (v: any): number | undefined => {
  if (v === undefined || v === null) return undefined;
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : undefined;
};

/** Devuelve { latitude, longitude } probando:
 * - latitude/longitude
 * - lat/lng | lat/lon
 * - location.{latitude,longitude} | location.{lat,lng|lon}
 * - coords/position.{lat,lng}
 * - GeoJSON: *.location|*.geo.coordinates [lon, lat]
 * - string "lat,lon" en *.location
 */
export function getTaskCoords(t: TaskDTO): { latitude?: number; longitude?: number } {
  // directos
  let lat = num((t as any).latitude);
  let lon = num((t as any).longitude);
  if (lat != null && lon != null) return { latitude: lat, longitude: lon };

  // alias simples
  lat = num((t as any).lat);
  lon = num((t as any).lng ?? (t as any).lon);
  if (lat != null && lon != null) return { latitude: lat, longitude: lon };

  // anidados comunes
  const nests = ['location', 'coords', 'position', 'geo'] as const;
  for (const k of nests) {
    const n = (t as any)[k];
    if (!n) continue;

    // lat/long nombrados
    lat = num(n.latitude ?? n.lat);
    lon = num(n.longitude ?? n.lng ?? n.lon);
    if (lat != null && lon != null) return { latitude: lat, longitude: lon };

    // GeoJSON coordinates
    const coordinates = n.coordinates || n.coord || n.coords;
    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      const maybeLon = num(coordinates[0]);
      const maybeLat = num(coordinates[1]);
      if (maybeLat != null && maybeLon != null) return { latitude: maybeLat, longitude: maybeLon };
    }

    // string "lat,lon"
    if (typeof n === 'string' && n.includes(',')) {
      const [a, b] = n.split(',').map(s => s.trim());
      const sLat = num(a);
      const sLon = num(b);
      if (sLat != null && sLon != null) return { latitude: sLat, longitude: sLon };
    }
  }

  return {};
}

/** Devuelve la dirección probando varios nombres/caminos */
export function getTaskAddress(t: TaskDTO): string | undefined {
  const c: any = t;
  return (
    c.address ??
    c.addr ??
    c.direction ??
    c.direccion ??
    c.place ??
    c.placeName ??
    c.location?.address ??
    c.location?.name ??
    c.coords?.address ??
    c.position?.address ??
    c.geo?.address
  );
}

// ---------- helpers imágenes ----------
function toAbsoluteUrl(maybeUrl: string): string {
  try {
    if (/^(https?:)?\/\//i.test(maybeUrl)) {
      return maybeUrl.startsWith('//') ? `https:${maybeUrl}` : maybeUrl;
    }
    return new URL(maybeUrl, API_URL).toString();
  } catch {
    return maybeUrl;
  }
}

function extractImageUrl(imgResp: any): string | null {
  const candidates = [
    imgResp?.data?.url,
    imgResp?.data?.photoUri,
    imgResp?.data?.href,
    imgResp?.url,
    imgResp?.photoUri,
    imgResp?.href,
    imgResp?.data,
  ].filter(Boolean);

  const relative = imgResp?.data?.path ?? imgResp?.data?.key ?? imgResp?.path ?? imgResp?.key;

  if (candidates.length > 0) return toAbsoluteUrl(String(candidates[0]));
  if (relative) return toAbsoluteUrl(String(relative));
  return null;
}

// ---------- crear / actualizar / eliminar ----------
export async function createTask(params: {
  title: string;
  imageUri: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}): Promise<TaskDTO> {
  if (UPLOAD_MODE === 'multipart') {
    const formImg = new FormData();
    const file: any = { uri: params.imageUri, name: 'photo.jpg', type: 'image/jpeg' };
    formImg.append(FILE_FIELD, file);

    const imgRespRaw = await apiFetch<any>(IMAGES_PATH, { method: 'POST', headers: {}, body: formImg as any });
    const imgResp = unwrap<any>(imgRespRaw);
    const photoUriAbs = extractImageUrl(imgResp);
    if (!photoUriAbs) throw new Error('El backend no devolvió la URL de la imagen');

    const payload: any = {
      title: params.title,
      photoUri: photoUriAbs,
      latitude: params.latitude,
      longitude: params.longitude,
      address: params.address,
    };

    const createdRaw = await apiFetch<any>(TASKS_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const created = unwrap<TaskDTO>(createdRaw);

    // si backend no devuelve campos, mantenemos los enviados para la UI
    if (!getTaskImageUrl(created)) (created as any)[IMAGE_URL_PROP] = photoUriAbs;
    const c = getTaskCoords(created);
    if (c.latitude == null && params.latitude != null) (created as any).latitude = params.latitude;
    if (c.longitude == null && params.longitude != null) (created as any).longitude = params.longitude;
    if (!getTaskAddress(created) && params.address) (created as any).address = params.address;

    return created;
  }

  // Alternativa base64 (si tu backend la acepta)
  const base64 = await FileSystem.readAsStringAsync(params.imageUri, { encoding: 'base64' });
  const createdRaw = await apiFetch<any>(TASKS_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: params.title,
      latitude: params.latitude,
      longitude: params.longitude,
      address: params.address,
      imageBase64: `data:image/jpeg;base64,${base64}`,
    }),
  });
  return unwrap<TaskDTO>(createdRaw);
}

export async function updateTaskCompleted(id: string, completed: boolean): Promise<TaskDTO> {
  const resp = await apiFetch<any>(`${TASKS_PATH}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  return unwrap<TaskDTO>(resp);
}

export async function deleteTask(id: string): Promise<void> {
  const resp = await apiFetch<any>(`${TASKS_PATH}/${id}`, { method: 'DELETE' });
  unwrap<any>(resp);
}
