import { z } from 'zod';

// Contract definitions
export const LoginContract = {
  input: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
  output: z.object({
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.string(),
    }),
    accessToken: z.string(),
  }),
};

export const ProductContract = {
  listOutput: z.array(z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
    stock_quantity: z.number(),
  })),
};
