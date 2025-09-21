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
const DEFAULT_DASHBOARD_SETTINGS = {
    widgets: [
        { id: 'totalSales', visible: true, order: 0 },
        { id: 'salesByMonthChart', visible: true, order: 1 },
        { id: 'topSellingProductsChart', visible: true, order: 2 },
    ],
};
export const getSettings = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const { rows } = yield pool.query('SELECT settings FROM user_dashboard_settings WHERE user_id = $1', [userId]);
    if (rows.length > 0) {
        return rows[0].settings;
    }
    else {
        // If no settings exist, return default and create an entry for the user
        yield pool.query('INSERT INTO user_dashboard_settings (user_id, settings) VALUES ($1, $2)', [userId, DEFAULT_DASHBOARD_SETTINGS]);
        return DEFAULT_DASHBOARD_SETTINGS;
    }
});
export const updateSettings = (userId, newSettings) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield pool.connect();
    try {
        yield client.query('BEGIN');
        const { rows } = yield client.query('UPDATE user_dashboard_settings SET settings = $1, updated_at = NOW() WHERE user_id = $2 RETURNING settings', [newSettings, userId]);
        if (rows.length === 0) {
            // If no entry existed, create one (this case should ideally be handled by getSettings first)
            const { rows: newEntry } = yield client.query('INSERT INTO user_dashboard_settings (user_id, settings) VALUES ($1, $2) RETURNING settings', [userId, newSettings]);
            yield client.query('COMMIT');
            return newEntry[0].settings;
        }
        yield client.query('COMMIT');
        return rows[0].settings;
    }
    catch (e) {
        yield client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
});
