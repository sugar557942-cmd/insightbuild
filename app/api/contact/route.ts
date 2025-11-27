import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, company, phone, message } = body;

        const to = process.env.CONTACT_TO || 'insightbuild@daum.net';

        const result = await resend.emails.send({
            // ★ 여기 아주 중요: onboarding@resend.dev 로 고정
            from: 'Insightbuild <onboarding@resend.dev>',
            to,
            subject: '인사이트빌드 홈페이지 문의 접수',
            html: `
                <h2>인사이트빌드 홈페이지에서 새 문의가 접수되었습니다.</h2>
                <p><strong>이름:</strong> ${name}</p>
                <p><strong>기업 또는 기관명:</strong> ${company}</p>
                <p><strong>연락처:</strong> ${phone}</p>
                <p><strong>문의 내용:</strong></p>
                <p>${(message || '').replace(/\n/g, '<br>')}</p>
            `,
        });

        console.log('Resend email result:', result);

        return NextResponse.json({
            success: true,
            message: '문의가 접수되었습니다.',
        });
    } catch (error) {
        console.error('Contact API error:', error);
        return NextResponse.json(
            { error: '전송에 실패했습니다.' },
            { status: 500 },
        );
    }
}
