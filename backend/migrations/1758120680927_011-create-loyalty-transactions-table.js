/* eslint-disable camelcase */

export const shorthands = undefined;

export const up = pgm => {
  pgm.createTable('loyalty_transactions', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"(id)',
      onDelete: 'cascade',
    },
    points_change: {
      type: 'integer',
      notNull: true,
    },
    reason: {
      type: 'varchar(255)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Add index for user_id for faster lookups
  pgm.createIndex('loyalty_transactions', 'user_id');
};

export const down = pgm => {
  pgm.dropTable('loyalty_transactions');
};