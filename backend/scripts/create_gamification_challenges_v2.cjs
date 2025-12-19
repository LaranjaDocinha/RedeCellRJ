const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Creating gamification tables (Fixed UUID)...");
    
    // Checking users table id type to be sure, but error said UUID vs Integer mismatch.
    // user_challenge_progress.user_id must be UUID if users.id is UUID.
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS gamification_challenges (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        metric VARCHAR(50) NOT NULL, 
        target_value NUMERIC(10,2) NOT NULL,
        reward_xp INTEGER NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_challenge_progress (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id), -- Fixed: Changed to UUID
        challenge_id INTEGER NOT NULL REFERENCES gamification_challenges(id),
        current_value NUMERIC(10,2) DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(user_id, challenge_id)
      );
    `);
    console.log("Gamification tables created!");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.end();
  }
}

run();
