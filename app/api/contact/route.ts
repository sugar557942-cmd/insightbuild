// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// 이 라우트는 항상 동적으로, Node 런타임에서만 실행되게 지정
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 메일을 실제로 받을 주소 (env 없으면 기본값 사용)
const CONTACT_TO =
    process.env.CONTACT_TO_EMAIL || 'insightbuild@daum.net';

export async function POST(request: Request) {
    try {
        // 환경변수 체크
        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY가 설정되어 있지 않습니다.');
            return NextResponse.json(
                { error: '메일 설정 오류(환경 변수 미설정)' },
                { status: 500 },
            );
        }

        if (!CONTACT_TO) {
            console.error('CONTACT_TO_EMAIL(수신자)가 설정되어 있지 않습니다.');
            return NextResponse.json(
                { error: '메일 수신자 설정 오류' },
                { status: 500 },
            );
        }

        // 요청마다 Resend 인스턴스 생성
        const resend = new Resend(process.env.RESEND_API_KEY);

        const body = await request.json();

        // 프론트에서 실제로 보내는 필드 기준으로 구조분해
        const {
            name,
            company,
            phone,
            field,
            message,
            attachmentUrls, // 여러 개일 때
            attachmentUrl,  // 단일 파일일 때
            email,          // (선택) 나중에 폼에 추가할 수도 있으니 남겨둠
        } = body;

        // 필수 항목 검증: 폼에 실제로 존재하는 것만 체크
        if (!name || !company || !phone || !message) {
            return NextResponse.json(
                { error: '필수 입력 항목이 누락되었습니다.' },
                { status: 400 },
            );
        }

        // 첨부파일 링크 HTML 생성
        let attachmentHtml = '';

        if (attachmentUrls && Array.isArray(attachmentUrls) && attachmentUrls.length > 0) {
            attachmentHtml = attachmentUrls
                .map(
                    (url: string, index: number) => `
            <a href="${url}" target="_blank"
               style="display: inline-block; padding: 16px 20px; margin: 0 0 10px 0; width: 100%; box-sizing: border-box;
                      background-color: #1a1a1a; color: #ffffff; text-decoration: none;
                      border: 1px solid #333; border-left: 4px solid #FFD700; font-size: 14px; font-weight: 500;">
              � 첨부파일 ${index + 1} 다운로드
            </a>`,
                )
                .join('');
        } else if (attachmentUrl) {
            const url = attachmentUrl as string;
            attachmentHtml = `
            <a href="${url}" target="_blank"
               style="display: inline-block; padding: 16px 20px; margin: 0 0 10px 0; width: 100%; box-sizing: border-box;
                      background-color: #1a1a1a; color: #ffffff; text-decoration: none;
                      border: 1px solid #333; border-left: 4px solid #FFD700; font-size: 14px; font-weight: 500;">
              � 첨부파일 다운로드
            </a>`;
        }

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inquiry Notification</title>
</head>
<body style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #000000; color: #ffffff;">
    <div style="width: 100%; background-color: #000000; padding: 60px 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 0 20px;">
            
            <!-- Header Logo -->
            <div style="border-bottom: 1px solid #333333; padding-bottom: 20px; margin-bottom: 50px;">
                <h3 style="margin: 0; font-size: 12px; letter-spacing: 6px; color: #ffffff; text-transform: uppercase; font-weight: 700;">INSIGHTBUILD</h3>
            </div>

            <!-- Hero Title -->
            <div style="margin-bottom: 60px;">
                <h1 style="color: #FFD700; font-size: 52px; font-weight: 900; line-height: 1.0; margin: 0; letter-spacing: -1px;">
                    NEW<br>INQUIRY
                </h1>
                <p style="margin: 15px 0 0 0; color: #666666; font-size: 14px; font-weight: 400;">
                    새로운 문의가 접수되었습니다
                </p>
            </div>

            <!-- Grid Info -->
            <div style="border-top: 4px solid #FFD700; padding-top: 40px; margin-bottom: 50px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td width="50%" valign="top" style="padding-bottom: 40px; padding-right: 20px;">
                            <span style="font-size: 11px; color: #666666; display: block; margin-bottom: 10px; font-weight: 700; letter-spacing: 1px;">NAME</span>
                            <div style="font-size: 18px; color: #ffffff; font-weight: 500;">${name}</div>
                        </td>
                        <td width="50%" valign="top" style="padding-bottom: 40px;">
                            <span style="font-size: 11px; color: #666666; display: block; margin-bottom: 10px; font-weight: 700; letter-spacing: 1px;">CONTACT</span>
                            <div style="font-size: 18px; color: #ffffff; font-weight: 500; font-feature-settings: 'tnum';">${phone}</div>
                        </td>
                    </tr>
                    <tr>
                        <td width="50%" valign="top" style="padding-bottom: 10px; padding-right: 20px;">
                            <span style="font-size: 11px; color: #666666; display: block; margin-bottom: 10px; font-weight: 700; letter-spacing: 1px;">COMPANY</span>
                            <div style="font-size: 18px; color: #ffffff; font-weight: 500;">${company}</div>
                        </td>
                        <td width="50%" valign="top" style="padding-bottom: 10px;">
                            <span style="font-size: 11px; color: #666666; display: block; margin-bottom: 10px; font-weight: 700; letter-spacing: 1px;">FIELD</span>
                            <div style="font-size: 18px; color: #FFD700; font-weight: 700;">${field || '-'}</div>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Message -->
            <div style="border-top: 1px solid #333333; padding-top: 40px; padding-bottom: 40px;">
                <span style="font-size: 11px; color: #666666; display: block; margin-bottom: 25px; font-weight: 700; letter-spacing: 1px;">MESSAGE</span>
                <div style="font-size: 16px; line-height: 1.8; color: #e0e0e0; white-space: pre-wrap;">${(message || '').replace(/\n/g, '<br>')}</div>
            </div>

            <!-- Attachments -->
            ${attachmentHtml ? `
            <div style="border-top: 1px solid #333333; padding-top: 40px; margin-bottom: 40px;">
                <span style="font-size: 11px; color: #666666; display: block; margin-bottom: 25px; font-weight: 700; letter-spacing: 1px;">ATTACHMENTS</span>
                ${attachmentHtml}
            </div>
            ` : ''}

            <!-- Footer -->
            <div style="margin-top: 80px; padding-top: 20px; border-top: 1px solid #222222; font-size: 10px; color: #444444; text-align: left; text-transform: uppercase;">
                <p style="margin: 0; line-height: 1.6;">
                    Sent via Insightbuild Contact Form<br>
                    © 2026 Insightbuild. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

        const result = await resend.emails.send({
            from: 'Insightbuild <contact@insightbuild.kr>',
            to: CONTACT_TO, // 이제 body.to 대신 고정 수신자 사용
            subject: `[${field || '문의'}] 인사이트빌드 홈페이지 문의 접수 (${name}님)`,
            html: emailHtml,
            // 폼에 email 필드를 나중에 추가한다면 이렇게 사용할 수 있음
            // reply_to: email && email.trim() ? email : undefined,
        });

        console.log('Resend email result:', result);

        return NextResponse.json({
            success: true,
            message: '문의가 접수되었습니다.',
        });
    } catch (error: any) {
        console.error('Contact API error details:', error);
        return NextResponse.json(
            { error: '전송에 실패했습니다.', details: error?.message },
            { status: 500 },
        );
    }
}
