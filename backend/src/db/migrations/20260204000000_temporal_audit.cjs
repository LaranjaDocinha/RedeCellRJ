exports.shorthands = undefined;

exports.up = (pgm) => {
  // Tabela de Histórico de Produtos
  pgm.createTable('products_history', {
    history_id: { type: 'serial', primaryKey: true },
    product_id: { type: 'integer', notNull: true },
    name: { type: 'varchar(255)' },
    description: { type: 'text' },
    category_id: { type: 'integer' },
    sku: { type: 'varchar(100)' },
    is_serialized: { type: 'boolean' },
    price: { type: 'decimal(10, 2)' },
    changed_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    changed_by: { type: 'uuid', references: 'users(id)' },
    change_type: { type: 'varchar(20)', notNull: true }, // INSERT, UPDATE, DELETE
    snapshot: { type: 'jsonb' } // Estado completo do objeto no momento
  });

  // Tabela de Histórico de Estoque
  pgm.createTable('stock_history', {
    history_id: { type: 'serial', primaryKey: true },
    product_variation_id: { type: 'integer', notNull: true },
    branch_id: { type: 'integer', notNull: true },
    old_quantity: { type: 'integer' },
    new_quantity: { type: 'integer', notNull: true },
    reason: { type: 'varchar(255)' },
    reference_id: { type: 'varchar(100)' }, // ID da venda ou transferência
    changed_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    changed_by: { type: 'uuid', references: 'users(id)' }
  });

  pgm.createIndex('products_history', 'product_id');
  pgm.createIndex('stock_history', ['product_variation_id', 'branch_id']);
};

exports.down = (pgm) => {
  pgm.dropTable('stock_history');
  pgm.dropTable('products_history');
};
