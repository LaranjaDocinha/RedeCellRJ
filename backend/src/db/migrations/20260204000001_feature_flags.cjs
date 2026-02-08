exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('feature_flags', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true, unique: true },
    description: { type: 'text' },
    is_enabled: { type: 'boolean', notNull: true, default: false },
    rules: { type: 'jsonb' },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Flag inicial para teste do FSD piloto
  pgm.sql("INSERT INTO feature_flags (name, description, is_enabled) VALUES ('new_fsd_auth', 'Habilita o novo módulo de autenticação baseado em FSD', false)");
};

exports.down = (pgm) => {
  pgm.dropTable('feature_flags');
};
