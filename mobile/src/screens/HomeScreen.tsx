import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { Camera } from 'expo-camera';
import { useAuth } from '../context/AuthContext';
import { registerForPushNotificationsAsync } from '../services/notificationService';
import { Title } from 'react-native-paper';

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const { signOut, user } = useAuth();

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
    
    registerForPushNotificationsAsync().then(token => {
        if (token) {
             // TODO: Send token to backend
             console.log('Push Token:', token);
        }
    });
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    alert(`Código de barras tipo ${type} e dados ${data} escaneado!`);
    // TODO: Call backend to fetch Order or Product
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Solicitando permissão de câmera...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>Sem acesso à câmera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Olá, {user?.name}</Title>
      
      <View style={styles.cameraContainer}>
        <Camera
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
        />
      </View>
      
      {scanned && <Button title={'Escanear Novamente'} onPress={() => setScanned(false)} />}
      
      <View style={styles.footer}>
        <Button title="Sair" onPress={signOut} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20,
    marginTop: 30, 
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#000',
    minHeight: 300,
  },
  footer: {
    marginTop: 20,
  }
});
