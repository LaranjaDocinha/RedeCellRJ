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
class SettingsService {
    getAllSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM settings');
            return result.rows;
        });
    }
    getSettingByKey(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM settings WHERE key = $1', [key]);
            return result.rows[0];
        });
    }
    createSetting(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, value, description } = payload;
            try {
                const result = yield pool.query('INSERT INTO settings (key, value, description) VALUES ($1, $2, $3) RETURNING *', [key, value, description]);
                return result.rows[0];
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                if (error instanceof Error && error.code === '23505') { // Unique violation error code
                    throw new AppError('Setting with this key already exists', 409);
                }
                throw error;
            }
        });
    }
    updateSetting(key, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { value, description } = payload;
            const fields = [];
            const values = [];
            let paramIndex = 1;
            if (value !== undefined) {
                fields.push(`value = $${paramIndex++}`);
                values.push(value);
            }
            if (description !== undefined) {
                fields.push(`description = $${paramIndex++}`);
                values.push(description);
            }
            if (fields.length === 0) {
                const existingSetting = yield this.getSettingByKey(key);
                if (!existingSetting) {
                    return undefined; // No setting found to update
                }
                return existingSetting; // No fields to update, return existing setting
            }
            values.push(key); // Add key for WHERE clause
            const query = `UPDATE settings SET ${fields.join(', ')}, updated_at = current_timestamp WHERE key = $${paramIndex} RETURNING *`;
            try {
                const result = yield pool.query(query, values);
                return result.rows[0];
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                if (error instanceof Error && error.code === '23505') { // Unique violation error code
                    throw new AppError('Setting with this key already exists', 409);
                }
                throw error;
            }
        });
    }
    deleteSetting(key) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield pool.query('DELETE FROM settings WHERE key = $1 RETURNING key', [key]);
            return ((_a = result === null || result === void 0 ? void 0 : result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
        });
    }
}
export const settingsService = new SettingsService();
