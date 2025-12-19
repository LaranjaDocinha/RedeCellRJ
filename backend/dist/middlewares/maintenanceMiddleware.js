import { getPool } from '../db/index.js';
const maintenanceMiddleware = async (req, res, next) => {
    try {
        // Allow access to maintenance routes even in maintenance mode
        if (req.path.startsWith('/api/maintenance')) {
            return next();
        }
        const pool = getPool();
        const result = await pool.query("SELECT value FROM settings WHERE key = 'maintenance_mode_enabled'");
        const isEnabled = result.rows[0]?.value === 'true';
        if (isEnabled) {
            return res
                .status(503)
                .json({ message: 'Service Unavailable: System is currently under maintenance.' });
        }
        next();
    }
    catch (error) {
        console.error('Error in maintenance middleware:', error);
        next(error);
    }
};
export default maintenanceMiddleware;
