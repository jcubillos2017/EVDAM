import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './http';
import { LOGIN_PATH, ME_PATH, TOKEN_PROP } from './config';

/** Toma token desde varias formas (data.token, token, access_token) */
function pickToken(resp: any): string | null {
  if (resp?.data?.token) return resp.data.token;        
  if (TOKEN_PROP && resp?.[TOKEN_PROP]) return resp[TOKEN_PROP];
  if (resp?.token) return resp.token;
  if (resp?.access_token) return resp.access_token;
  return null;
}

export async function login(email: string, password: string) {
  const body = JSON.stringify({ email, password }); // si se usa username, cámbiar aquí
  const resp = await apiFetch<any>(LOGIN_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (resp?.success === false) throw new Error(resp?.message || 'Credenciales inválidas');
  const token = pickToken(resp);
  if (!token) {
    console.warn('[auth.login] Respuesta inesperada de login:', resp);
    throw new Error('Token no recibido');
  }
  await AsyncStorage.setItem('evdam:token', token);
  await AsyncStorage.setItem('evdam:user', email);
  return token;
}

export async function logout() {
  await AsyncStorage.multiRemove(['evdam:token', 'evdam:user']);
}

export async function getMe() {
  if (!ME_PATH) return null;
  try { return await apiFetch<any>(ME_PATH, { method: 'GET' }); } catch { return null; }
}

export async function getToken() {
  return AsyncStorage.getItem('evdam:token');
}
