const fs = require('fs').promises;
const path = require('path');

const logFilePath = path.join(__dirname, '../../logs', 'auth.log');

const logActivity = async (message) => {
  const logMessage = `${new Date().toISOString()} - ${message}\n`;
  try {
    await fs.appendFile(logFilePath, logMessage);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Se o diretório de logs não existe, crie-o
      await fs.mkdir(path.dirname(logFilePath), { recursive: true });
      await fs.appendFile(logFilePath, logMessage);
    } else {
      console.error('Failed to write to log file:', error);
    }
  }
};

module.exports = { logActivity };