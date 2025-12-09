import { Tabs, router } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabsLayout() {
  const { isAuthenticated, loading } = useAuth();
  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/');
  }, [loading, isAuthenticated]);

  if (loading || !isAuthenticated) return null;

  return (
    <Tabs screenOptions={{ headerTitleAlign: 'center' }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size = 24, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size = 24, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
