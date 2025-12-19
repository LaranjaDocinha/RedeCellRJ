import { getPool } from '../db/index.js';
export const getHealthStatus = async (req, res) => {
    const health = {
        api: 'UP',
        database: 'UP',
        // Add other services here
    };
    try {
        const pool = getPool();
        await pool.query('SELECT 1'); // Check database connection
    }
    catch (error) {
        console.error('Database health check failed:', error);
        health.database = 'DOWN';
    }
    if (health.api === 'UP' && health.database === 'UP') {
        res.status(200).json(health);
    }
    else {
        res.status(500).json(health);
    }
};
