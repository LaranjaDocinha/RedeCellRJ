const db = require('../db');
const AppError = require('../utils/appError');
const { validationResult } = require('express-validator');

// Create a new lead
exports.createLead = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { name, email, phone, source, status, notes } = req.body;

    try {
        const newLead = await db.query(
            'INSERT INTO leads (name, email, phone, source, status, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *'
            ,
            [name, email, phone, source, status, notes]
        );
        res.status(201).json(newLead.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Unique violation for email
            return next(new AppError('O e-mail fornecido já está em uso para outro lead.', 409));
        }
        console.error('Error creating lead:', error);
        next(new AppError('Erro ao criar lead.', 500));
    }
};

// Get all leads
exports.getAllLeads = async (req, res, next) => {
    // Implement logic to fetch all leads with pagination, filtering, and sorting
    try {
        const leads = await db.query('SELECT * FROM leads ORDER BY created_at DESC');
        res.status(200).json(leads.rows);
    } catch (error) {
        console.error('Error fetching leads:', error);
        next(new AppError('Erro ao buscar leads.', 500));
    }
};

// Get a single lead by ID
exports.getLeadById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const lead = await db.query('SELECT * FROM leads WHERE id = $1', [id]);
        if (lead.rows.length === 0) {
            return next(new AppError('Lead não encontrado.', 404));
        }
        res.status(200).json(lead.rows[0]);
    } catch (error) {
        console.error('Error fetching lead by ID:', error);
        next(new AppError('Erro ao buscar lead.', 500));
    }
};

// Update a lead
exports.updateLead = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { id } = req.params;
    const { name, email, phone, source, status, notes } = req.body;

    try {
        const updatedLead = await db.query(
            'UPDATE leads SET name = $1, email = $2, phone = $3, source = $4, status = $5, notes = $6, updated_at = NOW() WHERE id = $7 RETURNING *'
            ,
            [name, email, phone, source, status, notes, id]
        );
        if (updatedLead.rows.length === 0) {
            return next(new AppError('Lead não encontrado.', 404));
        }
        res.status(200).json(updatedLead.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Unique violation for email
            return next(new AppError('O e-mail fornecido já está em uso para outro lead.', 409));
        }
        console.error('Error updating lead:', error);
        next(new AppError('Erro ao atualizar lead.', 500));
    }
};

// Delete a lead
exports.deleteLead = async (req, res, next) => {
    const { id } = req.params;
    try {
        const deletedLead = await db.query('DELETE FROM leads WHERE id = $1 RETURNING *', [id]);
        if (deletedLead.rows.length === 0) {
            return next(new AppError('Lead não encontrado.', 404));
        }
        res.status(200).json({ message: 'Lead excluído com sucesso.', deletedLead: deletedLead.rows[0] });
    } catch (error) {
        console.error('Error deleting lead:', error);
        next(new AppError('Erro ao excluir lead.', 500));
    }
};

// Convert a lead to a customer/quotation (placeholder for future logic)
exports.convertLead = async (req, res, next) => {
    const { id } = req.params;
    const { conversionType, customerId, quotationDetails } = req.body; // conversionType could be 'customer' or 'quotation'

    try {
        // Logic to convert lead to customer or quotation
        // This will involve creating a new customer or quotation entry
        // and updating the lead status (e.g., to 'Converted')
        // For now, just a placeholder
        const updatedLead = await db.query(
            'UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *'
            ,
            ['Convertido', id]
        );
        if (updatedLead.rows.length === 0) {
            return next(new AppError('Lead não encontrado.', 404));
        }
        res.status(200).json({ message: `Lead convertido para ${conversionType} com sucesso.`, lead: updatedLead.rows[0] });
    } catch (error) {
        console.error('Error converting lead:', error);
        next(new AppError('Erro ao converter lead.', 500));
    }
};
