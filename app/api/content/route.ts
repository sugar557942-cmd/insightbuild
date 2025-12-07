// app/api/content/route.ts
import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GCS 설정
const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

const bucketName = process.env.GCS_BUCKET_NAME || process.env.GCP_BUCKET_NAME;
const fileName = 'content.json';

// 개발 환경에서만 사용하는 seed 파일 경로
const localDataPath = path.join(process.cwd(), 'data', 'content.json');

const isDev = process.env.NODE_ENV !== 'production';

/**
 * GET /api/content
 *  - 우선 GCS에서 읽기
 *  - 개발 환경이고 GCS가 없거나 실패하면 로컬 파일에서 읽기
 */
export async function GET() {
    // 1. GCS 우선
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
            // 프로덕션이면 바로 에러 응답
            if (!isDev) {
                return NextResponse.json(
                    { error: 'Failed to load content from GCS' },
                    { status: 500 },
                );
            }
        }
    }

    // 2. (개발환경 한정) 로컬 파일 fallback
    if (isDev) {
        try {
            if (fs.existsSync(localDataPath)) {
                const fileContents = fs.readFileSync(localDataPath, 'utf8');
                const data = JSON.parse(fileContents);
                return NextResponse.json(data);
            }
        } catch (error) {
            console.error('Content API: Local read failed', error);
        }
    }

    return NextResponse.json(
        { error: 'Failed to load content' },
        { status: 500 },
    );
}

/**
 * POST /api/content
 *  - 프로덕션: GCS에만 저장. 실패하면 500으로 돌려보냄
 *  - 개발: GCS 있으면 GCS, 없으면 로컬 파일에 저장
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const contentString = JSON.stringify(body, null, 2);

        // 프로덕션이고 GCS가 없으면 경고 로그 (하지만 로컬에는 저장 시도)
        if (!bucketName && !isDev) {
            console.warn('No GCS bucket configured in production. Falling back to local FS.');
        }

        let savedToGcs = false;
        let savedToLocal = false;
        const errors: string[] = [];

        // 1. GCS 저장 (가능하면 항상 시도)
        if (bucketName) {
            try {
                const bucket = storage.bucket(bucketName);
                const file = bucket.file(fileName);

                await file.save(contentString, {
                    contentType: 'application/json',
                    resumable: false,
                });
                savedToGcs = true;
            } catch (error: any) {
                console.error('GCS Save Error:', error);
                errors.push(`GCS: ${error.message}`);
            }
        }

        // 2. Local FS Write (Always attempted as fallback or primary)
        // 개발 환경뿐만 아니라, 프로덕션에서도 로컬 볼륨 저장을 위해 조건 제거
        try {
            const dir = path.dirname(localDataPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(localDataPath, contentString, 'utf8');
            savedToLocal = true;
        } catch (error: any) {
            console.error('Local FS Save Error:', error);
            errors.push(`Local: ${error.message}`);
        }

        // 3. 저장 성공 여부에 따라 응답
        if (savedToGcs || savedToLocal) {
            return NextResponse.json({
                success: true,
                message: 'Content saved successfully',
                savedTo: { gcs: savedToGcs, local: savedToLocal },
            });
        }

        // 둘 다 실패한 경우
        throw new Error(
            `Failed to save content. Errors: ${errors.join(', ') || 'unknown'}`,
        );
    } catch (error: any) {
        console.error('Content Update Error:', error);
        return NextResponse.json(
            { error: 'Failed to update content', details: error.message },
            { status: 500 },
        );
    }
}
