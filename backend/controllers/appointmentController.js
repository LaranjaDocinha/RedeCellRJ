const db = require('../db');
const { logActivity } = require('../utils/activityLogger');

// Criar um novo agendamento
exports.createAppointment = async (req, res) => {
  const { customer_id, service_type, appointment_date_time, notes, technician_id } = req.body;
  const user_id = req.user.id; // Assuming user_id from auth token

  if (!customer_id || !service_type || !appointment_date_time) {
    return res.status(400).json({ message: 'Dados do agendamento incompletos.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO appointments (customer_id, service_type, appointment_date_time, notes, technician_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [customer_id, service_type, appointment_date_time, notes || null, technician_id || null]
    );
    const appointment = result.rows[0];

    await logActivity(req.user.name, `Agendamento #${appointment.id} criado para o cliente ${customer_id}.`, 'appointment', appointment.id);

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

// Obter todos os agendamentos
exports.getAllAppointments = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT a.*, c.name as customer_name, t.name as technician_name FROM appointments a JOIN customers c ON a.customer_id = c.id LEFT JOIN technicians t ON a.technician_id = t.id ORDER BY appointment_date_time DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter um agendamento por ID
exports.getAppointmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT a.*, c.name as customer_name, t.name as technician_name FROM appointments a JOIN customers c ON a.customer_id = c.id LEFT JOIN technicians t ON a.technician_id = t.id WHERE a.id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Agendamento não encontrado.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(`Erro ao buscar agendamento ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar um agendamento
exports.updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { customer_id, service_type, appointment_date_time, notes, status, technician_id } = req.body;

  try {
    const result = await db.query(
      'UPDATE appointments SET customer_id = $1, service_type = $2, appointment_date_time = $3, notes = $4, status = $5, technician_id = $6, updated_at = NOW() WHERE id = $7 RETURNING *;',
      [customer_id, service_type, appointment_date_time, notes || null, status, technician_id || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Agendamento não encontrado.' });
    }

    await logActivity(req.user.name, `Agendamento #${id} atualizado.`, 'appointment', id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Erro ao atualizar agendamento ${id}:`, error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

// Deletar um agendamento
exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM appointments WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Agendamento não encontrado.' });
    }

    await logActivity(req.user.name, `Agendamento #${id} deletado.`, 'appointment', id);
    res.status(204).send();
  } catch (error) {
    console.error(`Erro ao deletar agendamento ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
