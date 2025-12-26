export interface User {
  id: string; // Changed to string to match backend UUID
  name: string;
  email: string;
  role: string;
  permissions?: any[]; // permissions array
  theme_preference?: 'light' | 'dark'; // Added theme preference
}
