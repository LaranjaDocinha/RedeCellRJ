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
class SupplierService {
    getAllSuppliers() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM suppliers');
            return result.rows;
        });
    }
    getSupplierById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
            return result.rows[0];
        });
    }
    createSupplier(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, contact_person, email, phone, address } = payload;
            try {
                const result = yield pool.query('INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, contact_person, email, phone, address]);
                return result.rows[0];
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                if (error instanceof Error && error.code === '23505') { // Unique violation error code
                    if (error.detail.includes('name')) {
                        throw new AppError('Supplier with this name already exists', 409);
                    }
                    else if (error.detail.includes('email')) {
                        throw new AppError('Supplier with this email already exists', 409);
                    }
                }
                throw error;
            }
        });
    }
    updateSupplier(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, contact_person, email, phone, address } = payload;
            const fields = [];
            const values = [];
            let paramIndex = 1;
            if (name !== undefined) {
                fields.push(`name = $${paramIndex++}`);
                values.push(name);
            }
            if (contact_person !== undefined) {
                fields.push(`contact_person = $${paramIndex++}`);
                values.push(contact_person);
            }
            if (email !== undefined) {
                fields.push(`email = $${paramIndex++}`);
                values.push(email);
            }
            if (phone !== undefined) {
                fields.push(`phone = $${paramIndex++}`);
                values.push(phone);
            }
            if (address !== undefined) {
                fields.push(`address = $${paramIndex++}`);
                values.push(address);
            }
            if (fields.length === 0) {
                const existingSupplier = yield this.getSupplierById(id);
                if (!existingSupplier) {
                    return undefined; // No supplier found to update
                }
                return existingSupplier; // No fields to update, return existing supplier
            }
            values.push(id); // Add id for WHERE clause
            const query = `UPDATE suppliers SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
            try {
                const result = yield pool.query(query, values);
                return result.rows[0];
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                if (error instanceof Error && error.code === '23505') { // Unique violation error code
                    if (error.detail.includes('name')) {
                        throw new AppError('Supplier with this name already exists', 409);
                    }
                    else if (error.detail.includes('email')) {
                        throw new AppError('Supplier with this email already exists', 409);
                    }
                }
                throw error;
            }
        });
    }
    deleteSupplier(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING id', [id]);
            return ((_a = result === null || result === void 0 ? void 0 : result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
        });
    }
}
export const supplierService = new SupplierService();
