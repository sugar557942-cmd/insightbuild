const fs = require('fs');
const path = require('path');

const rootEnvPath = path.join(process.cwd(), '.env.local');
const nextEnvPath = path.join(process.cwd(), '.next', '.env.local');

console.log('Checking environment file locations...');

if (fs.existsSync(rootEnvPath)) {
    console.log('✅ .env.local already exists in root.');
    const content = fs.readFileSync(rootEnvPath, 'utf8');
    console.log(`   Size: ${content.length} bytes`);
} else {
    console.log('❌ .env.local NOT found in root.');

    if (fs.existsSync(nextEnvPath)) {
        console.log('found .env.local in .next folder. Moving...');
        try {
            const content = fs.readFileSync(nextEnvPath, 'utf8');
            fs.writeFileSync(rootEnvPath, content);
            console.log('✅ Successfully copied .env.local to root.');

            // Optional: verify
            if (fs.existsSync(rootEnvPath)) {
                console.log('   Verification: File exists in root now.');
            }
        } catch (e) {
            console.error('   Error moving file:', e);
        }
    } else {
        console.log('❌ .env.local NOT found in .next folder either.');
    }
}
