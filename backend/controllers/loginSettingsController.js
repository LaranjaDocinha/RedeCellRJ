// backend/controllers/loginSettingsController.js
const pool = require('../db');

// Helper function to generate a random RGB color
const generateRandomColor = () => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgb(${r}, ${g}, ${b})`;
};

// Controller to get login screen settings
const getLoginScreenSettings = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM login_screen_settings ORDER BY id LIMIT 1');
    let settings;

    if (result.rows.length === 0) {
      // Return default settings if no settings are found in the database
      settings = {
        background_type: 'solid',
        background_solid_color: '#282c34', // A default dark color
        background_image_url: null,
        background_video_url: null,
        image_size: 'cover',
        image_repeat: 'no-repeat',
        gradient_color_1: '#007bff',
        gradient_color_2: '#6610f2',
        gradient_color_3: '#007bff',
        gradient_color_4: '#6610f2',
        gradient_speed: 5,
        gradient_direction: 'to right',
      };
    } else {
      settings = result.rows[0];
    }

    // If the gradient colors are set to 'random', generate them on the fly
    if (settings.background_type === 'gradient' && settings.gradient_color_1 === 'random') {
      settings.gradient_color_1 = generateRandomColor();
      settings.gradient_color_2 = generateRandomColor();
      settings.gradient_color_3 = generateRandomColor();
      settings.gradient_color_4 = generateRandomColor();
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// Controller to update login screen settings
const updateLoginScreenSettings = async (req, res, next) => {
  // For now, we only have one row of settings, so the ID is constant
  const settingsId = 1; 
  
  // Destructure all possible fields from the body
  const {
    background_type,
    background_solid_color,
    background_image_url,
    background_video_url,
    image_size,
    image_repeat,
    gradient_color_1,
    gradient_color_2,
    gradient_color_3,
    gradient_color_4,
    gradient_speed,
    gradient_direction,
  } = req.body;

  

  try {
    const result = await pool.query(
      `UPDATE login_screen_settings
       SET
         background_type = $1,
         background_solid_color = $2,
         background_image_url = $3,
         background_video_url = $4,
         image_size = $5,
         image_repeat = $6,
         gradient_color_1 = $7,
         gradient_color_2 = $8,
         gradient_color_3 = $9,
         gradient_color_4 = $10,
         gradient_speed = $11,
         gradient_direction = $12
       WHERE id = $13
       RETURNING *`,
      [
        background_type,
        background_solid_color,
        background_image_url,
        background_video_url,
        image_size,
        image_repeat,
        gradient_color_1,
        gradient_color_2,
        gradient_color_3,
        gradient_color_4,
        gradient_speed,
        gradient_direction,
        settingsId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Login screen settings not found to update.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLoginScreenSettings,
  updateLoginScreenSettings,
};
