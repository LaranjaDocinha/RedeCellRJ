exports.up = (pgm) => {
  // Carteiras
  pgm.createTable('customer_wallets', {
    customer_id: { type: 'integer', references: 'customers(id)', primaryKey: true, onDelete: 'CASCADE' },
    balance: { type: 'decimal', notNull: true, default: 0 },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  // Transações de Carteira
  pgm.createTable('wallet_transactions', {
    id: 'id',
    customer_id: { type: 'integer', references: 'customers(id)', notNull: true },
    amount: { type: 'decimal', notNull: true }, // Positivo para crédito, Negativo para débito
    type: { type: 'string', notNull: true }, // 'cashback', 'payment', 'refund', 'manual'
    sale_id: { type: 'integer', references: 'sales(id)' },
    notes: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  pgm.createIndex('wallet_transactions', 'customer_id');
};

exports.down = (pgm) => {
  pgm.dropTable('wallet_transactions');
  pgm.dropTable('customer_wallets');
};
