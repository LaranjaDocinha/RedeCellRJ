// Tipos compartilhados entre Frontend e Backend
// Idealmente, este arquivo estaria em um pacote 'shared' em um Monorepo.

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier';
  created_at: string; // Datas serializadas como string no JSON
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
