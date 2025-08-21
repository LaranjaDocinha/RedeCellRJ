const { Pool } = require('pg');
const Redis = require('ioredis');

let pool; // Declare pool, but don't initialize immediately

function initializePool() {
  if (!pool) { // Initialize only if not already initialized
    pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });
    console.log('DB Pool initialized.');
  }
  return pool;
}

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('connect', () => console.log('Conectado ao Redis!'));
redisClient.on('error', (err) => console.error('Erro de conexão com Redis:', err));

module.exports = {
  initializePool,
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  redisClient,
  getPool: () => pool,
};