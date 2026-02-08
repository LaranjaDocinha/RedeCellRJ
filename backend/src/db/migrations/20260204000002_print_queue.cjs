exports.up = (pgm) => {
  pgm.createTable('print_jobs', {
    id: 'id',
    customer_name: { type: 'string', notNull: true },
    customer_phone: { type: 'string' },
    description: { type: 'string', notNull: true },
    quantity: { type: 'integer', notNull: true, default: 1 },
    status: { 
        type: 'string', 
        notNull: true, 
        default: 'Pendente',
        comment: 'Pendente, Imprimindo, Pronto, Entregue'
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('print_jobs');
};
