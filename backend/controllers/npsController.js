const db = require('../db');
const AppError = require('../utils/appError');
const { validationResult } = require('express-validator');

// Create a new NPS survey response
exports.createNpsSurvey = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { customer_id, score, feedback_text, source, related_sale_id, related_repair_id } = req.body;

    try {
        const newSurvey = await db.query(
            'INSERT INTO nps_surveys (customer_id, score, feedback_text, source, related_sale_id, related_repair_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *'
            ,
            [customer_id, score, feedback_text, source, related_sale_id, related_repair_id]
        );
        res.status(201).json(newSurvey.rows[0]);
    } catch (error) {
        console.error('Error creating NPS survey:', error);
        next(new AppError('Erro ao criar pesquisa NPS.', 500));
    }
};

// Get all NPS survey responses
exports.getAllNpsSurveys = async (req, res, next) => {
    try {
        const surveys = await db.query('SELECT * FROM nps_surveys ORDER BY survey_date DESC');
        res.status(200).json(surveys.rows);
    } catch (error) {
        console.error('Error fetching NPS surveys:', error);
        next(new AppError('Erro ao buscar pesquisas NPS.', 500));
    }
};

// Get a single NPS survey response by ID
exports.getNpsSurveyById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const survey = await db.query('SELECT * FROM nps_surveys WHERE id = $1', [id]);
        if (survey.rows.length === 0) {
            return next(new AppError('Pesquisa NPS não encontrada.', 404));
        }
        res.status(200).json(survey.rows[0]);
    } catch (error) {
        console.error('Error fetching NPS survey by ID:', error);
        next(new AppError('Erro ao buscar pesquisa NPS.', 500));
    }
};

// Update an NPS survey response
exports.updateNpsSurvey = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { id } = req.params;
    const { score, feedback_text, source, related_sale_id, related_repair_id } = req.body;

    try {
        const updatedSurvey = await db.query(
            'UPDATE nps_surveys SET score = $1, feedback_text = $2, source = $3, related_sale_id = $4, related_repair_id = $5, updated_at = NOW() WHERE id = $6 RETURNING *'
            ,
            [score, feedback_text, source, related_sale_id, related_repair_id, id]
        );
        if (updatedSurvey.rows.length === 0) {
            return next(new AppError('Pesquisa NPS não encontrada.', 404));
        }
        res.status(200).json(updatedSurvey.rows[0]);
    } catch (error) {
        console.error('Error updating NPS survey:', error);
        next(new AppError('Erro ao atualizar pesquisa NPS.', 500));
    }
};

// Delete an NPS survey response
exports.deleteNpsSurvey = async (req, res, next) => {
    const { id } = req.params;
    try {
        const deletedSurvey = await db.query('DELETE FROM nps_surveys WHERE id = $1 RETURNING *'
        , [id]);
        if (deletedSurvey.rows.length === 0) {
            return next(new AppError('Pesquisa NPS não encontrada.', 404));
        }
        res.status(204).send(); // No content for successful deletion
    } catch (error) {
        console.error('Error deleting NPS survey:', error);
        next(new AppError('Erro ao excluir pesquisa NPS.', 500));
    }
};

// Calculate NPS score
exports.calculateNpsScore = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        let query = 'SELECT score FROM nps_surveys';
        const queryParams = [];
        let paramIndex = 1;

        if (startDate && endDate) {
            query += ` WHERE survey_date BETWEEN $${paramIndex++} AND $${paramIndex++}`;
            queryParams.push(startDate, endDate);
        }

        const { rows } = await db.query(query, queryParams);

        if (rows.length === 0) {
            return res.status(200).json({ npsScore: 0, message: 'Nenhuma pesquisa encontrada para o período.' });
        }

        let promoters = 0; // Score 9-10
        let passives = 0;   // Score 7-8
        let detractors = 0; // Score 0-6

        rows.forEach(row => {
            if (row.score >= 9) {
                promoters++;
            } else if (row.score >= 7) {
                passives++;
            } else {
                detractors++;
            }
        });

        const totalResponses = rows.length;
        const npsScore = ((promoters - detractors) / totalResponses) * 100;

        res.status(200).json({
            npsScore: parseFloat(npsScore.toFixed(2)),
            totalResponses,
            promoters,
            passives,
            detractors,
        });
    } catch (error) {
        console.error('Error calculating NPS score:', error);
        next(new AppError('Erro ao calcular NPS.', 500));
    }
};