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
  pgm.createTable('returns', {
    id: 'id',
    sale_id: {
      type: 'integer',
      notNull: true,
      references: 'sales',
      onDelete: 'CASCADE',
    },
    return_date: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    reason: { type: 'text', notNull: false },
    status: { type: 'varchar(50)', notNull: true, default: 'pending' },
    refund_amount: { type: 'decimal(10, 2)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('returns');
};
