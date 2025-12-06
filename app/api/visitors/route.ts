import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// GCS Configuration
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucketName = process.env.GCS_BUCKET_NAME || process.env.GCP_BUCKET_NAME;
const fileName = 'visitors.json';
const localDataPath = path.join(process.cwd(), 'data', 'visitors.json');

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function GET() {
  if (!bucketName) {
    console.error('Visitor Counter: Missing GCS_BUCKET_NAME');
    // Fallback to purely local for dev without GCS (read-only in prod)
    return handleLocalFallback();
  }

  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    let data = { date: '', todayCount: 0, totalCount: 0 };

    // 1. Try to read from GCS
    const [exists] = await file.exists();
    if (exists) {
      const [content] = await file.download();
      try {
        data = JSON.parse(content.toString('utf8'));
      } catch (e) {
        console.error('Visitor Counter: Failed to parse GCS JSON', e);
        // Data corrupted? Start fresh or try local
      }
    } else {
      // 2. Migration: If not in GCS, try to read from local file as seed
      if (fs.existsSync(localDataPath)) {
        try {
          const localContent = fs.readFileSync(localDataPath, 'utf8');
          const parsed = JSON.parse(localContent);
          data = {
            date: parsed.date || '',
            todayCount: parsed.todayCount || parsed.count || 0,
            totalCount: parsed.totalCount || 0
          };
        } catch (e) {
          console.error('Visitor Counter: Failed to read local seed', e);
        }
      }
    }

    // 3. Logic: Increment
    const today = getTodayDateString();
    if (data.date === today) {
      data.todayCount += 1;
    } else {
      data.date = today;
      data.todayCount = 1;
    }
    data.totalCount += 1;

    // 4. Write back to GCS
    await file.save(JSON.stringify(data, null, 2), {
      contentType: 'application/json',
      resumable: false // suitable for small files
    });

    return NextResponse.json({ todayCount: data.todayCount, totalCount: data.totalCount });

  } catch (error) {
    console.error('Visitor Counter Error:', error);
    // Fallback to safe return to not break the site
    return NextResponse.json({ todayCount: 0, totalCount: 0 }); // Or handleLocalFallback() if desired
  }
}

// Fallback for local development or when GCS fails completely
function handleLocalFallback() {
  try {
    if (fs.existsSync(localDataPath)) { // Only works if we can read
      // In read-only envs, this is fine for fetching, but writing will fail.
      // We just return what we have without incrementing to avoid crashes if write fails?
      // Or we try to write and catch error.
      const fileContent = fs.readFileSync(localDataPath, 'utf8');
      const data = JSON.parse(fileContent);
      // Logic to increment (same as above)
      const today = getTodayDateString();
      if (data.date === today) {
        data.todayCount += 1;
      } else {
        data.date = today;
        data.todayCount = 1;
      }
      data.totalCount += 1;

      // Try write
      try {
        fs.writeFileSync(localDataPath, JSON.stringify(data, null, 2));
      } catch (e) {
        console.warn('Visitor Counter: Local write failed (RO FS?)');
      }
      return NextResponse.json({ todayCount: data.todayCount, totalCount: data.totalCount });
    }
    return NextResponse.json({ todayCount: 0, totalCount: 0 });
  } catch (e) {
    return NextResponse.json({ todayCount: 0, totalCount: 0 });
  }
}
