import { headers } from 'next/headers';
import Image from "next/image";

export const dynamic = 'force-dynamic';
import fs from 'fs';
import path from 'path';
import HomeClient from '@/components/HomeClient';

async function getContent() {
  const contentPath = path.join(process.cwd(), 'data', 'content.json');
  console.log('[Home] Reading content from:', contentPath);
  const fileContents = fs.readFileSync(contentPath, 'utf8');
  const data = JSON.parse(fileContents);
  console.log('[Home] Content Title:', data.hero.title); // Verify content
  return data;
}

export default async function Home() {
  const content = await getContent();

  return <HomeClient initialContent={content} />;
}
