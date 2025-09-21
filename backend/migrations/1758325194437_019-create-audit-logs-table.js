/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('audit_logs', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: false, // Can be null for system actions or unauthenticated actions
      references: 'users',
      onDelete: 'SET NULL', // If a user is deleted, set user_id to NULL
    },
    action: { type: 'varchar(255)', notNull: true }, // e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
    entity_type: { type: 'varchar(255)', notNull: false }, // e.g., 'Product', 'Customer', 'User'
    entity_id: { type: 'integer', notNull: false }, // ID of the entity affected
    details: { type: 'jsonb', notNull: false }, // For storing additional context, e.g., old/new values
    timestamp: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('audit_logs');
};
