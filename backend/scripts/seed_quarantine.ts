
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { faker } from '@faker-js/faker';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web',
});

async function seedQuarantine() {
  const client = await pool.connect();
  console.log('Seeding quarantine items...');
  try {
    // Buscar produtos e variações existentes para vincular
    const productsRes = await client.query('SELECT id FROM products LIMIT 5');
    const variationsRes = await client.query('SELECT id FROM product_variations LIMIT 5');
    const usersRes = await client.query('SELECT id FROM users LIMIT 1');

    if (productsRes.rows.length === 0) {
      console.log('No products found. Please run the main seed script first.');
      return;
    }

    const userId = usersRes.rows[0]?.id;

    const items = [
      {
        product_id: productsRes.rows[0].id,
        variation_id: variationsRes.rows[0]?.id,
        quantity: 1,
        reason: 'Tela com listras verticais',
        status: 'Pending',
        is_battery_risk: false,
        item_cost: 1850.00,
        physical_location: 'Gaveta A1',
        supplier_id: 1, // Assumindo ID 1 do seed principal
        warranty_expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 dias
      },
      {
        product_id: productsRes.rows[1].id,
        variation_id: variationsRes.rows[1]?.id,
        quantity: 1,
        reason: 'Bateria inchada / Superaquecimento',
        status: 'Pending',
        is_battery_risk: true,
        item_cost: 140.00,
        physical_location: 'Caixa de Segurança 01',
        supplier_id: 1,
        warranty_expiry_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Vencida
      },
      {
        product_id: productsRes.rows[2].id,
        variation_id: variationsRes.rows[2]?.id,
        quantity: 1,
        reason: 'Falha no FaceID',
        status: 'RMA_Sent',
        is_battery_risk: false,
        item_cost: 450.00,
        physical_location: 'Em Trânsito',
        supplier_id: 1,
        warranty_expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        rma_tracking_code: 'BR987654321',
      },
       {
        product_id: productsRes.rows[3].id,
        variation_id: variationsRes.rows[3]?.id,
        quantity: 2,
        reason: 'Conector de carga frouxo',
        status: 'Scrapped',
        is_battery_risk: false,
        item_cost: 50.00,
        physical_location: 'Descarte',
        supplier_id: 1,
        warranty_expiry_date: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      }
    ];

    for (const item of items) {
      await client.query(
        `INSERT INTO quarantine_items 
         (product_id, variation_id, supplier_id, quantity, reason, status, is_battery_risk, item_cost, physical_location, warranty_expiry_date, rma_tracking_code, identified_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          item.product_id,
          item.variation_id,
          item.supplier_id,
          item.quantity,
          item.reason,
          item.status,
          item.is_battery_risk,
          item.item_cost,
          item.physical_location,
          item.warranty_expiry_date,
          item.rma_tracking_code || null,
          userId
        ]
      );
    }

    console.log('Quarantine seeded successfully!');
  } catch (err) {
    console.error('Error seeding quarantine:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedQuarantine();
