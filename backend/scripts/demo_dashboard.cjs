const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function seedDemo() {
  try {
    console.log('Gerando dados de demonstração (v2) para o Dashboard...');
    
    const { rows: branches } = await pool.query("INSERT INTO branches (name) VALUES ('Loja Matriz RJ') ON CONFLICT DO NOTHING RETURNING id;");
    const branchId = branches[0]?.id || 1;

    const products = [
      { name: 'iPhone 15 Pro', variations: [{ color: 'Titânio', price: 7500, cost: 5000, stock: 3, limit: 5 }] },
      { name: 'Samsung S24 Ultra', variations: [{ color: 'Preto', price: 6200, cost: 4000, stock: 12, limit: 5 }] },
      { name: 'Redmi Note 13', variations: [{ color: 'Azul', price: 1800, cost: 1100, stock: 2, limit: 10 }] }
    ];

    for (const p of products) {
      const pRes = await pool.query("INSERT INTO products (name, description) VALUES ($1, 'Demonstração') RETURNING id;", [p.name]);
      const productId = pRes.rows[0].id;

      for (const v of p.variations) {
        const vRes = await pool.query(
          "INSERT INTO product_variations (product_id, color, price, low_stock_threshold) VALUES ($1, $2, $3, $4) RETURNING id;",
          [productId, v.color, v.price, v.limit]
        );
        const variantId = vRes.rows[0].id;

        await pool.query("INSERT INTO product_stock (product_variant_id, branch_id, quantity) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;", [variantId, branchId, v.stock]);

        for (let i = 0; i < 15; i++) {
          const daysAgo = Math.floor(Math.random() * 30);
          const saleDate = new Date();
          saleDate.setDate(saleDate.getDate() - daysAgo);
          
          const { rows: [sale] } = await pool.query(
            "INSERT INTO sales (total_amount, sale_date, branch_id) VALUES ($1, $2, $3) RETURNING id;",
            [v.price, saleDate, branchId]
          );

          await pool.query(
            "INSERT INTO sale_items (sale_id, variation_id, quantity, unit_price, cost_price) VALUES ($1, $2, 1, $3, $4);",
            [sale.id, variantId, v.price, v.cost]
          );
        }
      }
    }

    console.log('✅ Dados de demonstração (v2) gerados com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao gerar dados:', err);
  } finally {
    await pool.end();
  }
}

seedDemo();