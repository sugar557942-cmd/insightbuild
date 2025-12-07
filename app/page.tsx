import { headers } from 'next/headers';
import Image from "next/image";

export const dynamic = 'force-dynamic';
import fs from 'fs';
import path from 'path';
import HomeClient from '@/components/HomeClient';

async function getContent() {
  const contentPath = path.join(process.cwd(), 'data', 'content.json');
  const fileContents = fs.readFileSync(contentPath, 'utf8');
  return JSON.parse(fileContents);
}

export default async function Home() {
  const content = await getContent();

  return <HomeClient initialContent={content} />;
}
