const db = require('../db');

const getAllTechnicians = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM technicians ORDER BY name ASC');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTechnicianById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM technicians WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTechnician = async (req, res) => {
  const { name, phone, email } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO technicians (name, phone, email) VALUES ($1, $2, $3) RETURNING *',
      [name, phone, email]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTechnician = async (req, res) => {
  const { id } = req.params;
  const { name, phone, email } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE technicians SET name = $1, phone = $2, email = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, phone, email, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTechnician = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteOp = await db.query('DELETE FROM technicians WHERE id = $1', [id]);
    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    res.status(204).send(); // No content
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTechnicians,
  getTechnicianById,
  createTechnician,
  updateTechnician,
  deleteTechnician,
};
