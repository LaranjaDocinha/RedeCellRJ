const { Client } = require('pg');
require('dotenv').config(); // Ensure dotenv is loaded

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not defined. Please check your .env file.");
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function nuke() {
  try {
    console.log("Connecting to database...");
    await client.connect();
    console.log("Dropping public schema...");
    await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
    console.log("Granting permissions...");
    await client.query("GRANT ALL ON SCHEMA public TO postgres;"); // Ensure owner has access
    await client.query("GRANT ALL ON SCHEMA public TO public;");
    console.log("Database Nuked Successfully! 💥");
  } catch (e) {
    console.error("Error nuking database:", e);
    process.exit(1);
  } finally {
    await client.end();
  }
}

nuke();