import { Tabs } from 'expo-router';
//import { TabBarIcon } from '../../components/TabBarIcon';
import React from 'react';
//import Ionicons from '@expo/vector-icons/Ionicons';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint, headerShown: false, tabBarButton: HapticTab, }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,}}/> 
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ color}) => <IconSymbol size={28} name="person.fill" color={color} />,}} />
      {/*<Tabs screenOptions={{ headerTitleAlign: 'center' }}> */}
      {/*<Tabs.Screen name="home" options={{ title: 'Home' }} /> */}
      
      
    </Tabs>
  );
}
