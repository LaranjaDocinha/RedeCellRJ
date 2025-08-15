const db = require('../db');
const AppError = require('../utils/appError');
const { validationResult } = require('express-validator');

// Create a new customer interaction
exports.createCustomerInteraction = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { customer_id, user_id, interaction_type, notes } = req.body;

    try {
        const newInteraction = await db.query(
            'INSERT INTO customer_interactions (customer_id, user_id, interaction_type, notes) VALUES ($1, $2, $3, $4) RETURNING *'
            ,
            [customer_id, user_id, interaction_type, notes]
        );
        res.status(201).json(newInteraction.rows[0]);
    } catch (error) {
        console.error('Error creating customer interaction:', error);
        next(new AppError('Erro ao criar interação com o cliente.', 500));
    }
};

// Get all customer interactions (can be filtered by customer_id)
exports.getAllCustomerInteractions = async (req, res, next) => {
    const { customer_id } = req.query;
    try {
        let query = 'SELECT * FROM customer_interactions';
        const queryParams = [];
        if (customer_id) {
            query += ' WHERE customer_id = $1';
            queryParams.push(customer_id);
        }
        query += ' ORDER BY interaction_date DESC';

        const interactions = await db.query(query, queryParams);
        res.status(200).json(interactions.rows);
    } catch (error) {
        console.error('Error fetching customer interactions:', error);
        next(new AppError('Erro ao buscar interações com o cliente.', 500));
    }
};

// Get a single customer interaction by ID
exports.getCustomerInteractionById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const interaction = await db.query('SELECT * FROM customer_interactions WHERE id = $1', [id]);
        if (interaction.rows.length === 0) {
            return next(new AppError('Interação com o cliente não encontrada.', 404));
        }
        res.status(200).json(interaction.rows[0]);
    } catch (error) {
        console.error('Error fetching customer interaction by ID:', error);
        next(new AppError('Erro ao buscar interação com o cliente.', 500));
    }
};

// Update a customer interaction
exports.updateCustomerInteraction = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { id } = req.params;
    const { interaction_type, notes } = req.body;

    try {
        const updatedInteraction = await db.query(
            'UPDATE customer_interactions SET interaction_type = $1, notes = $2, updated_at = NOW() WHERE id = $3 RETURNING *'
            ,
            [interaction_type, notes, id]
        );
        if (updatedInteraction.rows.length === 0) {
            return next(new AppError('Interação com o cliente não encontrada.', 404));
        }
        res.status(200).json(updatedInteraction.rows[0]);
    } catch (error) {
        console.error('Error updating customer interaction:', error);
        next(new AppError('Erro ao atualizar interação com o cliente.', 500));
    }
};

// Delete a customer interaction
exports.deleteCustomerInteraction = async (req, res, next) => {
    const { id } = req.params;
    try {
        const deletedInteraction = await db.query('DELETE FROM customer_interactions WHERE id = $1 RETURNING *'
        , [id]);
        if (deletedInteraction.rows.length === 0) {
            return next(new AppError('Interação com o cliente não encontrada.', 404));
        }
        res.status(200).json({ message: 'Interação com o cliente excluída com sucesso.', deletedInteraction: deletedInteraction.rows[0] });
    } catch (error) {
        console.error('Error deleting customer interaction:', error);
        next(new AppError('Erro ao excluir interação com o cliente.', 500));
    }
};