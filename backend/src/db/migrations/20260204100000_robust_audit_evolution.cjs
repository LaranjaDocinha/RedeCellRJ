exports.up = (pgm) => {
  // Evoluindo audit_logs para suportar Time Travel robusto
  pgm.alterColumn('audit_logs', 'entity_id', { type: 'varchar(100)' });
  pgm.addColumn('audit_logs', {
    old_values: { type: 'jsonb' },
    new_values: { type: 'jsonb' },
    user_agent: { type: 'text' }
  });

  // Indexando para buscas rápidas de histórico de uma entidade
  pgm.createIndex('audit_logs', ['entity_type', 'entity_id']);
};

exports.down = (pgm) => {
  pgm.dropIndex('audit_logs', ['entity_type', 'entity_id']);
  pgm.dropColumn('audit_logs', ['old_values', 'new_values', 'user_agent']);
  pgm.alterColumn('audit_logs', 'entity_id', { type: 'uuid' });
};
