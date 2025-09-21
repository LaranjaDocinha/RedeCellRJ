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
  pgm.createTable('coupons', {
    id: 'id',
    code: { type: 'varchar(255)', notNull: true, unique: true },
    type: { type: 'varchar(50)', notNull: true }, // e.g., 'percentage', 'fixed_amount'
    value: { type: 'decimal(10, 2)', notNull: true },
    start_date: { type: 'timestamp', notNull: true },
    end_date: { type: 'timestamp', notNull: false },
    min_purchase_amount: { type: 'decimal(10, 2)', notNull: false },
    max_uses: { type: 'integer', notNull: false },
    uses_count: { type: 'integer', notNull: true, default: 0 },
    is_active: { type: 'boolean', notNull: true, default: true },
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
  pgm.dropTable('coupons');
};
