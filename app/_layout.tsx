import { Stack, router } from 'expo-router';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function GuardedStack() {
  const { isAuthenticated, loading } = useAuth();
  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/');
  }, [loading, isAuthenticated]);

  if (loading) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <GuardedStack />
    </AuthProvider>
  );
}
