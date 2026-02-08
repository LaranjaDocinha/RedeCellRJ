import api from '../services/api';
import { LoginContract, ProductContract } from './contracts';
import { z } from 'zod';

export const sdk = {
  auth: {
    login: async (data: z.infer<typeof LoginContract.input>) => {
      // Input validation before sending (Shift Left)
      LoginContract.input.parse(data);
      const response = await api.post('/api/v1/auth/login', data);
      // Output validation (Contract enforcement)
      return LoginContract.output.parse(response.data);
    }
  },
  products: {
    list: async () => {
      const response = await api.get('/api/v1/products');
      return ProductContract.listOutput.parse(response.data);
    }
  }
};
