import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, company, phone, message } = body;

        // Simulate email sending
        console.log('--- Email Sending Simulation ---');
        console.log(`To: insightbuild@daum.net`);
        console.log(`Subject: 인사이트빌드 홈페이지 문의 접수`);
        console.log(`Body:`);
        console.log(`이름: ${name}`);
        console.log(`기업 또는 기관명: ${company}`);
        console.log(`연락처: ${phone}`);
        console.log(`문의 내용: ${message}`);
        console.log('--------------------------------');

        // In a real scenario, integrate EmailJS or Nodemailer here.
        // For now, we return success to simulate the experience.

        return NextResponse.json({ success: true, message: '문의가 접수되었습니다.' });
    } catch (error) {
        return NextResponse.json({ error: '전송에 실패했습니다.' }, { status: 500 });
    }
}
