const pg = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function fixPassword() {
  try {
    console.log('Gerando hash BCrypt para a senha...');
    const saltRounds = 10;
    const plainPassword = 'admin123';
    const hash = await bcrypt.hash(plainPassword, saltRounds);

    console.log('Atualizando usuário Admin no banco...');
    
    // Atualiza o password_hash do Admin
    const result = await pool.query(
      "UPDATE users SET password_hash = $1 WHERE email = 'admin@pdv.com' RETURNING id;",
      [hash]
    );

    if (result.rowCount > 0) {
      console.log('✅ Senha do Admin atualizada com sucesso!');
    } else {
      console.log('⚠️ Usuário admin@pdv.com não encontrado. Criando novo...');
      await pool.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES ('Admin', 'admin@pdv.com', $1, 'admin');",
        [hash]
      );
      console.log('✅ Usuário Admin criado com sucesso!');
    }

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

fixPassword();
