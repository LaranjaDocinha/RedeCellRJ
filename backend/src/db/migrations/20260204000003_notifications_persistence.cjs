exports.up = (pgm) => {
  pgm.createTable('notifications', {
    id: 'id',
    user_id: { type: 'uuid', references: 'users(id)', onDelete: 'CASCADE' },
    title: { type: 'string', notNull: true },
    message: { type: 'text', notNull: true },
    type: { type: 'string', default: 'info' }, // info, success, warning, error, sale, os
    priority: { type: 'string', default: 'normal' }, // low, normal, high, urgent
    read: { type: 'boolean', default: false },
    link: { type: 'string' }, // URL para redirecionamento ao clicar
    metadata: { type: 'jsonb' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    }
  });
  pgm.createIndex('notifications', 'user_id');
  pgm.createIndex('notifications', 'read');
};

exports.down = (pgm) => {
  pgm.dropTable('notifications');
};
