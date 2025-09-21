import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o __dirname equivalente em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do .env.test
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });