const { pool } = require('../db');

const logRepairActivity = async (repairId, activityType, description, userId = null) => {
  try {
    await pool.query(
      'INSERT INTO repair_activities (repair_id, user_id, activity_type, description) VALUES ($1, $2, $3, $4)',
      [repairId, userId, activityType, description]
    );
  } catch (err) {
    console.error('Error logging repair activity:', err.message);
  }
};

module.exports = { logRepairActivity };
