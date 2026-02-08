import api from '../../../services/api';
import { LoginFormData } from '../model/loginSchema';

export const loginApi = async (data: LoginFormData) => {
  const response = await api.post('v1/auth/login', data);
  return response.data;
};
