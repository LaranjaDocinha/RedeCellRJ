const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function checkPermissions() {
  try {
    console.log('--- Verificando Permissões do Admin ---');
    const { rows } = await pool.query(`
      SELECT p.action, p.subject 
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN user_roles ur ON rp.role_id = ur.role_id
      JOIN users u ON ur.user_id = u.id
      WHERE u.email = 'admin@pdv.com'
    `);
    
    const perms = rows.map(r => r.action + ':' + r.subject);
    console.log('Total de permissões:', perms.length);
    console.log('Primeiras 10:', perms.slice(0, 10).join(', '));
    
    const hasReturn = rows.some(r => r.subject === 'Return');
    console.log('Tem alguma permissão para Return?', hasReturn);
    if (hasReturn) {
        console.log('Ações permitidas para Return:', rows.filter(r => r.subject === 'Return').map(r => r.action).join(', '));
    }

  } catch (err) {
    console.error('Erro no diagnóstico:', err.message);
  } finally {
    await pool.end();
  }
}

checkPermissions();