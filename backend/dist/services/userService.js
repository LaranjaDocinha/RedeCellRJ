var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import pool from '../db/index.js';
import { authService } from './authService.js'; // Import authService for password hashing
import * as bcrypt from 'bcrypt';
export const userService = {
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const { rows } = yield pool.query('SELECT id, name, email, role FROM users ORDER BY name ASC');
            return rows;
        });
    },
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const { rows } = yield pool.query('SELECT id, name, email, role FROM users WHERE id = $1;', [id]);
            return rows[0];
        });
    },
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, role = 'user' } = userData;
            if (!password) {
                throw new Error('Password is required for user creation.');
            }
            const { user } = yield authService.register(name, email, password, role);
            return user;
        });
    },
    updateUser(id, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, role } = userData;
            const fields = [];
            const values = [];
            let paramIndex = 1;
            if (name !== undefined) {
                fields.push(`name = ${paramIndex++}`);
                values.push(name);
            }
            if (email !== undefined) {
                fields.push(`email = ${paramIndex++}`);
                values.push(email);
            }
            if (role !== undefined) {
                fields.push(`role = ${paramIndex++}`);
                values.push(role);
            }
            if (password !== undefined) {
                const password_hash = yield bcrypt.hash(password, 10);
                fields.push(`password_hash = ${paramIndex++}`);
                values.push(password_hash);
            }
            if (fields.length === 0)
                return this.getUserById(id); // Nothing to update
            values.push(id); // Add ID for WHERE clause
            const queryText = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ${paramIndex} RETURNING id, name, email, role;`;
            const { rows } = yield pool.query(queryText, values);
            return rows[0];
        });
    },
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield pool.query('DELETE FROM users WHERE id = $1;', [id]);
            return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
        });
    },
};
