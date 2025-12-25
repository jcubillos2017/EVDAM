# React Native + Expo + TypeScript + Expo Router (Login -> Tabs)

## Aplicación base que cumple con:
- **Expo** + **React Native** en **TypeScript (.tsx)**
- **Expo Router** para navegación (Login -> Tabs)
- **Validación de contraseña** (debe ser **1234**)
- **Estado global simple** con **React Context + Hooks** (`useState`, `useEffect`)
- **Tabs**: Home y Perfil (Perfil muestra el **email** ingresado en el login)

---


---

## Requisitos previos
- Node.js LTS (recomendado 18.x o 20.x)
- npm o yarn
- Android Studio (para emulador Android) o Xcode (para iOS en macOS)
- Expo CLI (se ejecuta automáticamente con `npx expo`)

---

## Puesta en marcha rápida

> **Opción A**
1. Descomprime este repositorio en tu equipo.
2. Instala dependencias:
   ```bash
   npm install
   # o
   yarn
   ```
3. Inicia el proyecto:
   ```bash
   npx expo start
   ```
4. Abre en:
   - `a` para Android (emulador o dispositivo con Expo Go)
   - `i` para iOS (solo macOS)
   - `w` para Web (si está disponible)


## Estructura de directorios

```text
app/
  _layout.tsx                # Root layout (Stack) + AuthProvider
  index.tsx                  # Login (email + password). Navega a /(tabs) si password === '1234'
  (tabs)/
    _layout.tsx              # Contenedor de Tabs (Home y Perfil)
    home.tsx                 # Pantalla principal (muestra un reloj con useEffect)
    profile.tsx              # Muestra el email del login y botón "Cerrar sesión"
src/
  context/
    AuthContext.tsx          # Estado global de autenticación (email, isAuthenticated)
babel.config.js
tsconfig.json
app.json
package.json
```

---


- **Login**:
  - Campos: **Email**, **Password** (seguro)
  - Botón: **Iniciar sesión**
  - Reglas:
    - Si `password !== "1234"` → **"Contraseña Incorrecta"**
    - Si es correcta → `router.replace('/(tabs)')`
- **Tabs**:
  - **Home**: pantalla de bienvenida (con reloj – `useEffect`)
  - **Perfil**: muestra el **email** del login
- **Hooks**: `useState` + `useEffect` implementados y tipados en TS.
- **Buenas prácticas**: componentes desacoplados, tipos explícitos y estilos limpios.

---


## Scripts

```bash
# Iniciar
npx expo start

# Android / iOS (requiere entornos nativos configurados)
npx expo run:android
npx expo run:ios

# Web (si aplica)
npm run web
```

---

## 📝 Informe del proyecto Evaluacion N° 2

## Link del Video de demostración

https://ipciisa-my.sharepoint.com/:f:/g/personal/jorge_cubillos_vargas_estudiante_ipss_cl/IgCdxLVw3thRQbnbpp2QOxNfAbWnG2GIgNal8Ek0QF2YYk4?e=zfzcEZ

### 1) Resumen
EVDAM es una app móvil construida con **Expo (SDK 54)**, **React Native** y **TypeScript**, que implementa: autenticación simple (login), navegación con **Expo Router** (tabs **Home** y **Perfil**), y un **TODO List** por usuario con **persistencia local**. Cada tarea almacena **título**, **foto** capturada/seleccionada y **localización** (coordenadas y, si está disponible, dirección por reverse geocoding).

### 2) Arquitectura y organización
- **Expo Router**: `app/_layout.tsx` (Stack) y `app/(tabs)/_layout.tsx` (Tabs: `home.tsx`, `profile.tsx`).
- **Estado global**:
  - `src/context/AuthContext.tsx`: email del usuario, `signIn`/`signOut`.
  - `src/context/TasksContext.tsx`: CRUD de tareas, permisos, persistencia y manejo de fotos.
- **UI**:
  - `Home`: formulario de creación (título) + lista con foto/ubicación + acciones (marcar/eliminar).
  - `Perfil`: muestra email y botón de cierre de sesión.
- **Estilos**: RN `StyleSheet` + íconos **Ionicons**.

### 3) Tecnologías clave
- **Expo SDK 54** (managed workflow).
- **TypeScript** (.tsx).
- **Expo Router** para navegación.
- **AsyncStorage** para persistencia local de tareas por usuario.
- **expo-image-picker** (cámara/galería).
- **expo-location** (coordenadas + reverse geocoding).
- **expo-file-system** *(modo legacy)* para almacenar fotos en el filesystem del dispositivo.
- **react-native-safe-area-context** para respetar “notch”/barra de estado.

> **Nota SDK 54 (FileSystem):** se usa `import * as FileSystem from 'expo-file-system/legacy'` porque el API tradicional (`copyAsync`, `deleteAsync`, etc.) fue marcado como *deprecated* en el nuevo FileSystem. Esta decisión mantiene compatibilidad y simplicidad en esta versión.

### 4) Cumplimiento de requisitos

- [x] **Crear tareas** con **título**, **foto** y **localización** (<br>
      cámara por defecto; opcionalmente galería; reverse geocoding para obtener dirección).
- [x] **Eliminar** tareas creadas (incluye borrado de la **foto** asociada del filesystem).
- [x] **Marcar** tareas como **completadas / no completadas**.
- [x] Tareas **asociadas a un usuario** (por **email**) y **visibles solo** para ese usuario.
- [x] Persistencia local: **AsyncStorage** para datos y **FileSystem** para **fotos**.

### 5) Modelo de datos (resumen)
```ts
type Task = {
  id: string;
  title: string;
  imageUri: string; // ruta local en FileSystem
  location: { latitude: number; longitude: number; address?: string };
  completed: boolean;
  createdAt: string; // ISO
};


EVDAM — Expo React Native (Login + TODO con Backend)
Aplicación móvil hecha con Expo + React Native + TypeScript + Expo Router que implementa:
Autenticación contra backend (token JWT guardado).
Rutas protegidas (si el token no existe/expira, te envía a Login).
TODO List 100% conectado al backend:
Crear tarea con título + foto + ubicación (reverse geocoding a dirección legible).
Listar tareas del usuario autenticado.
Marcar completada / no completada.
Eliminar tarea.
Persistencia del token con AsyncStorage.
Pull-to-refresh en la lista.
Perfil con email y botón Cerrar sesión.

Video https://ipciisa-my.sharepoint.com/:v:/g/personal/jorge_cubillos_vargas_estudiante_ipss_cl/IQAgwfOs028fRJnS42HCL84fAW7cgINO2l8dQ9ITeuZtXr8?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=B4r0wJ


🧱 Stack

Expo SDK 54, React Native 0.81, TypeScript
Expo Router (tabs + stack)
AsyncStorage (token, email)
expo-image-picker (cámara)
expo-location (coordenadas + reverse geocoding)
expo-clipboard (copiar URL de imagen)

📡 Backend esperado

Base URL configurable por entorno (ver .env). Endpoints usados:
POST /auth/login → devuelve token
Body:

{ "email": "jc@ipss.cl", "password": "password123" }

GET /todos → lista TODOs del usuario autenticado
POST /images → carga de imagen (multipart/form-data, campo file)
POST /todos → crea TODO
Body (ejemplo):

{
  "title": "Comprar café",
  "photoUri": "https://cdn/mi_foto.jpg",
  "latitude": -33.45694,
  "longitude": -70.64827,
  "address": "Santiago, Región Metropolitana, Chile"
}

PATCH /todos/:id → { "completed": true | false }
DELETE /todos/:id

La app muestra la imagen usando la URL que devuelva el backend tras subir el archivo.

⚙️ Configuración de entorno

Incluye .env.example en el repo y NO subas tu .env.
.env.example

EXPO_PUBLIC_API_URL=https://basic-hono-api.borisbelmarm.workers.dev
EXPO_PUBLIC_TASKS_PATH=/todos
EXPO_PUBLIC_IMAGES_PATH=/images
EXPO_PUBLIC_IMAGE_URL_PROP=photoUri
EXPO_PUBLIC_UPLOAD_MODE=multipart
EXPO_PUBLIC_AUTH_LOGIN_PATH=/auth/login


Crea tu archivo local .env copiando el ejemplo y ajusta valores si corresponde.

🚀 Puesta en marcha
# instalar dependencias
npm install

# (opcional) limpiar caché de Metro
npx expo start -c

# levantar la app
npx expo start
# luego presiona: a (Android), i (iOS en macOS) o abre con Expo Go


Credenciales de prueba (si tu backend las tiene creadas):

Email: jc@ipss.cl

Password: password123

📁 Estructura principal
app/
  (tabs)/
    _layout.tsx       # Tabs (Home, Profile)
    home.tsx          # TODO List (CRUD, cámara, ubicación)
    profile.tsx       # Email + Cerrar sesión
  login.tsx           # Pantalla de Login

src/
  services/
    config.ts         # Lee variables de entorno EXPO_PUBLIC_*
    http.ts           # apiFetch (auth header, manejo de 401 → redirige a /login)
    tasks.ts          # llamadas /todos y /images

🔐 Rutas protegidas

apiFetch (en src/services/http.ts) agrega Authorization: Bearer <token>.

Si el backend responde 401, se limpia el token y se hace router.replace('/login').

📱 Permisos

En app.json / app.config asegúrate de declarar:

iOS infoPlist:

NSCameraUsageDescription

NSLocationWhenInUseUsageDescription

Android permissions:

"CAMERA", "ACCESS_FINE_LOCATION"

🧰 Troubleshooting rápido

No navega a Login tras 401
Asegura que exista app/login.tsx y reinicia tipado: npx expo start -c.

No sube la imagen
Verifica que el backend acepte multipart/form-data con campo file y que devuelva una URL accesible.

La dirección/coords “desaparecen” al refrescar
El backend debe devolver address, latitude y longitude en GET /todos. La app incluye lógica para no “perder” esos datos inmediatamente después de crear, pero el source of truth es el backend.

📝 Scripts útiles
# reset del proyecto de ejemplo de Expo
npm run reset-project

# EVDAM — Expo React Native + TypeScript + Expo Router

Aplicación móvil con **autenticación contra backend** y **Todo List** conectado a API.  
Construida con **Expo (SDK 54)**, **React Native**, **TypeScript** y **Expo Router**.

> 🎥 **Video https://ipciisa-my.sharepoint.com/:f:/g/personal/jorge_cubillos_vargas_estudiante_ipss_cl/IgB0_xjsNCFdSZFVFYtfzT9XAWDbcQWxrWhJxhazjeoSJgM?e=XY4QwH



---

## 🚀 Funcionalidades

- **Login** (POST `/auth/login`) → guarda **token** en AsyncStorage.
- **Rutas protegidas**: si el token falta/expira (**401**), redirige a **/login**.
- **Todo List 100% backend**:
  - **Crear** tarea con **título, foto, ubicación** (lat/lon + dirección).
  - **Listar**, **marcar completada**, **eliminar**.
  - Las tareas son **por usuario** autenticado.
- **Imágenes**: se capturan con cámara y se **suben** (multipart). La app muestra la **URL** devuelta por el servidor.
- **Pull-to-refresh** en la lista.
- **Perfil** con email y **Cerrar sesión**.

---

## 🧱 Stack

- Expo SDK 54 • React Native 0.81 • TypeScript  
- Expo Router (tabs + stack)  
- **expo-image-picker** (cámara), **expo-location** (coords + reverse geocoding), **expo-clipboard**  
- AsyncStorage para token/email

---

## 📡 Backend & Endpoints

Base URL configurable (ver `.env`). Endpoints usados:

- **POST** `/auth/login` → `{ token }`
- **GET** `/todos` → lista tareas del usuario autenticado
- **POST** `/images` → sube imagen (`multipart/form-data`, campo `file`) ⇒ `{ url }`
- **POST** `/todos` → crea tarea  
  ```json
  {
    "title": "Comprar café",
    "photoUri": "https://servidor/mi_foto.jpg",
    "latitude": -33.45694,
    "longitude": -70.64827,
    "address": "Santiago, RM, Chile"
  }

⚙️ Variables de entorno
Incluye .env.example

.env.example
EXPO_PUBLIC_API_URL=https://basic-hono-api.borisbelmarm.workers.dev
EXPO_PUBLIC_TASKS_PATH=/todos
EXPO_PUBLIC_IMAGES_PATH=/images
EXPO_PUBLIC_IMAGE_URL_PROP=photoUri
EXPO_PUBLIC_UPLOAD_MODE=multipart
EXPO_PUBLIC_AUTH_LOGIN_PATH=/auth/login



▶️ Ejecución:
npm install
npx expo start -c
# luego: a (Android), i (iOS en macOS) o Expo Go

Credenciales de prueba están creadas en backend:

Email: jc@ipss.cl
Password: password123








