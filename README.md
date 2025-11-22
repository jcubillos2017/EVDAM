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
