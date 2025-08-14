import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { exportProductsToCSV } from '@/lib/csv-helpers';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { products, forceUpdate } = await request.json();

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid products data' }, { status: 400 });
    }

    // Generate CSV with timestamp
    const csvContent = await exportProductsToCSV(products);
    const timestamp = new Date().toISOString();

    // Upload to blob with cache busting
    const result = await put('products.csv', csvContent, {
      access: 'public',
      contentType: 'text/csv',
      addRandomSuffix: false
    });

    // Verify upload immediately
    const verifyResponse = await fetch(result.url + '?' + Date.now());
    const uploadedContent = await verifyResponse.text();

    if (uploadedContent !== csvContent) {
      throw new Error('Blob upload verification failed');
    }

    // Force cache invalidation on our end
    if (forceUpdate) {
      // Clear any local caches
      try {
        await fetch('/api/products/clear-cache', { method: 'POST' });
      } catch (cacheError) {
        console.warn('Cache clear failed:', cacheError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Products synced successfully',
      blobUrl: result.url,
      timestamp,
      productCount: products.length,
      verified: true
    });
  } catch (error) {
    console.error('Product sync failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync products', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
