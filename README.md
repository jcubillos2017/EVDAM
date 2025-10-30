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

