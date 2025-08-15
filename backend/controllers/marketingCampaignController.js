const db = require('../db');
const AppError = require('../utils/appError');
const { validationResult } = require('express-validator');

// Create a new marketing campaign
exports.createMarketingCampaign = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { name, type, segmentation_criteria, message_template, scheduled_date_time, status, created_by_user_id } = req.body;

    try {
        const newCampaign = await db.query(
            'INSERT INTO marketing_campaigns (name, type, segmentation_criteria, message_template, scheduled_date_time, status, created_by_user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *'
            ,
            [name, type, segmentation_criteria, message_template, scheduled_date_time, status, created_by_user_id]
        );
        res.status(201).json(newCampaign.rows[0]);
    } catch (error) {
        console.error('Error creating marketing campaign:', error);
        next(new AppError('Erro ao criar campanha de marketing.', 500));
    }
};

// Get all marketing campaigns
exports.getAllMarketingCampaigns = async (req, res, next) => {
    try {
        const campaigns = await db.query('SELECT * FROM marketing_campaigns ORDER BY created_at DESC');
        res.status(200).json(campaigns.rows);
    } catch (error) {
        console.error('Error fetching marketing campaigns:', error);
        next(new AppError('Erro ao buscar campanhas de marketing.', 500));
    }
};

// Get a single marketing campaign by ID
exports.getMarketingCampaignById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const campaign = await db.query('SELECT * FROM marketing_campaigns WHERE id = $1', [id]);
        if (campaign.rows.length === 0) {
            return next(new AppError('Campanha de marketing não encontrada.', 404));
        }
        res.status(200).json(campaign.rows[0]);
    } catch (error) {
        console.error('Error fetching marketing campaign by ID:', error);
        next(new AppError('Erro ao buscar campanha de marketing.', 500));
    }
};

// Update a marketing campaign
exports.updateMarketingCampaign = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { id } = req.params;
    const { name, type, segmentation_criteria, message_template, scheduled_date_time, status } = req.body;

    try {
        const updatedCampaign = await db.query(
            'UPDATE marketing_campaigns SET name = $1, type = $2, segmentation_criteria = $3, message_template = $4, scheduled_date_time = $5, status = $6, updated_at = NOW() WHERE id = $7 RETURNING *'
            ,
            [name, type, segmentation_criteria, message_template, scheduled_date_time, status, id]
        );
        if (updatedCampaign.rows.length === 0) {
            return next(new AppError('Campanha de marketing não encontrada.', 404));
        }
        res.status(200).json(updatedCampaign.rows[0]);
    } catch (error) {
        console.error('Error updating marketing campaign:', error);
        next(new AppError('Erro ao atualizar campanha de marketing.', 500));
    }
};

// Delete a marketing campaign
exports.deleteMarketingCampaign = async (req, res, next) => {
    const { id } = req.params;
    try {
        const deletedCampaign = await db.query('DELETE FROM marketing_campaigns WHERE id = $1 RETURNING *'
        , [id]);
        if (deletedCampaign.rows.length === 0) {
            return next(new AppError('Campanha de marketing não encontrada.', 404));
        }
        res.status(204).send(); // No content for successful deletion
    } catch (error) {
        console.error('Error deleting marketing campaign:', error);
        next(new AppError('Erro ao excluir campanha de marketing.', 500));
    }
};
