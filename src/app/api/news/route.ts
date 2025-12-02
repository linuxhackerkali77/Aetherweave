// src/app/api/news/route.ts
import { fetchNews } from '@/services/news-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const q = searchParams.get('q');
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');

  try {
    const newsData = await fetchNews({
      category: category || undefined,
      q: q || undefined,
      page: page || undefined,
      pageSize: pageSize || undefined,
    });
    return NextResponse.json(newsData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
