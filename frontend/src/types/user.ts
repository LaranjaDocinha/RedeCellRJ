import { UserId } from './branded';

export interface User {
  id: UserId; 
  name: string;
  email: string;
  role: string;
  permissions?: any[]; // permissions array
  theme_preference?: 'light' | 'dark'; // Added theme preference
}