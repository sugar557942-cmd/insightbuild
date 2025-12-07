import { headers } from 'next/headers';
import Image from "next/image";

export const dynamic = 'force-dynamic';
import HomeClient from '@/components/HomeClient';

async function getContent() {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

  // Construct dynamic base URL if host is available, otherwise fallback
  const baseUrl = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

  console.log('[Home] Fetching content from API:', `${baseUrl}/api/content`);

  try {
    const res = await fetch(`${baseUrl}/api/content`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[Home] Failed to fetch content:', res.status, res.statusText);
      throw new Error(`Failed to fetch content: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('[Home] Error fetching content:', error);
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
