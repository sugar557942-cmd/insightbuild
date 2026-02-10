import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

const bucketName = process.env.GCS_BUCKET_NAME || process.env.GCP_BUCKET_NAME;
const fileName = 'visitors.json';
const localDataPath = path.join(process.cwd(), 'data', 'visitors.json');

export async function GET() {
    if (!bucketName) {
        // Fallback: Read local file
        if (fs.existsSync(localDataPath)) {
            try {
                const content = fs.readFileSync(localDataPath, 'utf8');
                const rawData = JSON.parse(content);

                if (rawData.date && typeof rawData.todayCount === 'number' && !rawData.history) {
                    return NextResponse.json({
                        totalCount: rawData.totalCount || 0,
                        history: { [rawData.date]: rawData.todayCount }
                    });
                }

                return NextResponse.json({
                    totalCount: rawData.totalCount || 0,
                    history: rawData.history || {}
                });
            } catch (e) {
                return NextResponse.json({ totalCount: 0, history: {} });
            }
        }
        return NextResponse.json({ totalCount: 0, history: {} });
    }

    try {
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);

        // 1. Try to read from GCS
        const [exists] = await file.exists();
        if (exists) {
            const [content] = await file.download();
            const rawData = JSON.parse(content.toString('utf8'));
            // No migration needed here as we just read what's there. 
            // The main route handles migration on write.
            // But if it's old format, we should probably standardize the output.

            if (rawData.date && typeof rawData.todayCount === 'number' && !rawData.history) {
                // It's old format
                return NextResponse.json({
                    totalCount: rawData.totalCount || 0,
                    history: { [rawData.date]: rawData.todayCount }
                });
            }

            return NextResponse.json({
                totalCount: rawData.totalCount || 0,
                history: rawData.history || {}
            });
        }

        return NextResponse.json({ totalCount: 0, history: {} });

    } catch (error) {
        console.error('Visitor Stats Error:', error);
        return NextResponse.json({ totalCount: 0, history: {} });
    }
}
