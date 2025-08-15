import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getAllOrders, getOrderStats, searchOrders } from '@/lib/orders';
import { OrderStatus } from '@/types/orders';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check admin access (using role field)
    if (!session || session.role !== 'admin') {
      console.log('Admin orders access denied:', { userId: session?.userId, role: session?.role });
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') as OrderStatus || undefined;
    const includeStats = searchParams.get('stats') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');
    
    console.log('Admin fetching orders:', { 
      searchTerm, 
      statusFilter, 
      includeStats, 
      limit,
      adminUserId: session.userId 
    });
    
    let orders;
    if (searchTerm || statusFilter) {
      orders = await searchOrders(searchTerm, statusFilter);
    } else {
      orders = await getAllOrders(limit);
    }
    
    const response: any = {
      orders,
      total: orders.length
    };
    
    if (includeStats) {
      const stats = await getOrderStats();
      response.stats = stats;
    }
    
    console.log('Admin orders fetched successfully:', { 
      count: orders.length, 
      includeStats 
    });
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: (error as any)?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
