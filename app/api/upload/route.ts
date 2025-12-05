import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

export const dynamic = 'force-dynamic';

// Initialize storage outside if possible, or inside trying to handle missing envs gracefully?
// Best practice: Initialize lazily or check envs.
const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        // Handle potential escaped newlines in private key
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

const bucketName = process.env.GCS_BUCKET_NAME as string;

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            console.error('Upload error: No file provided');
            return NextResponse.json(
                { error: 'No file received.' },
                { status: 400 }
            );
        }

        // Validate GCS Config
        if (!process.env.GCP_PROJECT_ID || !process.env.GCP_CLIENT_EMAIL || !process.env.GCP_PRIVATE_KEY || !bucketName) {
            console.error('Upload error: Missing GCS configuration');
            return NextResponse.json(
                { error: 'Server configuration error.' },
                { status: 500 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Sanitize filename
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const filename = `contact/${Date.now()}_${safeName}`;

        const bucket = storage.bucket(bucketName);
        const gcsFile = bucket.file(filename);

        await gcsFile.save(buffer, {
            contentType: file.type || 'application/octet-stream',
            resumable: false,
        });

        // Make the file public
        await gcsFile.makePublic();

        const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

        console.log(`File uploaded successfully: ${publicUrl}`);

        return NextResponse.json({
            message: 'Success',
            url: publicUrl
        });
    } catch (error: any) {
        console.error('Upload error details:', error);
        return NextResponse.json(
            { error: 'Error occurred during file upload.', details: error.message },
            { status: 500 }
        );
    }
}
