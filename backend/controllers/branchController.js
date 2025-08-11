
const db = require('../db');

// @desc    Obter todas as filiais
// @route   GET /api/branches
// @access  Private (Admin only)
const getAllBranches = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, name FROM branches ORDER BY name');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar filiais:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

module.exports = {
    getAllBranches,
};
