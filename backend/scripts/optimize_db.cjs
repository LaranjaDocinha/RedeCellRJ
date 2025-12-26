const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function indexDB() {
  try {
    console.log('🚀 Aplicando índices de performance...');
    
    const queries = [
      // Índices para Vendas (Essencial para buscas por data)
      "CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);",
      "CREATE INDEX IF NOT EXISTS idx_sales_user ON sales(user_id);",
      "CREATE INDEX IF NOT EXISTS idx_sales_branch ON sales(branch_id);",
      
      // Índices para Itens de Venda
      "CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);",
      "CREATE INDEX IF NOT EXISTS idx_sale_items_variant ON sale_items(variation_id);",
      
      // Índices para Produtos
      "CREATE INDEX IF NOT EXISTS idx_product_variations_product ON product_variations(product_id);",
      "CREATE INDEX IF NOT EXISTS idx_product_stock_variant ON product_stock(product_variant_id);"
    ];

    for (const q of queries) {
      await pool.query(q);
    }

    console.log('✅ Banco de dados otimizado com índices!');
  } catch (err) {
    console.error('❌ Erro na indexação:', err);
  } finally {
    await pool.end();
  }
}

indexDB();
