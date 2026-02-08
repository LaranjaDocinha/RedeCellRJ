import { render, screen } from '../test-utils/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { isBiometricSupported, registerBiometric, authenticateBiometric } from './biometricAuth';
import { TestProviders } from '../test-utils/TestProviders';

// Mock window.PublicKeyCredential and crypto for testing
const mockPublicKeyCredential = {
  isUserVerifyingPlatformAuthenticatorAvailable: vi.fn(),
};

const mockCrypto = {
  getRandomValues: vi.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = i; // Simple mock values
    }
  }),
};

Object.defineProperty(window, 'PublicKeyCredential', {
  writable: true,
  value: mockPublicKeyCredential,
});

Object.defineProperty(window, 'crypto', {
  writable: true,
  value: mockCrypto,
});

describe('biometricAuth', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    mockPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable.mockResolvedValue(true);
    mockCrypto.getRandomValues.mockClear();
    
    // Mock localStorage.setItem
    const mockLocalStorageItem = vi.fn();
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: mockLocalStorageItem,
        getItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });

    // Mock navigator.credentials.create and get
    Object.defineProperty(navigator, 'credentials', {
      value: {
        create: vi.fn(),
        get: vi.fn(),
      },
      writable: true,
    });
  });

  describe('isBiometricSupported', () => {
    it('should return true if platform authenticator is available', async () => {
      mockPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable.mockResolvedValue(true);
      const supported = await isBiometricSupported();
      expect(supported).toBe(true);
      expect(mockPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable).toHaveBeenCalled();
    });

    it('should return false if platform authenticator is not available', async () => {
      mockPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable.mockResolvedValue(false);
      const supported = await isBiometricSupported();
      expect(supported).toBe(false);
      expect(mockPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable).toHaveBeenCalled();
    });
  });

  describe('registerBiometric', () => {
    it('should register biometric successfully', async () => {
      const mockCredential = { id: new Uint8Array([1, 2, 3]) };
      navigator.credentials.create.mockResolvedValue(mockCredential);
      vi.spyOn(window.console, 'log').mockImplementation(() => {}); // Mock console.log

      const result = await registerBiometric('test@example.com');
      
      expect(result).toBe(true);
      expect(navigator.credentials.create).toHaveBeenCalled();
      expect(mockCrypto.getRandomValues).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalledWith('biometric_enabled', 'true');
    });

    it('should return false if registration fails', async () => {
      navigator.credentials.create.mockRejectedValue(new Error('Registration failed'));
      vi.spyOn(window.console, 'error').mockImplementation(() => {}); // Mock console.error

      const result = await registerBiometric('test@example.com');
      
      expect(result).toBe(false);
      expect(navigator.credentials.create).toHaveBeenCalled();
      expect(mockCrypto.getRandomValues).toHaveBeenCalled();
    });
  });

  describe('authenticateBiometric', () => {
    it('should authenticate biometric successfully', async () => {
      const mockAssertion = { response: { authenticatorData: new Uint8Array([1, 2, 3]) } };
      navigator.credentials.get.mockResolvedValue(mockAssertion);
      vi.spyOn(window.console, 'log').mockImplementation(() => {}); // Mock console.log

      const result = await authenticateBiometric();
      
      expect(result).toBe(true);
      expect(navigator.credentials.get).toHaveBeenCalled();
      expect(mockCrypto.getRandomValues).toHaveBeenCalled();
    });

    it('should return false if authentication fails', async () => {
      navigator.credentials.get.mockRejectedValue(new Error('Authentication failed'));
      vi.spyOn(window.console, 'error').mockImplementation(() => {}); // Mock console.error

      const result = await authenticateBiometric();
      
      expect(result).toBe(false);
      expect(navigator.credentials.get).toHaveBeenCalled();
      expect(mockCrypto.getRandomValues).toHaveBeenCalled();
    });
  });
});