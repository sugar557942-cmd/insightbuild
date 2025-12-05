// app/api/contact-upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

const bucketName = process.env.GCP_BUCKET_NAME as string;

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const file = formData.get('file') as File | null;
        const name = formData.get('name') as string | null;
        const company = formData.get('company') as string | null;
        const phone = formData.get('phone') as string | null;
        const message = formData.get('message') as string | null;

        if (!file) {
            return NextResponse.json(
                { error: '첨부된 파일이 없습니다.' },
                { status: 400 },
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const filename = `contact/${Date.now()}-${safeName}`;

        const bucket = storage.bucket(bucketName);
        const gcsFile = bucket.file(filename);

        await gcsFile.save(buffer, {
            contentType: file.type,
            resumable: false,
        });

        const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

        // 필요하면 여기에서 Resend 이메일도 같이 보내면 됨

        return NextResponse.json({
            success: true,
            fileUrl: publicUrl,
            name,
            company,
            phone,
            message,
        });
    } catch (err) {
        console.error('contact-upload error:', err);
        return NextResponse.json(
            { error: '업로드 중 오류가 발생했습니다.' },
            { status: 500 },
        );
    }
}
