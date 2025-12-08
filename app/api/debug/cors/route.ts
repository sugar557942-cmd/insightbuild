import { NextResponse } from 'next/server';

import { Storage } from '@google-cloud/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
    console.log('--- CORS DEBUG ROUTE STARTED ---');

    const envStatus = {
        GCP_PROJECT_ID: !!process.env.GCP_PROJECT_ID,
        GCP_CLIENT_EMAIL: !!process.env.GCP_CLIENT_EMAIL,
        GCP_PRIVATE_KEY: !!process.env.GCP_PRIVATE_KEY,
        GCS_BUCKET_NAME: !!process.env.GCS_BUCKET_NAME,
        GCP_BUCKET_NAME: !!process.env.GCP_BUCKET_NAME,
    };

    console.log('Environment Status:', envStatus);

    try {
        const projectId = process.env.GCP_PROJECT_ID;
        const clientEmail = process.env.GCP_CLIENT_EMAIL;
        const privateKeyRaw = process.env.GCP_PRIVATE_KEY;
        const bucketName = process.env.GCS_BUCKET_NAME || process.env.GCP_BUCKET_NAME;

        if (!bucketName) {
            return NextResponse.json({
                error: 'Bucket Name is missing',
                envStatus
            }, { status: 500 });
        }

        // Initialize storage (lenient, trusting SDK to handle auth if some vars missing but ADC present)
        const storageOptions: any = {
            projectId,
        };

        if (clientEmail && privateKeyRaw) {
            storageOptions.credentials = {
                client_email: clientEmail,
                private_key: privateKeyRaw.replace(/\\n/g, '\n'),
            };
        }

        const storage = new Storage(storageOptions);
        const bucket = storage.bucket(bucketName);

        console.log(`Getting bucket reference: ${bucketName}`);
        console.log('Setting CORS configuration...');

        await bucket.setCorsConfiguration([
            {
                maxAgeSeconds: 3600,
                method: ['GET', 'PUT', 'POST', 'OPTIONS'],
                origin: ['*'],
                responseHeader: ['Content-Type', 'Access-Control-Allow-Origin', 'x-goog-resumable'],
            },
        ]);

        console.log('CORS configuration passed to GCS API.');

        console.log('--- CORS DEBUG ROUTE SUCCESS ---');
        return NextResponse.json({
            success: true,
            message: `CORS configuration updated for bucket: ${bucketName}`,
            timestamp: new Date().toISOString(),
            envStatus,
        });

    } catch (error: any) {
        console.error('--- CORS DEBUG ROUTE ERROR ---', error);
        return NextResponse.json(
            {
                error: 'Failed to update CORS',
                details: error.message,
                stack: error.stack,
                envStatus
            },
            { status: 500 }
        );
    }
}
