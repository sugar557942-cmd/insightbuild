import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, company, phone, message } = body;

        // 받을 메일 주소 (환경변수 없으면 기본값으로 insightbuild@daum.net 사용)
        const to = process.env.CONTACT_TO || 'insightbuild@daum.net';

        // Resend를 이용해 실제 이메일 발송
        const result = await resend.emails.send({
            from: 'Insightbuild Contact <contact@insightbuild.site>',
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

        // 필요하면 로그로 확인
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
