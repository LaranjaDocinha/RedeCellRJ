const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Creating customer_journeys table...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_journeys (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        trigger_segment VARCHAR(50) NOT NULL, -- RFM Segment like 'Champions', 'At Risk'
        action_type VARCHAR(50) NOT NULL, -- 'email', 'whatsapp_message', 'push_notification'
        template_id VARCHAR(100), -- ID of email template, WhatsApp message template, etc.
        delay_days INTEGER DEFAULT 0, -- Delay before sending action after trigger
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customer_journey_actions (
        id SERIAL PRIMARY KEY,
        customer_id UUID NOT NULL REFERENCES customers(id),
        journey_id INTEGER NOT NULL REFERENCES customer_journeys(id),
        action_type VARCHAR(50) NOT NULL,
        template_id VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
        scheduled_at TIMESTAMP WITH TIME ZONE,
        sent_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(customer_id, journey_id) -- A customer only goes through a specific journey once until reset
      );
    `);
    console.log("Tables customer_journeys and customer_journey_actions created!");
  } catch (e) {
    console.error("Error creating tables:", e);
  } finally {
    await client.end();
  }
}

run();
