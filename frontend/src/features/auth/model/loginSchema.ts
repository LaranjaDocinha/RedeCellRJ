import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  rememberMe: z.boolean().default(false),
  branchId: z.number().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
