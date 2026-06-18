import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { AppColors } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppColors.accent,
        tabBarInactiveTintColor: AppColors.textMuted,
        tabBarStyle: {
          backgroundColor: AppColors.surface,
          borderTopColor: AppColors.border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="football-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
