const fs = require('fs');
const path = require('path');

const logFile = path.join(process.cwd(), 'env-debug.log');
const src = path.join(process.cwd(), '.next', '.env.local');
const dest = path.join(process.cwd(), '.env.local');

fs.writeFileSync(logFile, `Start: src=${src}\n`);

try {
    if (fs.existsSync(src)) {
        fs.appendFileSync(logFile, 'Source exists\n');
        const content = fs.readFileSync(src, 'utf8');
        fs.writeFileSync(dest, content);
        fs.appendFileSync(logFile, 'Copied successfully\n');
    } else {
        fs.appendFileSync(logFile, 'Source NOT found\n');
        try {
            const nextDir = path.join(process.cwd(), '.next');
            const files = fs.readdirSync(nextDir);
            fs.appendFileSync(logFile, `.next contents: ${files.join(', ')}\n`);
        } catch (e) {
            fs.appendFileSync(logFile, `Error reading .next: ${e.message}\n`);
        }
    }
} catch (e) {
    fs.appendFileSync(logFile, `Error: ${e.message}\n`);
}
