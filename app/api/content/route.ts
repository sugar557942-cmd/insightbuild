import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// GCS Configuration
const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

const bucketName = process.env.GCS_BUCKET_NAME || process.env.GCP_BUCKET_NAME;
const fileName = 'content.json';
const localDataPath = path.join(process.cwd(), 'data', 'content.json');

export async function GET() {
    // 1. Try reading from GCS first
    if (bucketName) {
        try {
            const bucket = storage.bucket(bucketName);
            const file = bucket.file(fileName);
            const [exists] = await file.exists();

            if (exists) {
                const [content] = await file.download();
                const data = JSON.parse(content.toString('utf8'));
                return NextResponse.json(data);
            }
        } catch (error) {
            console.error('Content API: GCS read failed', error);
        }
    }

    // 2. Fallback: Read local file (Seed data or if GCS fails/missing)
    try {
        if (fs.existsSync(localDataPath)) {
            const fileContents = fs.readFileSync(localDataPath, 'utf8');
            const data = JSON.parse(fileContents);
            return NextResponse.json(data);
        }
    } catch (error) {
        console.error('Content API: Local read failed', error);
    }

    return NextResponse.json({ error: 'Failed to load content' }, { status: 500 });
}

export async function POST(request: Request) {
    if (!bucketName) {
        return NextResponse.json({ error: 'Server Error: GCS_BUCKET_NAME not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);

        // Write to GCS
        await file.save(JSON.stringify(body, null, 2), {
            contentType: 'application/json',
            resumable: false,
        });

        // Write to local FS as well for persistence in this environment (VPS/Container with volume)
        // This ensures that even if GCS is not used, we persist the data locally.
        try {
            const dir = path.dirname(localDataPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(localDataPath, JSON.stringify(body, null, 2), 'utf8');
        } catch (e) {
            console.error('Local backup write failed:', e);
            // Don't fail the request if GCS succeeded or if this is just a backup
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Content Update Error:', error);
        return NextResponse.json({ error: 'Failed to update content', details: error.message }, { status: 500 });
    }
}
