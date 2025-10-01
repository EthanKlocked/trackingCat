import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/presentation/contexts/AppProvider';
import { WalkScreen } from './src/presentation/screens';

export default function App() {
  return (
    <AppProvider>
      <WalkScreen />
      <StatusBar style="auto" />
    </AppProvider>
  );
}
