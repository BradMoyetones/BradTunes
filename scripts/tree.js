import fs from 'fs';
import path from 'path';
const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'target', 'turbo', '.vscode', 'gen']);
function generateTree(dirPath, prefix = '') {
    let items = [];
    try {
        items = fs.readdirSync(dirPath);
    } catch (err) {
        return ''; // Retorna vacío si no hay permisos de lectura
    }
    // Filtrar los elementos excluidos
    const filteredItems = items.filter((item) => !EXCLUDE_DIRS.has(item));
    let result = '';

    filteredItems.forEach((item, index) => {
        const isLast = index === filteredItems.length - 1;
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);
        const isDirectory = stats.isDirectory();
        const connector = isLast ? '└── ' : '├── ';
        result += `${prefix}${connector}${item}\n`;

        if (isDirectory) {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            result += generateTree(fullPath, newPrefix);
        }
    });

    return result;
}
const projectDir = process.cwd();
console.log(path.basename(projectDir));
console.log(generateTree(projectDir));
