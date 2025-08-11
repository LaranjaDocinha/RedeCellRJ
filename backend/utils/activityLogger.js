const db = require('../db');

const logActivity = async (user_name, description, entity_type = null, entity_id = null, branch_id = null) => {
  try {
    await db.query(
      'INSERT INTO activity_log (user_name, description, entity_type, entity_id, branch_id) VALUES ($1, $2, $3, $4, $5)',
      [user_name, description, entity_type, entity_id, branch_id]
    );
  } catch (error) {
    console.error('Failed to log activity to database:', error);
  }
};

module.exports = { logActivity };