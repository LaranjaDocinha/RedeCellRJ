/* eslint-disable camelcase */

export const shorthands = undefined;

export const up = pgm => {
  pgm.createTable('user_dashboard_settings', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"(id)',
      onDelete: 'cascade',
      unique: true, // Each user has only one settings entry
    },
    settings: {
      type: 'jsonb',
      notNull: true,
      default: '{}',
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Add an index for user_id for faster lookups
  pgm.createIndex('user_dashboard_settings', 'user_id');
};

export const down = pgm => {
  pgm.dropTable('user_dashboard_settings');
};