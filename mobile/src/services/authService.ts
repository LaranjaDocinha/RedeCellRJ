import api from './api';
import * as SecureStore from 'expo-secure-store';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password, rememberMe: true });
  const { user, accessToken } = response.data;
  
  await SecureStore.setItemAsync('token', accessToken);
  await SecureStore.setItemAsync('user', JSON.stringify(user));
  
  return { user, accessToken };
};

export const logout = async () => {
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('user');
};

export const getToken = async () => {
  return await SecureStore.getItemAsync('token');
};

export const getUser = async () => {
    const userStr = await SecureStore.getItemAsync('user');
    return userStr ? JSON.parse(userStr) : null;
};
