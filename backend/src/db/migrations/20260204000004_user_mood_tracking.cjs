exports.up = (pgm) => {
  pgm.createTable('user_mood_logs', {
    id: 'id',
    user_id: { type: 'uuid', references: 'users(id)', onDelete: 'CASCADE', notNull: true },
    mood_level: { type: 'integer', notNull: true }, // 1 to 5
    comment: { type: 'text' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    }
  });
  pgm.createIndex('user_mood_logs', ['user_id', 'created_at']);
};

exports.down = (pgm) => {
  pgm.dropTable('user_mood_logs');
};
