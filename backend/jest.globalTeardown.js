// backend/jest.globalTeardown.js
const { getPool } = require('./db'); // Import getPool

module.exports = async () => {
  // Close the server
  if (global.__SERVER__) {
    await new Promise(resolve => {
      global.__SERVER__.close(() => {
        console.log('Jest Global Teardown: Backend server closed.');
        resolve();
      });
    });
  }

  // End the database pool
  const pool = getPool(); // Get the initialized pool
    await pool.end();
    console.log('Jest Global Teardown: Database pool ended.');
  }
};
