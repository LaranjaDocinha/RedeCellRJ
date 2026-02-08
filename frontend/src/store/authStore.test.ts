import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('AuthStore (Zustand)', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  const mockUser = {
    id: '1',
    name: 'Admin',
    email: 'admin@test.com',
    role: 'admin',
    permissions: [{ action: 'read', subject: 'Products' }]
  };

  it('should set auth data correctly', () => {
    useAuthStore.getState().setAuth(mockUser as any, 'token-123');
    
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('token-123');
  });

  it('should logout and clear state', () => {
    useAuthStore.getState().setAuth(mockUser as any, 'token-123');
    useAuthStore.getState().logout();
    
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('should check permissions correctly', () => {
    useAuthStore.getState().setAuth(mockUser as any, 'token-123');
    
    expect(useAuthStore.getState().hasPermission('read', 'Products')).toBe(true);
    expect(useAuthStore.getState().hasPermission('write', 'Products')).toBe(false);
  });

  it('should allow everything if subject is all', () => {
    const godUser = { 
        ...mockUser, 
        permissions: [{ action: 'manage', subject: 'all' }] 
    };
    useAuthStore.getState().setAuth(godUser as any, 'token');
    
    expect(useAuthStore.getState().hasPermission('anything', 'anywhere')).toBe(true);
  });
});
