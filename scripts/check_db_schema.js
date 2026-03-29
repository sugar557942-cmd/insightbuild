const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSchema() {
    console.log('Attempting to fix database schema...');
    
    // Since supabase-js doesn't support ALTER TABLE, we inform the user.
    // However, we can try to use the REST API to see if the columns exist.
    
    console.log('\n--- IMPORTANT INSTRUCTION ---');
    console.log('supabase-js does not support running raw SQL (ALTER TABLE).');
    console.log('Please copy and run the following SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql):');
    console.log('\nALTER TABLE reports ADD COLUMN IF NOT EXISTS image_url TEXT;');
    console.log('ALTER TABLE reports ADD COLUMN IF NOT EXISTS market_charts JSONB;');
    console.log('\n--- END INSTRUCTION ---\n');
    
    try {
        const { data, error } = await supabase.from('reports').select('image_url').limit(1);
        if (error && error.message.includes('column "image_url" does not exist')) {
            console.log('Confirmed: column "image_url" is missing.');
        } else if (!error) {
            console.log('Column "image_url" already exists.');
        } else {
            console.log('Error checking schema:', error.message);
        }
    } catch (e) {
        console.error('An unexpected error occurred:', e);
    }
}

fixSchema();
