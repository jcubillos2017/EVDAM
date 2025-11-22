import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { TasksProvider } from '../src/context/TasksContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <TasksProvider>
      <Stack screenOptions={{ headerShown: false }} />
      </TasksProvider>
    </AuthProvider>
  );
}
