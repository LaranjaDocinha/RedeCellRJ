const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Creating marketplace tables...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS marketplace_integrations (
        id SERIAL PRIMARY KEY,
        platform VARCHAR(50) NOT NULL UNIQUE, -- 'shopee', 'mercadolivre'
        api_key VARCHAR(255),
        api_secret VARCHAR(255),
        access_token TEXT,
        refresh_token TEXT,
        token_expires_at TIMESTAMP WITH TIME ZONE,
        shop_id VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS external_listings (
        id SERIAL PRIMARY KEY,
        product_variation_id INTEGER NOT NULL REFERENCES product_variations(id),
        integration_id INTEGER NOT NULL REFERENCES marketplace_integrations(id),
        external_id VARCHAR(100) NOT NULL, -- ID do produto na Shopee/ML
        external_sku VARCHAR(100),
        price NUMERIC(10,2),
        stock_quantity INTEGER,
        status VARCHAR(50), -- 'active', 'inactive', 'synced'
        last_synced_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(product_variation_id, integration_id)
      );
    `);
    console.log("Marketplace tables created!");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.end();
  }
}

run();
