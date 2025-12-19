import fs from 'fs';
import path from 'path';

const directory = process.argv[2] || 'backend/src';

function findFiles(dir, ext, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findFiles(filePath, ext, fileList);
        } else if (filePath.endsWith(ext)) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

const tsFiles = [...findFiles(directory, '.ts'), ...findFiles(directory, '.tsx')];

const regex = /((?:import|export)\s+(?:.+?\s+from\s+)?['"])(\.\.?\/[^'"]+?)(?<!\.(?:js|ts|tsx|json|css|scss|svg))(['"])/g;

tsFiles.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const newContent = content.replace(regex, '$1$2.js$3');

        if (newContent !== content) {
            console.log(`Updating file: ${file}`);
            fs.writeFileSync(file, newContent, 'utf8');
        }
    } catch (error) {
        console.error(`Error processing file ${file}:`, error);
    }
});

console.log('Script finished.');
