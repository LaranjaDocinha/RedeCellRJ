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
import { AppError } from '../utils/errors.js';
class PermissionService {
    getAllPermissions() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM permissions');
            return result.rows;
        });
    }
    getPermissionById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM permissions WHERE id = $1', [id]);
            return result.rows[0];
        });
    }
    createPermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = payload;
            try {
                const result = yield pool.query('INSERT INTO permissions (name) VALUES ($1) RETURNING *', [name]);
                return result.rows[0];
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                if (error instanceof Error && error.code === '23505') { // Unique violation error code
                    throw new AppError('Permission with this name already exists', 409);
                }
                throw error;
            }
        });
    }
    updatePermission(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = payload;
            const fields = [];
            const values = [];
            let paramIndex = 1;
            if (name !== undefined) {
                fields.push(`name = $${paramIndex++}`);
                values.push(name);
            }
            if (fields.length === 0) {
                const existingPermission = yield this.getPermissionById(id);
                if (!existingPermission) {
                    return undefined; // No permission found to update
                }
                return existingPermission; // No fields to update, return existing permission
            }
            values.push(id); // Add id for WHERE clause
            const query = `UPDATE permissions SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
            try {
                const result = yield pool.query(query, values);
                return result.rows[0];
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                if (error instanceof Error && error.code === '23505') { // Unique violation error code
                    throw new AppError('Permission with this name already exists', 409);
                }
                throw error;
            }
        });
    }
    deletePermission(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield pool.query('DELETE FROM permissions WHERE id = $1 RETURNING id', [id]);
            return ((_a = result === null || result === void 0 ? void 0 : result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
        });
    }
}
export const permissionService = new PermissionService();
