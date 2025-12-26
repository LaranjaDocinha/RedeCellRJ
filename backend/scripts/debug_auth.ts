
import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web',
});

async function debugAuth() {
  try {
    const email = 'admin@pdv.com';
    const pass = 'admin123';
    
    const hash = await bcrypt.hash(pass, 10);
    console.log('Generated hash for admin123:', hash);

    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, email]);
    
    const res = await pool.query('SELECT password_hash FROM users WHERE email = $1', [email]);
    const dbHash = res.rows[0].password_hash;
    
    const match = await bcrypt.compare(pass, dbHash);
    console.log('Verification inside script for admin@pdv.com:', match ? 'SUCCESS' : 'FAILED');

    // Resetar o teste@teste.com também para garantir
    const testeHash = await bcrypt.hash('teste123', 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE email = 'teste@teste.com'", [testeHash]);
    const resTeste = await pool.query("SELECT password_hash FROM users WHERE email = 'teste@teste.com'");
    const matchTeste = await bcrypt.compare('teste123', resTeste.rows[0].password_hash);
    console.log('Verification inside script for teste@teste.com:', matchTeste ? 'SUCCESS' : 'FAILED');
    
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
debugAuth();
