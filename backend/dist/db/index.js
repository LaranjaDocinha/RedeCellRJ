import { Pool } from 'pg';
// This configuration is now more robust.
// It prioritizes the DATABASE_URL connection string if it exists,
// otherwise it falls back to individual environment variables.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // The following are used if DATABASE_URL is not set
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'pdv_web',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});
export const query = (text, params) => pool.query(text, params);
export default pool;
