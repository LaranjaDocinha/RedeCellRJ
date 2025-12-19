import { describe, it, expect } from 'vitest';
import bcrypt from 'bcrypt';
describe('Bcrypt Hashing', () => {
    it('should correctly hash and compare passwords', () => {
        const password = 'admin123';
        const hashedPassword = bcrypt.hashSync(password, 10);
        expect(hashedPassword).toBeDefined();
        expect(hashedPassword.length).toBeGreaterThan(0);
        expect(hashedPassword).not.toBe(password);
        const isMatch = bcrypt.compareSync(password, hashedPassword);
        expect(isMatch).toBe(true);
        const isNotMatch = bcrypt.compareSync('wrongpassword', hashedPassword);
        expect(isNotMatch).toBe(false);
    });
});
