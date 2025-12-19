"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = getPool;
const pg_1 = require("pg");
require("dotenv/config");
let pool;
function getPool() {
    if (!pool) {
        console.log('Creating new pool for Reports Microservice.');
        pool = new pg_1.Pool({
            connectionString: process.env.DATABASE_URL,
        });
        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }
    return pool;
}
