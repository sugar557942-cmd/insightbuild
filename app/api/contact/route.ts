import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, company, phone, message, field, attachmentUrls } = body;

        const to = process.env.CONTACT_TO || 'insightbuild@daum.net';

        // Construct attachment links if exist
        let attachmentHtml = '';
        if (attachmentUrls && Array.isArray(attachmentUrls) && attachmentUrls.length > 0) {
            attachmentHtml = `<p><strong>첨부 파일:</strong><br>${attachmentUrls.map((url: string, index: number) =>
                `<a href="${url}" target="_blank">다운로드 ${index + 1}</a>`
            ).join('<br>')}</p>`;
        } else if (body.attachmentUrl) {
            // Fallback for single file (legacy or mismatch)
            attachmentHtml = `<p><strong>첨부 파일:</strong> <a href="${body.attachmentUrl}" target="_blank">다운로드</a></p>`;
        }

        const result = await resend.emails.send({
            // ★ 여기 아주 중요: contact@insightbuild.kr 로 고정
            from: 'Insightbuild <contact@insightbuild.kr>',
            to,
            subject: `[${field || '문의'}] 인사이트빌드 홈페이지 문의 접수`,
            html: `
                <h2>인사이트빌드 홈페이지에서 새 문의가 접수되었습니다.</h2>
                <p><strong>이름:</strong> ${name}</p>
                <p><strong>기업 또는 기관명:</strong> ${company}</p>
                <p><strong>연락처:</strong> ${phone}</p>
                <p><strong>문의 분야:</strong> ${field || '-'}</p>
                <p><strong>문의 내용:</strong></p>
                <p>${(message || '').replace(/\n/g, '<br>')}</p>
                ${attachmentHtml}
            `,
        });

        console.log('Resend email result:', result);

        return NextResponse.json({
            success: true,
            message: '문의가 접수되었습니다.',
        });
    } catch (error: any) {
        console.error('Contact API error details:', error);
        return NextResponse.json(
            { error: '전송에 실패했습니다.', details: error.message },
            { status: 500 },
        );
    }
}
