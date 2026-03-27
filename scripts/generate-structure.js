const fs = require('fs');
const path = require('path');

function getStructure(dir, prefix = '') {
    let result = '';
    let items = [];
    try {
        items = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
        return '';
    }

    // Filter out .git, node_modules, .next
    const filteredItems = items.filter(item =>
        !['.git', 'node_modules', '.next'].includes(item.name)
    );

    // Sort items: directories first, then files
    filteredItems.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
    });

    filteredItems.forEach((item, index) => {
        const isLast = index === filteredItems.length - 1;
        const marker = isLast ? '└── ' : '├── ';
        const newPrefix = prefix + (isLast ? '    ' : '│   ');

        result += `${prefix}${marker}${item.name}\n`;

        if (item.isDirectory()) {
            result += getStructure(path.join(dir, item.name), newPrefix);
        }
    });

    return result;
}

const structure = getStructure('.');
fs.writeFileSync('structure.txt', structure, 'utf8');
console.log('Structure generated in structure.txt');
