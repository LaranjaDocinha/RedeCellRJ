import { describe, it, expect, vi } from 'vitest';
import { passwordUtils } from '../../../src/utils/passwordUtils.js';
import argon2 from 'argon2';
import bcrypt from 'bcrypt';

describe('passwordUtils', () => {
  const password = 'mySecretPassword';

  describe('hash', () => {
    it('should hash password using argon2', async () => {
      const hash = await passwordUtils.hash(password);
      expect(hash).toContain('$argon2id$');
    });
  });

  describe('verify', () => {
    it('should verify argon2 hash successfully', async () => {
      const hash = await passwordUtils.hash(password);
      const isValid = await passwordUtils.verify(password, hash);
      expect(isValid).toBe(true);
    });

    it('should verify bcrypt hash successfully (legacy support)', async () => {
      const legacyHash = await bcrypt.hash(password, 10);
      const isValid = await passwordUtils.verify(password, legacyHash);
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const hash = await passwordUtils.hash(password);
      const isValid = await passwordUtils.verify('wrongPassword', hash);
      expect(isValid).toBe(false);
    });

    it('should return false for empty hash', async () => {
      const isValid = await passwordUtils.verify(password, '');
      expect(isValid).toBe(false);
    });

    it('should return false and log error if argon2 verify fails', async () => {
      const hash = '$argon2id$v=19$m=65536,t=3,p=1$invalid';
      const isValid = await passwordUtils.verify(password, hash);
      expect(isValid).toBe(false);
    });

    it('should return false and log error if bcrypt compare fails', async () => {
      const hash = '$2b$10$invalid';
      const isValid = await passwordUtils.verify(password, hash);
      expect(isValid).toBe(false);
    });
  });

  describe('needsRehash', () => {
    it('should return true for bcrypt hashes', async () => {
      const legacyHash = await bcrypt.hash(password, 10);
      expect(passwordUtils.needsRehash(legacyHash)).toBe(true);
    });

    it('should return false for argon2 hashes', async () => {
      const hash = await passwordUtils.hash(password);
      expect(passwordUtils.needsRehash(hash)).toBe(false);
    });
  });
});
