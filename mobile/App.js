import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import Routes from './src/navigation/Routes';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <Routes />
        <StatusBar style="auto" />
      </AuthProvider>
    </PaperProvider>
  );
}