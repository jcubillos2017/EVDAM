import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, type Href } from 'expo-router';
import { API_URL } from './config';

const LOGIN_ROUTE = '/login' as const; 

function goToLogin() {
  router.replace(LOGIN_ROUTE as unknown as Href);
}

export type FetchInit = RequestInit & { skipAuthRedirect?: boolean };

export const apiFetch = async <T>(path: string, init: FetchInit = {}): Promise<T> => {
  const url = new URL(path, API_URL).toString();
  const token = await AsyncStorage.getItem('evdam:token');

  const headers = new Headers(init.headers ?? {});
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers });

  const contentType = res.headers.get('content-type') || '';
  const isJSON = contentType.includes('application/json');
  const body = isJSON ? await res.json().catch(() => null) : await res.text().catch(() => '');

  if (res.status === 401 && !init.skipAuthRedirect) {
    await AsyncStorage.multiRemove(['evdam:token', 'evdam:email']);
    goToLogin();
    throw new Error(typeof body === 'string' ? 'Sesión expirada' : (body?.message || 'Sesión expirada'));
  }

  if (!res.ok) {
    const message =
      typeof body === 'string'
        ? body
        : body?.error?.message || body?.message || `${res.status} ${res.statusText}`;
    const err: any = new Error(message);
    err.status = res.status;
    err.path = path;
    err.data = typeof body === 'string' ? undefined : body;
    err.headers = Object.fromEntries(res.headers.entries());
    throw err;
  }

  return (body as T) ?? ({} as T);
};
