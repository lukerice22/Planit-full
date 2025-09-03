import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      // Remove the native tab bar completely (we use our custom <Nav />)
      tabBar={() => null}
      screenOptions={{
        headerShown: false,
        // You can still keep colors for nested headers etc. if needed
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}
    >
      <Tabs.Screen
        name="index"   // -> /(tabs)
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="explore" // -> /(tabs)/explore
        options={{ title: 'Explore' }}
      />
      {/*
        If your Pins screen lives inside (tabs), keep it registered too:
        <Tabs.Screen name="pins" options={{ title: 'Pins' }} />
      */}
    </Tabs>
  );
}