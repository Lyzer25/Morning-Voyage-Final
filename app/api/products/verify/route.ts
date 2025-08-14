import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/csv-data';

export async function GET() {
  try {
    // Force fresh fetch bypassing all caches
    const products = await getProducts({ forceRefresh: true });
    return NextResponse.json({
      products,
      timestamp: new Date().toISOString(),
      count: products.length
    });
  } catch (error) {
    console.error('Product verification failed:', error);
    return NextResponse.json({ error: 'Failed to fetch products for verification' }, { status: 500 });
  }
}
