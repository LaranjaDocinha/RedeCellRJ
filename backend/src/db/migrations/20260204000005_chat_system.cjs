exports.up = (pgm) => {
  pgm.createTable('chat_messages', {
    id: 'id',
    sender_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    receiver_id: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' }, // NULL para canais públicos se houver
    content: { type: 'text', notNull: true },
    type: { type: 'varchar(20)', default: 'text' }, // text, image, file
    file_url: { type: 'text' },
    is_read: { type: 'boolean', default: false },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });

  pgm.createIndex('chat_messages', 'sender_id');
  pgm.createIndex('chat_messages', 'receiver_id');
  pgm.createIndex('chat_messages', 'created_at');
};

exports.down = (pgm) => {
  pgm.dropTable('chat_messages');
};
