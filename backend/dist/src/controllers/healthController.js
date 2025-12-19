import { getPool } from '../db';
export const healthController = {
    async check(req, res) {
        try {
            const pool = getPool();
            // Verifica DB
            await pool.query('SELECT 1');
            const healthcheck = {
                uptime: process.uptime(),
                message: 'OK',
                timestamp: Date.now(),
                services: {
                    database: 'connected',
                }
            };
            res.send(healthcheck);
        }
        catch (error) {
            healthcheck: {
                const healthcheck = {
                    uptime: process.uptime(),
                    message: 'ERROR',
                    timestamp: Date.now(),
                    error: error
                };
                res.status(503).send(healthcheck);
            }
        }
    }
};
