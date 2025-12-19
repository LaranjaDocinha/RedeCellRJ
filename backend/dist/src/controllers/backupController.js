import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_DIR = path.join(__dirname, '../../backups');
export const createBackup = async (req, res, next) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `pdv_web_backup_${timestamp}.sql`;
        const backupFilePath = path.join(BACKUP_DIR, backupFileName);
        const dbUser = process.env.DB_USER || 'postgres';
        const dbName = process.env.DB_NAME || 'pdv_web';
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = process.env.DB_PORT || '5432';
        const dbPassword = process.env.DB_PASSWORD; // Ensure this is available
        if (!dbPassword) {
            return res.status(500).json({ message: 'Database password not configured.' });
        }
        // Use PGPASSWORD environment variable for pg_dump
        const command = `PGPASSWORD=${dbPassword} pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} > ${backupFilePath}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).json({ message: 'Failed to create backup.', error: stderr });
            }
            console.log(`Backup created: ${backupFileName}`);
            res.status(200).json({ message: 'Backup created successfully.', fileName: backupFileName });
        });
    }
    catch (error) {
        next(error);
    }
};
