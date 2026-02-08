exports.up = (pgm) => {
  pgm.addColumns('customers', {
    rfm_recency: { type: 'integer' },
    rfm_frequency: { type: 'integer' },
    rfm_monetary: { type: 'decimal(10, 2)' },
    rfm_segment: { type: 'varchar(50)' },
    rfm_last_calculated: { type: 'timestamp' },
    last_purchase_date: { type: 'timestamp' },
    health_score: { type: 'integer', default: 100 },
    churn_risk: { type: 'boolean', default: false }
  });

  // Tabela para Webhooks Externos
  pgm.createTable('external_webhooks', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true },
    url: { type: 'text', notNull: true },
    event_type: { type: 'varchar(50)', notNull: true }, // ex: sale.completed, os.created
    is_active: { type: 'boolean', default: true },
    secret: { type: 'varchar(255)' }, // Para assinatura de payload
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });

  // Tabela para Conciliação Bancária
  pgm.createTable('bank_transactions', {
    id: { type: 'serial', primaryKey: true },
    bank_account_id: { type: 'integer' },
    transaction_id: { type: 'varchar(100)', unique: true }, // ID do banco (fitid no OFX)
    amount: { type: 'decimal(10, 2)', notNull: true },
    type: { type: 'varchar(20)' }, // CREDIT / DEBIT
    description: { type: 'text' },
    date: { type: 'timestamp', notNull: true },
    reconciled: { type: 'boolean', default: false },
    reconciled_at: { type: 'timestamp' },
    related_entity_type: { type: 'varchar(50)' }, // sale, expense, etc
    related_entity_id: { type: 'integer' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('bank_transactions');
  pgm.dropTable('external_webhooks');
  pgm.dropColumns('customers', [
    'rfm_recency', 'rfm_frequency', 'rfm_monetary', 'rfm_segment', 
    'rfm_last_calculated', 'last_purchase_date', 'health_score', 'churn_risk'
  ]);
};
