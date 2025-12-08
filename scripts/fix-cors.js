const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

// Manually load env vars from .env.local or .env
function loadEnv() {
    const envPaths = ['.env.local', '.env'];
    const envVars = {};

    for (const envPath of envPaths) {
        const fullPath = path.resolve(process.cwd(), envPath);
        if (fs.existsSync(fullPath)) {
            console.log(`Loading env from ${envPath}`);
            const content = fs.readFileSync(fullPath, 'utf-8');
            content.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    let value = match[2].trim();
                    // Remove quotes if present
                    if ((value.startsWith('"') && value.endsWith('"')) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }
                    envVars[key] = value;
                }
            });
        }
    }
    return envVars;
}

async function fixCors() {
    const env = loadEnv();

    const projectId = env.GCP_PROJECT_ID || process.env.GCP_PROJECT_ID;
    const clientEmail = env.GCP_CLIENT_EMAIL || process.env.GCP_CLIENT_EMAIL;
    const privateKey = (env.GCP_PRIVATE_KEY || process.env.GCP_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    const bucketName = env.GCS_BUCKET_NAME || env.GCP_BUCKET_NAME || process.env.GCS_BUCKET_NAME;

    if (!projectId || !clientEmail || !privateKey || !bucketName) {
        console.error('Missing required environment variables.');
        console.error(`ProjectID: ${!!projectId}, Email: ${!!clientEmail}, Key: ${!!privateKey}, Bucket: ${!!bucketName}`);
        process.exit(1);
    }

    const storage = new Storage({
        projectId,
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
        },
    });

    try {
        const bucket = storage.bucket(bucketName);
        console.log(`Setting CORS for bucket: ${bucketName}...`);

        await bucket.setCorsConfiguration([
            {
                maxAgeSeconds: 3600,
                method: ['GET', 'PUT', 'POST', 'OPTIONS'],
                origin: ['*'],
                responseHeader: ['Content-Type', 'Access-Control-Allow-Origin', 'x-goog-resumable'],
            },
        ]);

        console.log('Successfully updated CORS configuration.');
    } catch (error) {
        console.error('Failed to update CORS:', error);
        process.exit(1);
    }
}

fixCors();
