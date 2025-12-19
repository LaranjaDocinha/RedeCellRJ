import { Pool } from 'pg';
import 'dotenv/config';
let pool;
// This function allows the test setup to inject a specific pool.
export function setPool(newPool) {
    if (pool) {
        pool.end(); // Close the old pool if it exists
    }
    pool = newPool;
}
// This function gets the pool, creating it if it doesn't exist.
export function getPool() {
    if (!pool) {
        console.log('Creating new production/development pool.');
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            // Add other production configurations here if needed
        });
        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }
    return pool;
}
// Export a default instance for convenience in the app,
// but tests should rely on getPool() after setPool() has been called.
export default {
    query: (text, params) => getPool().query(text, params),
    connect: () => getPool().connect(),
};
