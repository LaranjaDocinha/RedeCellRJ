exports.up = (pgm) => {
  // Auditoria Detalhada por Campo
  pgm.createTable('field_audit_logs', {
    id: 'id',
    table_name: { type: 'string', notNull: true },
    record_id: { type: 'string', notNull: true },
    field_name: { type: 'string', notNull: true },
    old_value: { type: 'text' },
    new_value: { type: 'text' },
    user_id: { type: 'uuid', references: 'users(id)' },
    changed_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  pgm.createIndex('field_audit_logs', ['table_name', 'record_id']);
  pgm.createIndex('field_audit_logs', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('field_audit_logs');
};
