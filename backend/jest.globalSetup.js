// backend/jest.globalSetup.js
const path = require('path'); // Import path module
require('dotenv').config({ path: path.join(__dirname, '.env.test') }); // Correct path

console.log('process.env in globalSetup:', process.env);

const { server } = require('./index'); // Import the server instance
const { initializePool, getPool } = require('./db'); // Import initializePool and getPool

module.exports = async () => {
  // Initialize the DB pool first
  initializePool();
  const pool = getPool(); // Get the initialized pool
  // Start the server
  await new Promise(resolve => {
    global.__SERVER__ = server.listen(5000, () => {
      console.log('Jest Global Setup: Backend server started on port 5000');
      resolve();
    });
  });

  // Ensure database connection is ready
  try {
    await pool.query('SELECT 1');
    console.log('Jest Global Setup: Database connected successfully.');
  } catch (error) {
    console.error('Jest Global Setup: Database connection failed:', error);
    process.exit(1); // Exit if DB connection fails
  }
};
