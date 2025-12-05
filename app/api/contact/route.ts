import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
    try {
        // Parse the request body
        const body = await request.json();
        const { name, email, phone, company, field, message, to, attachmentUrls } = body;

        // Basic validation
        if (!name || !email || !phone || !company || !message || !to) {
            return NextResponse.json(
                { error: '필수 입력 항목이 누락되었습니다.' },
                { status: 400 },
            );
        }

        // Construct attachment links HTML
        let attachmentHtml = '';
        if (attachmentUrls && Array.isArray(attachmentUrls) && attachmentUrls.length > 0) {
            attachmentHtml = attachmentUrls.map((url: string, index: number) =>
                `<a href="${url}" target="_blank" style="display: inline-block; padding: 10px 15px; margin: 5px 0; background-color: #f1f1f1; color: #333; text-decoration: none; border-radius: 5px; border: 1px solid #ddd; font-size: 14px;">📄 첨부파일 ${index + 1} 다운로드</a>`
            ).join('<br>');
        } else if (body.attachmentUrl) {
            attachmentHtml = `<a href="${body.attachmentUrl}" target="_blank" style="display: inline-block; padding: 10px 15px; margin: 5px 0; background-color: #f1f1f1; color: #333; text-decoration: none; border-radius: 5px; border: 1px solid #ddd; font-size: 14px;">📄 첨부파일 다운로드</a>`;
        }

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #000000; padding: 30px 40px; text-align: center; }
        .header h1 { color: #FFD700; margin: 0; font-size: 24px; letter-spacing: 2px; }
        .content { padding: 40px; color: #333; line-height: 1.6; }
        .label { color: #666; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; display: block; }
        .value { color: #000; font-size: 16px; margin-bottom: 20px; font-weight: 500; }
        .message-box { background-color: #f9f9f9; padding: 20px; border-radius: 6px; border-left: 4px solid #FFD700; margin-top: 10px; }
        .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
        .button-link { color: #000; text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>INSIGHTBUILD</h1>
        </div>
        <div class="content">
            <h2 style="margin-top: 0; margin-bottom: 30px; border-bottom: 2px solid #FFD700; padding-bottom: 10px; display: inline-block;">새로운 문의가 도착했습니다</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <span class="label">이름</span>
                    <div class="value">${name}</div>
                </div>
                <div>
                    <span class="label">연락처</span>
                    <div class="value">${phone}</div>
                </div>
                <div>
                    <span class="label">기관/기업명</span>
                    <div class="value">${company}</div>
                </div>
                <div>
                    <span class="label">문의 분야</span>
                    <div class="value" style="color: #d4a000;">${field || '-'}</div>
                </div>
            </div>

            <span class="label" style="margin-top: 10px;">문의 내용</span>
            <div class="message-box">
                ${(message || '').replace(/\n/g, '<br>')}
            </div>

            ${attachmentHtml ? `
                <div style="margin-top: 30px;">
                    <span class="label">첨부 파일</span>
                    <div style="margin-top: 10px;">
                        ${attachmentHtml}
                    </div>
                </div>
            ` : ''}
        </div>
        <div class="footer">
            <p>본 메일은 인사이트빌드 홈페이지 문의 폼을 통해 발송되었습니다.</p>
            <p>© 2026 INSIGHTBUILD. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;

        const result = await resend.emails.send({
            from: 'Insightbuild <contact@insightbuild.kr>',
            to,
            subject: `[${field || '문의'}] 인사이트빌드 홈페이지 문의 접수 (${name}님)`,
            html: emailHtml,
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
