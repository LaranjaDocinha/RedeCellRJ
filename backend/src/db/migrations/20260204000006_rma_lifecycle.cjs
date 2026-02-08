exports.up = (pgm) => {
  // Solicitações de RMA
  pgm.createTable('rma_requests', {
    id: 'id',
    supplier_id: { type: 'integer', references: 'suppliers(id)', notNull: true },
    status: { type: 'string', default: 'pending' }, // pending, shipped, credited, rejected
    notes: { type: 'text' },
    total_amount: { type: 'decimal', default: 0 },
    tracking_code: { type: 'string' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  // Itens do RMA
  pgm.createTable('rma_items', {
    id: 'id',
    rma_id: { type: 'integer', references: 'rma_requests(id)', onDelete: 'CASCADE', notNull: true },
    product_variation_id: { type: 'integer', references: 'product_variations(id)', notNull: true },
    quantity: { type: 'integer', notNull: true, default: 1 },
    reason: { type: 'text' }, // Ex: Touch falhando
    cost_price: { type: 'decimal', notNull: true }
  });

  pgm.createIndex('rma_requests', 'supplier_id');
  pgm.createIndex('rma_requests', 'status');
};

exports.down = (pgm) => {
  pgm.dropTable('rma_items');
  pgm.dropTable('rma_requests');
};
