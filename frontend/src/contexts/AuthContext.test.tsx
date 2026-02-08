import { render, screen, act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import * as Sentry from '@sentry/react';

vi.mock('@sentry/react', () => ({
  setUser: vi.fn(),
  setTag: vi.fn(),
}));

// Mock BroadcastChannel
class BroadcastChannelMock {
  name: string;
  onmessage: ((this: BroadcastChannel, ev: MessageEvent) => any) | null = null;
  constructor(name: string) { this.name = name; }
  postMessage(message: any) {}
  addEventListener(type: string, listener: any) {}
  removeEventListener(type: string, listener: any) {}
  close() {}
}
global.BroadcastChannel = BroadcastChannelMock as any;

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  const mockUser = { id: '1', name: 'Admin', email: 'admin@test.com' };
  const mockToken = 'fake-jwt-token';

  it('should start with loading and no user', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login and persist user data in localStorage when rememberMe is true', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login(mockUser as any, mockToken, true);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('user')).toContain('Admin');
    expect(Sentry.setUser).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });

  it('should login and persist user data in sessionStorage when rememberMe is false', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login(mockUser as any, mockToken, false);
    });

    expect(sessionStorage.getItem('user')).toContain('Admin');
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should logout and clear all storage', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login(mockUser as any, mockToken, true);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(sessionStorage.getItem('user')).toBeNull();
    expect(Sentry.setUser).toHaveBeenCalledWith(null);
  });
});
