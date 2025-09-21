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
class BranchService {
    getAllBranches() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM branches');
            return result.rows;
        });
    }
    getBranchById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM branches WHERE id = $1', [id]);
            return result.rows[0];
        });
    }
    createBranch(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, address, phone, email } = payload;
            try {
                const result = yield pool.query('INSERT INTO branches (name, address, phone, email) VALUES ($1, $2, $3, $4) RETURNING *', [name, address, phone, email]);
                return result.rows[0];
            }
            catch (error) {
                if (error.code === '23505') { // Unique violation error code
                    throw new AppError('Branch with this name already exists', 409);
                }
                throw error;
            }
        });
    }
    updateBranch(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, address, phone, email } = payload;
            const fields = [];
            const values = [];
            let paramIndex = 1;
            if (name !== undefined) {
                fields.push(`name = $${paramIndex++}`);
                values.push(name);
            }
            if (address !== undefined) {
                fields.push(`address = $${paramIndex++}`);
                values.push(address);
            }
            if (phone !== undefined) {
                fields.push(`phone = $${paramIndex++}`);
                values.push(phone);
            }
            if (email !== undefined) {
                fields.push(`email = $${paramIndex++}`);
                values.push(email);
            }
            if (fields.length === 0) {
                const existingBranch = yield this.getBranchById(id);
                if (!existingBranch) {
                    return undefined; // No branch found to update
                }
                return existingBranch; // No fields to update, return existing branch
            }
            values.push(id); // Add id for WHERE clause
            const query = `UPDATE branches SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
            try {
                const result = yield pool.query(query, values);
                return result.rows[0];
            }
            catch (error) {
                if (error.code === '23505') { // Unique violation error code
                    throw new AppError('Branch with this name already exists', 409);
                }
                throw error;
            }
        });
    }
    deleteBranch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield pool.query('DELETE FROM branches WHERE id = $1 RETURNING id', [id]);
            return ((_a = result === null || result === void 0 ? void 0 : result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
        });
    }
}
export const branchService = new BranchService();
