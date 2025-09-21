
export const shorthands = undefined;

export const up = (pgm) => {
  // 1. Create roles table
  pgm.createTable('roles', {
    id: 'id',
    name: { type: 'varchar(50)', notNull: true, unique: true }, // e.g., admin, manager, user
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // 2. Create permissions table
  pgm.createTable('permissions', {
    id: 'id',
    action: { type: 'varchar(50)', notNull: true }, // e.g., create, read, update, delete
    subject: { type: 'varchar(50)', notNull: true }, // e.g., product, user, order
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  pgm.addConstraint('permissions', 'permissions_unique_action_subject', { unique: ['action', 'subject'] });

  // 3. Create role_permissions join table
  pgm.createTable('role_permissions', {
    role_id: {
      type: 'integer',
      notNull: true,
      references: 'roles(id)',
      onDelete: 'cascade',
    },
    permission_id: {
      type: 'integer',
      notNull: true,
      references: 'permissions(id)',
      onDelete: 'cascade',
    },
  });
  pgm.addConstraint('role_permissions', 'role_permissions_pkey', { primaryKey: ['role_id', 'permission_id'] });

  // 4. Create user_roles join table
  pgm.createTable('user_roles', {
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'cascade',
    },
    role_id: {
      type: 'integer',
      notNull: true,
      references: 'roles(id)',
      onDelete: 'cascade',
    },
  });
  pgm.addConstraint('user_roles', 'user_roles_pkey', { primaryKey: ['user_id', 'role_id'] });

  // Add indexes for performance
  pgm.createIndex('role_permissions', 'role_id');
  pgm.createIndex('role_permissions', 'permission_id');
  pgm.createIndex('user_roles', 'user_id');
  pgm.createIndex('user_roles', 'role_id');
};

export const down = (pgm) => {
  pgm.dropTable('user_roles');
  pgm.dropTable('role_permissions');
  pgm.dropTable('permissions');
  pgm.dropTable('roles');
};
