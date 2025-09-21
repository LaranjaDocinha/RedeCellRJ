
import request from 'supertest';
import app from '../../src/index'; // Assuming your app is exported from index
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Pool } from 'pg';
import { setupIntegrationTestDatabase, teardownIntegrationTestDatabase, truncateTables } from '../setupIntegrationTests';

import { getTestPool } from '../testPool';

describe('Kanban API', () => {
  afterAll(async () => {
    await teardownIntegrationTestDatabase();
  });

  beforeEach(async () => {
    await truncateTables(getTestPool(), ['kanban_cards', 'kanban_columns']);
    // Seed database for tests
    await getTestPool().query("INSERT INTO kanban_columns (id, title, position) VALUES (1, 'Test To Do', 0), (2, 'Test In Progress', 1) ON CONFLICT (id) DO NOTHING;");
    await getTestPool().query("INSERT INTO kanban_cards (id, title, description, position, column_id) VALUES (1, 'Card 1', 'Desc 1', 0, 1), (2, 'Card 2', 'Desc 2', 1, 1), (3, 'Card 3', 'Desc 3', 0, 2) ON CONFLICT (id) DO NOTHING;");
  });

  it('should fetch the initial board state', async () => {
    const res = await request(app).get('/api/kanban');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(2); // 2 columns
    expect(res.body[0].title).toBe('Test To Do');
    expect(res.body[0].cards).toHaveLength(2);
    expect(res.body[1].title).toBe('Test In Progress');
    expect(res.body[1].cards).toHaveLength(1);
  });

  it('should move a card within the same column', async () => {
    const movePayload = { cardId: 1, newColumnId: 1, newPosition: 1 };
    const res = await request(app).put('/api/kanban/cards/move').send(movePayload);
    expect(res.statusCode).toEqual(200);

    const boardRes = await request(app).get('/api/kanban');
    const toDoColumn = boardRes.body.find(c => c.id === 1);
    expect(toDoColumn.cards[0].id).toBe(2);
    expect(toDoColumn.cards[1].id).toBe(1);
  });

  it('should move a card to a different column', async () => {
    // Move card 1 back to position 0 before this test
    await request(app).put('/api/kanban/cards/move').send({ cardId: 1, newColumnId: 1, newPosition: 0 });

    const movePayload = { cardId: 1, newColumnId: 2, newPosition: 1 };
    const res = await request(app).put('/api/kanban/cards/move').send(movePayload);
    expect(res.statusCode).toEqual(200);

    const boardRes = await request(app).get('/api/kanban');
    const toDoColumn = boardRes.body.find(c => c.id === 1);
    const inProgressColumn = boardRes.body.find(c => c.id === 2);

    expect(toDoColumn.cards).toHaveLength(1);
    expect(toDoColumn.cards[0].id).toBe(2);
    expect(inProgressColumn.cards).toHaveLength(2);
    expect(inProgressColumn.cards[1].id).toBe(1);
  });

  it('should create a new card', async () => {
    const newCardPayload = { columnId: 1, title: 'New Card', description: 'A new card for testing' };
    const res = await request(app).post('/api/kanban/cards').send(newCardPayload);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toBe('New Card');
    expect(res.body.column_id).toBe(1);
    expect(res.body.position).toBe(2); // It will be the 3rd card in the column

    const boardRes = await request(app).get('/api/kanban');
    const toDoColumn = boardRes.body.find(c => c.id === 1);
    expect(toDoColumn.cards).toHaveLength(3);
  });

  it('should delete a card', async () => {
    const cardIdToDelete = 3;
    const res = await request(app).delete(`/api/kanban/cards/${cardIdToDelete}`);

    expect(res.statusCode).toEqual(200);

    const boardRes = await request(app).get('/api/kanban');
    const inProgressColumn = boardRes.body.find(c => c.id === 2);
    expect(inProgressColumn.cards.some(c => c.id === cardIdToDelete)).toBe(false);
  });
});
