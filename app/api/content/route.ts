// app/api/content/route.ts
import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const isProd = process.env.NODE_ENV === 'production';

// GCS 설정
const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

const bucketName =
    process.env.GCS_BUCKET_NAME || process.env.GCP_BUCKET_NAME || '';

const fileName = 'content.json';
const localDataPath = path.join(process.cwd(), 'data', 'content.json');

// GET: 콘텐츠 읽기
export async function GET() {
    // 1) 운영 환경: GCS 에서만 읽기
    if (isProd) {
        if (!bucketName) {
            console.error('Content API: bucketName not set in production');
            return NextResponse.json(
                { error: 'Storage bucket is not configured' },
                { status: 500 },
            );
        }

        try {
            const bucket = storage.bucket(bucketName);
            const file = bucket.file(fileName);
            const [exists] = await file.exists();

            if (!exists) {
                console.error('Content API: content.json not found in GCS');
                return NextResponse.json(
                    { error: 'Content not found' },
                    { status: 404 },
                );
            }

            const [content] = await file.download();
            const data = JSON.parse(content.toString('utf8'));
            return NextResponse.json(data);
        } catch (error) {
            console.error('Content API: GCS read failed in production', error);
            return NextResponse.json(
                { error: 'Failed to load content from storage' },
                { status: 500 },
            );
        }
    }

    // 2) 개발 환경: GCS → 로컬 파일 순으로 읽기
    try {
        if (bucketName) {
            const bucket = storage.bucket(bucketName);
            const file = bucket.file(fileName);
            const [exists] = await file.exists();

            if (exists) {
                const [content] = await file.download();
                const data = JSON.parse(content.toString('utf8'));
                return NextResponse.json(data);
            }
        }
    } catch (error) {
        console.error('Content API (dev): GCS read failed', error);
    }

    try {
        if (fs.existsSync(localDataPath)) {
            const fileContents = fs.readFileSync(localDataPath, 'utf8');
            const data = JSON.parse(fileContents);
            return NextResponse.json(data);
        }
    } catch (error) {
        console.error('Content API (dev): Local read failed', error);
    }

    return NextResponse.json(
        { error: 'Failed to load content' },
        { status: 500 },
    );
}

// POST: 콘텐츠 저장
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const contentString = JSON.stringify(body, null, 2);

        let gcsSuccess = false;
        let localSuccess = false;
        const errors: string[] = [];

        // 1) 운영 환경: GCS 에만 저장
        if (isProd) {
            if (!bucketName) {
                return NextResponse.json(
                    { error: 'Storage bucket is not configured' },
                    { status: 500 },
                );
            }

            try {
                const bucket = storage.bucket(bucketName);
                const file = bucket.file(fileName);

                await file.save(contentString, {
                    contentType: 'application/json',
                    resumable: false,
                });
                gcsSuccess = true;
            } catch (error: any) {
                console.error('Content API: GCS Save Error (prod)', error);
                errors.push(`GCS: ${error.message}`);
            }
        } else {
            // 2) 개발 환경: GCS + 로컬 파일 둘 다 시도
            if (bucketName) {
                try {
                    const bucket = storage.bucket(bucketName);
                    const file = bucket.file(fileName);

                    await file.save(contentString, {
                        contentType: 'application/json',
                    }

        throw new Error(`Failed to save content. Errors: ${errors.join(', ')}`);
                } catch (error: any) {
                    console.error('Content Update Error:', error);
                    return NextResponse.json(
                        { error: 'Failed to update content', details: error.message },
                        { status: 500 },
                    );
                }
            }
