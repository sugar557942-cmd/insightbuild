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
    try {
        const body = await request.json();
        const contentString = JSON.stringify(body, null, 2);

        let gcsSuccess = false;
        let localSuccess = false;
        const errors = [];

        // 1. Try GCS Write if configured
        if (bucketName) {
            try {
                const bucket = storage.bucket(bucketName);
                const file = bucket.file(fileName);

                await file.save(contentString, {
                    contentType: 'application/json',
                    resumable: false,
                });
                gcsSuccess = true;
            } catch (error: any) {
                console.error('GCS Save Error:', error);
                errors.push(`GCS: ${error.message}`);
            }
        }

        // 2. Try Local FS Write (Always attempted as fallback or primary)
        try {
            const dir = path.dirname(localDataPath);
            console.log('[API] Writing content to:', localDataPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(localDataPath, contentString, 'utf8');
            console.log('[API] Local write successful');
            localSuccess = true;
        } catch (error: any) {
            console.error('Local FS Save Error:', error);
            errors.push(`Local: ${error.message}`);
        }

        // 3. Return result
        if (gcsSuccess || localSuccess) {
            return NextResponse.json({
                success: true,
                message: 'Content saved successfully',
                savedTo: { gcs: gcsSuccess, local: localSuccess }
            });
        } else {
            throw new Error(`Failed to save to any storage. Errors: ${errors.join(', ')}`);
        }

    } catch (error: any) {
        console.error('Content Update Error:', error);
        return NextResponse.json({ error: 'Failed to update content', details: error.message }, { status: 500 });
    }
}
