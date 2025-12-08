// app/api/contact-upload-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 1024 * 1024 * 1024;        // 1GB (개별 파일)
const MAX_TOTAL_SIZE = 1024 * 1024 * 1024;     // 1GB (프론트에서 합산 체크 용, 참고)

// Initialize storage
const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

const bucketName = process.env.GCS_BUCKET_NAME || process.env.GCP_BUCKET_NAME;

export async function POST(req: NextRequest) {
    try {
        const { filename, contentType, size } = await req.json();

        if (!filename || !size) {
            return NextResponse.json(
                { error: '파일 정보가 누락되었습니다.' },
                { status: 400 },
            );
        }

        if (!bucketName) {
            return NextResponse.json(
                { error: '서버 설정 오류 (Bucket Name 미설정)' },
                { status: 500 },
            );
        }

        // 개별 파일 10MB 제한 -> 1GB로 상향됨 in user code
        if (size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: '총 첨부파일 용량은 1GB를 초과할 수 없습니다.' },
                { status: 413 },
            );
        }

        const safeName = String(filename).replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const objectName = `contact/${Date.now()}-${safeName}`;

        const bucket = storage.bucket(bucketName);
        const file = bucket.file(objectName);

        const expires = Date.now() + 5 * 60 * 1000; // 5분 유효

        const [uploadUrl] = await file.getSignedUrl({
            version: 'v4',
            action: 'write',
            expires,
            contentType: contentType || 'application/octet-stream',
        });

        const publicUrl = `https://storage.googleapis.com/${bucketName}/${objectName}`;

        return NextResponse.json({
            uploadUrl,
            publicUrl,
            objectName,
        });
    } catch (err) {
        console.error('signed url error:', err);
        return NextResponse.json(
            { error: '업로드 URL 생성 중 오류가 발생했습니다.' },
            { status: 500 },
        );
    }
}
