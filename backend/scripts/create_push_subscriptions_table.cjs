const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Creating user_push_subscriptions table...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_push_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id),
        subscription JSONB NOT NULL, -- Stores PushSubscription object
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, subscription) -- Ensure a user doesn't have duplicate subscriptions
      );
    `);
    console.log("Table user_push_subscriptions created!");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.end();
  }
}

run();
