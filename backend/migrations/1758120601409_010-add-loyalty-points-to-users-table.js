/* eslint-disable camelcase */

export const shorthands = undefined;

export const up = pgm => {
  pgm.addColumn('users', {
    loyalty_points: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
  });
};

export const down = pgm => {
  pgm.dropColumn('users', 'loyalty_points');
};