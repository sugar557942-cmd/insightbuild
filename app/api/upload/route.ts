import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

export const dynamic = 'force-dynamic';

// Initialize storage
// credentials will be automatically loaded from environment variables
// GCP_PROJECT_ID, GCP_CLIENT_EMAIL, GCP_PRIVATE_KEY
const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        // Handle newline in env var which is common issue in Vercel
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

const bucketName = process.env.GCS_BUCKET_NAME;

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file received.' },
                { status: 400 }
            );
        }

        if (!bucketName || !process.env.GCP_PROJECT_ID || !process.env.GCP_CLIENT_EMAIL || !process.env.GCP_PRIVATE_KEY) {
            console.error('SERVER CONFIG ERROR: Missing GCS env vars');
            return NextResponse.json(
                { error: 'Server configuration error (Missing GCS credentials).' },
                { status: 500 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Sanitize filename: remove special chars to avoid issues
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const filename = `contact/${Date.now()}_${safeName}`;

        const bucket = storage.bucket(bucketName);
        const gcsFile = bucket.file(filename);

        await gcsFile.save(buffer, {
            contentType: file.type,
            resumable: false,
        });

        // Make the file public
        await gcsFile.makePublic();

        // Public URL
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl
        });

    } catch (error: any) {
        console.error('Upload Error Details:', error);
        return NextResponse.json(
            { error: 'File upload failed.', details: error.message },
            { status: 500 }
        );
    }
}
