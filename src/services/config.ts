export const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export const LOGIN_PATH  = process.env.EXPO_PUBLIC_LOGIN_PATH  ?? '/auth/login';
export const TASKS_PATH  = process.env.EXPO_PUBLIC_TASKS_PATH  ?? '/todos';
export const IMAGES_PATH = process.env.EXPO_PUBLIC_IMAGES_PATH ?? '/images';
export const ME_PATH     = process.env.EXPO_PUBLIC_ME_PATH     ?? '';

export const UPLOAD_MODE = (process.env.EXPO_PUBLIC_UPLOAD_MODE ?? 'multipart') as 'multipart'|'base64';
export const FILE_FIELD  = process.env.EXPO_PUBLIC_FILE_FIELD   ?? 'image';

export const IMAGE_URL_PROP = process.env.EXPO_PUBLIC_IMAGE_URL_PROP ?? 'photoUri';
export const TOKEN_PROP     = process.env.EXPO_PUBLIC_TOKEN_PROP     ?? 'token';
