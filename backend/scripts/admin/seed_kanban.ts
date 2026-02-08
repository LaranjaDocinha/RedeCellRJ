
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web',
});

async function seedKanban() {
  const client = await pool.connect();
  console.log('Seeding Kanban columns...');
  try {
    const columns = [
      { title: 'Aguardando Avaliação', position: 0, is_system: true, wip_limit: 10 },
      { title: 'Em Reparo', position: 1, is_system: false, wip_limit: 5 },
      { title: 'Aguardando Peça', position: 2, is_system: false, wip_limit: -1 },
      { title: 'Finalizado', position: 3, is_system: true, wip_limit: -1 },
    ];

    for (const col of columns) {
      await client.query(
        `INSERT INTO kanban_columns (title, position, is_system, wip_limit)
         VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
        [col.title, col.position, col.is_system, col.wip_limit]
      );
    }

    console.log('Kanban columns seeded successfully!');
  } catch (err) {
    console.error('Error seeding Kanban:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedKanban();
