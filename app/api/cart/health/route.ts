import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔍 [HEALTH CHECK] /api/cart/health called');
  console.log('🔍 [HEALTH CHECK] Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN
  });
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 
             process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
             'http://localhost:3000'
  });
}
