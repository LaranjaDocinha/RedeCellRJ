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
class TagService {
    getAllTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM tags');
            return result.rows;
        });
    }
    getTagById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM tags WHERE id = $1', [id]);
            return result.rows[0];
        });
    }
    createTag(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = payload;
            try {
                const result = yield pool.query('INSERT INTO tags (name) VALUES ($1) RETURNING *', [name]);
                return result.rows[0];
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                if (error instanceof Error && error.code === '23505') { // Unique violation error code
                    throw new AppError('Tag with this name already exists', 409);
                }
                throw error;
            }
        });
    }
    updateTag(id, payload) {
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
                const existingTag = yield this.getTagById(id);
                if (!existingTag) {
                    return undefined; // No tag found to update
                }
                return existingTag; // No fields to update, return existing tag
            }
            values.push(id); // Add id for WHERE clause
            const query = `UPDATE tags SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
            try {
                const result = yield pool.query(query, values);
                return result.rows[0];
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                if (error instanceof Error && error.code === '23505') { // Unique violation error code
                    throw new AppError('Tag with this name already exists', 409);
                }
                throw error;
            }
        });
    }
    deleteTag(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield pool.query('DELETE FROM tags WHERE id = $1 RETURNING id', [id]);
            return ((_a = result === null || result === void 0 ? void 0 : result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
        });
    }
}
export const tagService = new TagService();
