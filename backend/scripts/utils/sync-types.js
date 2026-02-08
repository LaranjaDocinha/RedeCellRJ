import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, '../src/types/shared.ts');
const dest = path.join(__dirname, '../../../frontend/src/types/shared.ts');

console.log(`Syncing types from ${source} to ${dest}...`);

try {
  const content = fs.readFileSync(source, 'utf8');
  // Ensure dest directory exists
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  fs.writeFileSync(dest, content);
  console.log('Types synced successfully!');
} catch (err) {
  console.error('Error syncing types:', err);
  process.exit(1);
}
