// backend/scripts/convert-migrations-to-esm.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, '../migrations');

async function convertMigrationsToESM() {
  try {
    const files = await fs.readdir(migrationsDir);

    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = path.join(migrationsDir, file);
        let content = await fs.readFile(filePath, 'utf8');

        if (content.includes('module.exports') || content.includes('exports.')) { // Adicionado content.includes('exports.')
          console.log(`Converting ${file} to ESM...`);

          // Case 1: module.exports = { ... }
          content = content.replace(/module\.exports\s*=\s*{/g, 'export default {');

          // Case 2: module.exports.shorthands = undefined; or exports.shorthands = undefined;
          content = content.replace(/(module\.)?exports\.shorthands\s*=\s*undefined;/g, 'export const shorthands = undefined;');

          // Case 3: module.exports.up = pgm => { or module.exports.up = (pgm) => {
          // Or exports.up = pgm => { or exports.up = (pgm) => {
          content = content.replace(/(module\.)?exports\.up\s*=\s*(async)?\s*(\(pgm\)|pgm)\s*=>\s*{/g, 'export async function up(pgm) {');
          content = content.replace(/(module\.)?exports\.down\s*=\s*(async)?\s*(\(pgm\)|pgm)\s*=>\s*{/g, 'export async function down(pgm) {');

          // Ensure async is added to up/down functions if they are part of export default { ... }
          content = content.replace(/up:\s*(\(pgm\)|pgm)\s*=>\s*{/g, 'up: async (pgm) => {');
          content = content.replace(/down:\s*(\(pgm\)|pgm)\s*=>\s*{/g, 'down: async (pgm) => {');

          await fs.writeFile(filePath, content, 'utf8');
          console.log(`Converted ${file}`);
        }
      }
    }
    console.log('All migrations checked and converted to ESM where necessary.');
  } catch (error) {
    console.error('Error converting migrations:', error);
  }
}

convertMigrationsToESM();