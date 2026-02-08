exports.up = (pgm) => {
  // Regras de Comissão
  pgm.createTable('commission_rules', {
    id: 'id',
    user_id: { type: 'uuid', references: 'users(id)', onDelete: 'CASCADE' }, // Regra para usuário específico (opcional)
    role_id: { type: 'integer', references: 'roles(id)' }, // Regra para cargo (ex: técnico)
    category_id: { type: 'integer', references: 'categories(id)' }, // Regra para categoria (ex: Telas)
    percentage: { type: 'decimal', notNull: true },
    fixed_value: { type: 'decimal', default: 0 },
    type: { type: 'string', notNull: true }, // 'sale' or 'os'
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  // Comissões Geradas
  pgm.createTable('commissions_earned', {
    id: 'id',
    user_id: { type: 'uuid', references: 'users(id)', notNull: true },
    sale_id: { type: 'integer', references: 'sales(id)' },
    service_order_id: { type: 'integer', references: 'service_orders(id)' },
    base_amount: { type: 'decimal', notNull: true },
    commission_amount: { type: 'decimal', notNull: true },
    status: { type: 'string', default: 'pending' }, // pending, paid, cancelled
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  pgm.createIndex('commissions_earned', 'user_id');
  pgm.createIndex('commissions_earned', 'status');
};

exports.down = (pgm) => {
  pgm.dropTable('commissions_earned');
  pgm.dropTable('commission_rules');
};
