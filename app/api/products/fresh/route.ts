import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/csv-data';

export async function GET() {
  try {
    // Get absolutely fresh data
    const products = await getProducts({ forceRefresh: true, bypassCache: true });
    return NextResponse.json({
      products,
      timestamp: new Date().toISOString(),
      source: 'fresh_blob_fetch'
    });
  } catch (error) {
    console.error('Fresh product fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch fresh products' }, { status: 500 });
  }
}
