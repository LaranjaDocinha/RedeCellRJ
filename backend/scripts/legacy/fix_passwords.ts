
import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web',
});

async function fix() {
  try {
    const saltRounds = 10;
    const adminHash = await bcrypt.hash('admin123', saltRounds);
    const testeHash = await bcrypt.hash('teste123', saltRounds);

    console.log('Updating admin@pdv.com...');
    await pool.query(
      "INSERT INTO users (id, name, email, password_hash, role) VALUES ('1aa9e5c2-4e4f-4a48-a661-e53a51f1592d', 'Admin User', 'admin@pdv.com', $1, 'admin') ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash",
      [adminHash]
    );

    console.log('Updating teste@teste.com...');
    await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ('Teste User', 'teste@teste.com', $1, 'user') ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash",
      [testeHash]
    );

    console.log('Done!');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
fix();
