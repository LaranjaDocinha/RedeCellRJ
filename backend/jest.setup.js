// backend/jest.setup.js
const { initializePool } = require('./db'); // Import initializePool

beforeAll(async () => {
  initializePool(); // Initialize the DB pool
});
