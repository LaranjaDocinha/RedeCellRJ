/* eslint-disable camelcase */

export const shorthands = undefined;

export const up = pgm => {
  pgm.createTable('kanban_columns', {
    id: 'id',
    title: { type: 'varchar(255)', notNull: true },
    position: { type: 'integer', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createTable('kanban_cards', {
    id: 'id',
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    position: { type: 'integer', notNull: true },
    column_id: {
      type: 'integer',
      notNull: true,
      references: '"kanban_columns"(id)',
      onDelete: 'cascade',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('kanban_columns', 'position');
  pgm.createIndex('kanban_cards', 'position');
  pgm.createIndex('kanban_cards', 'column_id');
};

export const down = pgm => {
  pgm.dropTable('kanban_cards');
  pgm.dropTable('kanban_columns');
};