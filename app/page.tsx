import { headers } from 'next/headers';
import Image from "next/image";

export const dynamic = 'force-dynamic';
import HomeClient from '@/components/HomeClient';

async function getContent() {
  const host = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  console.log('[Home] Fetching content from API:', `${host}/api/content`);

  try {
    const res = await fetch(`${host}/api/content`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[Home] Failed to fetch content:', res.status, res.statusText);
      // Fallback or empty object if needed, but better to throw or handle graceful error
      // For now, return a basic structure or re-throw
      // But since we removed local read, we must rely on API.
      throw new Error(`Failed to fetch content: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('[Home] Error fetching content:', error);
    // In case of error (e.g. build time without server), we might need a fallback.
    // However, user specifically asked to remove local file read.
    return {};
  }
}

export default async function Home() {
  const content = await getContent();

  // Handle case where content might be empty due to error (optional, but good for safety)
  if (!content || Object.keys(content).length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Failed to load content. Please check configuration.</p>
      </div>
    );
  }

  return <HomeClient initialContent={content} />;
}
