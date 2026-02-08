import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestInterceptor, responseErrorInterceptor } from './apiInterceptors';
import { InternalAxiosRequestConfig } from 'axios';

describe('API Interceptors (Atomic Tests)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    
    // Mock window.location
    const originalLocation = window.location;
    // @ts-ignore
    delete window.location;
    window.location = { ...originalLocation, href: '', pathname: '/' };
  });

  it('should inject Authorization header if token exists', () => {
    localStorage.setItem('token', 'my-secret-token');
    
    const mockConfig = {
      headers: {
        set: vi.fn(),
        get: vi.fn(),
        has: vi.fn(),
        delete: vi.fn(),
        toJSON: vi.fn(),
      }
    } as any;

    const result = requestInterceptor(mockConfig);

    expect(result.headers.Authorization).toBe('Bearer my-secret-token');
  });

  it('should generate Idempotency-Key for POST requests', () => {
    const mockConfig = {
      method: 'post',
      headers: {}
    } as any;

    const result = requestInterceptor(mockConfig);

    expect(result.headers['Idempotency-Key']).toBeDefined();
  });

  it('should clear storage on 401 error response', async () => {
    localStorage.setItem('token', 'expired');
    const mockError = {
      response: { status: 401 }
    };

    await expect(responseErrorInterceptor(mockError)).rejects.toEqual(mockError);
    expect(localStorage.getItem('token')).toBeNull();
  });
});
