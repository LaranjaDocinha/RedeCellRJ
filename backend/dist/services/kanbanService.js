var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import pool from '../db/index.js';
export const getBoard = () => __awaiter(void 0, void 0, void 0, function* () {
    const { rows: columns } = yield pool.query('SELECT * FROM kanban_columns ORDER BY position ASC');
    const { rows: cards } = yield pool.query('SELECT * FROM kanban_cards ORDER BY position ASC');
    const board = columns.map(column => (Object.assign(Object.assign({}, column), { cards: cards.filter(card => card.column_id === column.id) })));
    return board;
});
export const moveCard = (_a) => __awaiter(void 0, [_a], void 0, function* ({ cardId, newColumnId, newPosition }) {
    console.log('--- moveCard called with:', { cardId, newColumnId, newPosition });
    const client = yield pool.connect();
    try {
        yield client.query('BEGIN');
        const numCardId = parseInt(String(cardId), 10);
        const numNewColumnId = parseInt(String(newColumnId), 10);
        const numNewPosition = parseInt(String(newPosition), 10);
        const { rows: [cardToMove] } = yield client.query('SELECT column_id, position FROM kanban_cards WHERE id = $1 FOR UPDATE', [numCardId]);
        if (!cardToMove) {
            throw new Error(`Card with ID ${numCardId} not found`);
        }
        const { column_id: oldColumnId, position: oldPosition } = cardToMove;
        if (oldColumnId === numNewColumnId) {
            if (oldPosition === numNewPosition) {
                yield client.query('COMMIT');
                return;
            }
            if (oldPosition < numNewPosition) {
                yield client.query(`UPDATE kanban_cards SET position = position - 1 WHERE column_id = $1 AND position > $2 AND position <= $3`, [oldColumnId, oldPosition, numNewPosition]);
            }
            else {
                yield client.query(`UPDATE kanban_cards SET position = position + 1 WHERE column_id = $1 AND position >= $2 AND position < $3`, [oldColumnId, numNewPosition, oldPosition]);
            }
        }
        else {
            yield client.query(`UPDATE kanban_cards SET position = position - 1 WHERE column_id = $1 AND position > $2`, [oldColumnId, oldPosition]);
            yield client.query(`UPDATE kanban_cards SET position = position + 1 WHERE column_id = $1 AND position >= $2`, [numNewColumnId, numNewPosition]);
        }
        yield client.query('UPDATE kanban_cards SET column_id = $1, position = $2 WHERE id = $3', [numNewColumnId, numNewPosition, numCardId]);
        yield client.query('COMMIT');
    }
    catch (e) {
        console.log("--- Error in moveCard transaction:", e);
        yield client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
});
export const createCard = (_a) => __awaiter(void 0, [_a], void 0, function* ({ columnId, title, description }) {
    const { rows: [maxPos] } = yield pool.query('SELECT MAX(position) as max_pos FROM kanban_cards WHERE column_id = $1', [columnId]);
    const newPosition = maxPos.max_pos === null ? 0 : parseInt(maxPos.max_pos, 10) + 1;
    const { rows: [newCard] } = yield pool.query('INSERT INTO kanban_cards (title, description, column_id, position) VALUES ($1, $2, $3, $4) RETURNING *', [title, description, columnId, newPosition]);
    return newCard;
});
export const updateCard = (_a) => __awaiter(void 0, [_a], void 0, function* ({ cardId, title, description, due_date, assignee_id }) {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    if (title !== undefined) {
        fields.push(`title = ${paramIndex++}`);
        values.push(title);
    }
    if (description !== undefined) {
        fields.push(`description = ${paramIndex++}`);
        values.push(description);
    }
    if (due_date !== undefined) {
        fields.push(`due_date = ${paramIndex++}`);
        values.push(due_date ? new Date(due_date) : null);
    }
    if (assignee_id !== undefined) {
        fields.push(`assignee_id = ${paramIndex++}`);
        values.push(assignee_id);
    }
    if (fields.length === 0) {
        const { rows: [existingCard] } = yield pool.query('SELECT * FROM kanban_cards WHERE id = $1', [cardId]);
        return existingCard; // No fields to update, return existing card
    }
    values.push(cardId); // Add cardId for WHERE clause
    const query = `UPDATE kanban_cards SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = ${paramIndex} RETURNING *`;
    const { rows: [updatedCard] } = yield pool.query(query, values);
    return updatedCard;
});
export const deleteCard = (cardId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield pool.connect();
    try {
        yield client.query('BEGIN');
        const { rows: [cardToDelete] } = yield client.query('SELECT column_id, position FROM kanban_cards WHERE id = $1 FOR UPDATE', [cardId]);
        if (!cardToDelete) {
            throw new Error('Card not found');
        }
        yield client.query('DELETE FROM kanban_cards WHERE id = $1', [cardId]);
        yield client.query('UPDATE kanban_cards SET position = position - 1 WHERE column_id = $1 AND position > $2', [cardToDelete.column_id, cardToDelete.position]);
        yield client.query('COMMIT');
        return { message: 'Card deleted successfully' };
    }
    catch (e) {
        yield client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
});
export const moveColumn = (_a) => __awaiter(void 0, [_a], void 0, function* ({ columnId, newPosition }) {
    console.log('--- moveColumn called with:', { columnId, newPosition });
    const client = yield pool.connect();
    try {
        yield client.query('BEGIN');
        const numColumnId = parseInt(String(columnId), 10);
        const numNewPosition = parseInt(String(newPosition), 10);
        const { rows: [columnToMove] } = yield client.query('SELECT position FROM kanban_columns WHERE id = $1 FOR UPDATE', [numColumnId]);
        if (!columnToMove) {
            throw new Error(`Column with ID ${numColumnId} not found`);
        }
        const oldPosition = columnToMove.position;
        if (oldPosition === numNewPosition) {
            yield client.query('COMMIT');
            return;
        }
        if (oldPosition < numNewPosition) {
            yield client.query(`UPDATE kanban_columns SET position = position - 1 WHERE position > $1 AND position <= $2`, [oldPosition, numNewPosition]);
        }
        else {
            yield client.query(`UPDATE kanban_columns SET position = position + 1 WHERE position >= $1 AND position < $2`, [numNewPosition, oldPosition]);
        }
        yield client.query('UPDATE kanban_columns SET position = $1 WHERE id = $2', [numNewPosition, numColumnId]);
        yield client.query('COMMIT');
    }
    catch (e) {
        console.log("--- Error in moveColumn transaction:", e);
        yield client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
});
