import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'visitors.json');

function getTodayDateString() {
  const now = new Date();
  // Format: YYYY-MM-DD (Local time)
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function GET() {
  try {
    let data = { date: '', todayCount: 0, totalCount: 0 };

    if (fs.existsSync(dataFilePath)) {
      const fileContent = fs.readFileSync(dataFilePath, 'utf8');
      try {
        const parsed = JSON.parse(fileContent);
        // Migration support if needed, though we overwrote the file
        data = {
          date: parsed.date || '',
          todayCount: parsed.todayCount || parsed.count || 0,
          totalCount: parsed.totalCount || 0
        };
      } catch (e) {
        data = { date: '', todayCount: 0, totalCount: 0 };
      }
    }

    const today = getTodayDateString();

    if (data.date === today) {
      data.todayCount += 1;
    } else {
      data.date = today;
      data.todayCount = 1;
    }

    // Increment total count
    data.totalCount += 1;

    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ todayCount: data.todayCount, totalCount: data.totalCount });
  } catch (error) {
    console.error('Error in visitor counter:', error);
    return NextResponse.json({ todayCount: 0, totalCount: 0 }, { status: 500 });
  }
}
