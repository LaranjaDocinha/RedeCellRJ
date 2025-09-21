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
class RoleService {
    getAllRoles() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM roles');
            return result.rows;
        });
    }
    getRoleById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM roles WHERE id = $1', [id]);
            return result.rows[0];
        });
    }
    createRole(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = payload;
            try {
                const result = yield pool.query('INSERT INTO roles (name) VALUES ($1) RETURNING *', [name]);
                return result.rows[0];
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                if (error instanceof Error && error.code === '23505') { // Unique violation error code
                    throw new AppError('Role with this name already exists', 409);
                }
                throw error;
            }
        });
    }
    updateRole(id, payload) {
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
                const existingRole = yield this.getRoleById(id);
                if (!existingRole) {
                    return undefined; // No role found to update
                }
                return existingRole; // No fields to update, return existing role
            }
            values.push(id); // Add id for WHERE clause
            const query = `UPDATE roles SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
            try {
                const result = yield pool.query(query, values);
                return result.rows[0];
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                if (error instanceof Error && error.code === '23505') { // Unique violation error code
                    throw new AppError('Role with this name already exists', 409);
                }
                throw error;
            }
        });
    }
    deleteRole(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield pool.query('DELETE FROM roles WHERE id = $1 RETURNING id', [id]);
            return ((_a = result === null || result === void 0 ? void 0 : result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
        });
    }
    assignPermissionToRole(roleId, permissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pool.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)', [roleId, permissionId]);
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                if (error instanceof Error && error.code === '23505') { // Unique violation error code
                    throw new AppError('Permission already assigned to this role', 409);
                }
                throw error;
            }
        });
    }
    removePermissionFromRole(roleId, permissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield pool.query('DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2', [roleId, permissionId]);
            return ((_a = result === null || result === void 0 ? void 0 : result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
        });
    }
}
export const roleService = new RoleService();
