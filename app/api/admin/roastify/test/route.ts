import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { testRoastifyConnection } from '@/lib/roastify-integration';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check admin access
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    console.log('Testing Roastify connection for admin:', session.userId);
    
    const result = await testRoastifyConnection();
    
    if (result.success) {
      console.log('Roastify connection test successful');
      return NextResponse.json({
        success: true,
        message: 'Roastify connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('Roastify connection test failed:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Roastify connection failed',
        timestamp: new Date().toISOString()
      }, { status: 502 }); // Bad Gateway - external service issue
    }
    
  } catch (error) {
    console.error('Roastify test endpoint error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Test endpoint failed', 
        details: (error as any)?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
