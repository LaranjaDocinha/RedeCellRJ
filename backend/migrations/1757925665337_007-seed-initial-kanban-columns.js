/* eslint-disable camelcase */

export const shorthands = undefined;

export const up = pgm => {
  pgm.sql(`
    INSERT INTO kanban_columns (title, position) VALUES
    ('A Fazer', 0),
    ('Em Andamento', 1),
    ('Concluído', 2);
  `);
};

export const down = pgm => {
  pgm.sql(`
    DELETE FROM kanban_columns WHERE title IN ('A Fazer', 'Em Andamento', 'Concluído');
  `);
};