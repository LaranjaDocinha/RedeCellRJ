/* eslint-disable camelcase */

export const shorthands = undefined;

export const up = pgm => {
  pgm.addColumn('users', {
    name: {
      type: 'varchar(255)',
      notNull: false, // Allow null initially for existing users
    },
  });
};

export const down = pgm => {
  pgm.dropColumn('users', 'name');
};