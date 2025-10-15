// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '../../components/HapticTab';
import { IconSymbol } from '../../components/ui/IconSymbol';
import TabBarBackground from '../../components/ui/TabBarBackground';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
// 1. Import the provider and hook
import { LanguageProvider, useLanguage } from '../context/LanguageContext'; 

// New component to handle the translation of tab titles
function TranslatedTabLayout() {
  // 2. Use the hook to access the translation function
  const { t } = useLanguage();
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {
            // Added background color to ensure consistency if blur is not desired
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          // 3. Translate the tab title
          title: t('Dashboard'), 
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="live-connect"
        options={{
          // 3. Translate the tab title
          title: t('Live Connect'), 
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="antenna.radiowaves.left.and.right" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          // 3. Translate the tab title
          title: t('History'), 
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.line.uptrend.xyaxis" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai-chat"
        options={{
          // 3. Translate the tab title
          title: t('AI Chat'), 
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          // 3. Translate the tab title
          title: t('About'), 
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="info.circle.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}


export default function TabLayout() {
    // 4. Wrap the TranslatedTabLayout with the LanguageProvider
    // Create the context folder and LanguageContext.tsx first!
    return (
        <LanguageProvider>
            <TranslatedTabLayout />
        </LanguageProvider>
    )
}