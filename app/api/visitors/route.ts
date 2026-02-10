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

    // Default structure for new format
    let data: {
      totalCount: number;
      history: Record<string, number>;
      lastUpdated?: string;
    } = {
      totalCount: 0,
      history: {},
      lastUpdated: ''
    };

    // 1. Try to read from GCS
    const [exists] = await file.exists();
    if (exists) {
      const [content] = await file.download();
      try {
        const rawData = JSON.parse(content.toString('utf8'));

        // Migration check: if old format { date, todayCount, totalCount } exists and no history
        if (rawData.date && typeof rawData.todayCount === 'number' && !rawData.history) {
          data.totalCount = rawData.totalCount || 0;
          data.history = { [rawData.date]: rawData.todayCount };
        } else {
          // Assume it's new format or compatible
          data.totalCount = rawData.totalCount || 0;
          data.history = rawData.history || {};
        }
      } catch (e) {
        console.error('Visitor Counter: Failed to parse GCS JSON', e);
      }
    } else {
      // 2. Migration: If not in GCS, try to read from local file as seed
      if (fs.existsSync(localDataPath)) {
        try {
          const localContent = fs.readFileSync(localDataPath, 'utf8');
          const rawData = JSON.parse(localContent);

          if (rawData.date && typeof rawData.todayCount === 'number' && !rawData.history) {
            data.totalCount = rawData.totalCount || 0;
            data.history = { [rawData.date]: rawData.todayCount };
          } else {
            data.totalCount = rawData.totalCount || 0;
            data.history = rawData.history || {};
          }
        } catch (e) {
          console.error('Visitor Counter: Failed to read local seed', e);
        }
      }
    }

    // 3. Logic: Increment
    const today = getTodayDateString();

    // Initialize today's count if not present
    if (!data.history[today]) {
      data.history[today] = 0;
    }

    data.history[today] += 1;
    data.totalCount += 1;
    data.lastUpdated = new Date().toISOString();

    // 4. Write back to GCS
    await file.save(JSON.stringify(data, null, 2), {
      contentType: 'application/json',
      resumable: false // suitable for small files
    });

    const todayCount = data.history[today];
    return NextResponse.json({ todayCount, totalCount: data.totalCount });

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
      const rawData = JSON.parse(fileContent);

      let data: {
        totalCount: number;
        history: Record<string, number>;
        lastUpdated?: string;
      } = {
        totalCount: 0,
        history: {},
        lastUpdated: ''
      };

      if (rawData.date && typeof rawData.todayCount === 'number' && !rawData.history) {
        data.totalCount = rawData.totalCount || 0;
        data.history = { [rawData.date]: rawData.todayCount };
      } else {
        data.totalCount = rawData.totalCount || 0;
        data.history = rawData.history || {};
      }

      // Logic to increment (same as above)
      const today = getTodayDateString();
      if (!data.history[today]) {
        data.history[today] = 0;
      }
      data.history[today] += 1;
      data.totalCount += 1;
      data.lastUpdated = new Date().toISOString();

      // Try write
      try {
        fs.writeFileSync(localDataPath, JSON.stringify(data, null, 2));
      } catch (e) {
        console.warn('Visitor Counter: Local write failed (RO FS?)');
      }
      const todayCount = data.history[today];
      return NextResponse.json({ todayCount, totalCount: data.totalCount });
    }
    return NextResponse.json({ todayCount: 0, totalCount: 0 });
  } catch (e) {
    return NextResponse.json({ todayCount: 0, totalCount: 0 });
  }
}
