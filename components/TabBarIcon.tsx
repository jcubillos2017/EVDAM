import React from 'react';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  size?: number;
};

export function TabBarIcon({ name, color, size = 28 }: Props) {
  return <Ionicons name={name} color={color} size={size} style={{ marginBottom: -3 }} />;
}
