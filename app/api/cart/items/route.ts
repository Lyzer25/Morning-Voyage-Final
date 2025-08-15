import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { addToCart } from '@/lib/cart';

interface AddItemRequest {
  product_id: string;
  quantity: number;
  is_subscription?: boolean;
  subscription_interval?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AddItemRequest = await request.json();
    const { product_id, quantity, is_subscription, subscription_interval } = body;
    
    // Validate input
    if (!product_id || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid product_id or quantity' },
        { status: 400 }
      );
    }
    
    const session = await getServerSession();
    const guestCookie = request.cookies.get('mv_guest_session')?.value;
    
    // Get or create cart ID and guest session
    let cartId: string;
    let isUser: boolean;
    let guestSessionId: string | null = null;
    
    if (session?.userId) {
      cartId = session.userId;
      isUser = true;
    } else {
      guestSessionId = guestCookie || null;
      
      if (!guestSessionId) {
        // Create new guest session
        guestSessionId = crypto.randomUUID();
      }
      
      cartId = guestSessionId;
      isUser = false;
    }
    
    // Fetch product data to get details
    const productData = await fetchProductData(product_id);
    if (!productData) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Add to cart using existing helper
    const cart = await addToCart(
      cartId, 
      product_id, 
      productData.productName, 
      parseFloat(productData.price), 
      quantity, 
      isUser
    );
    
    const response = NextResponse.json({
      success: true,
      cart,
      message: 'Item added to cart successfully'
    });
    
    // Set guest session cookie if needed
    if (!isUser && !guestCookie && guestSessionId) {
      response.cookies.set('mv_guest_session', guestSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });
    }
    
    return response;
    
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart', details: (error as any)?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to fetch product data
async function fetchProductData(productId: string) {
  try {
    // Construct absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                    'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/products/fresh`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Products API failed');
    }
    
    const products = await response.json();
    return products.find((p: any) => p.id === productId || p.sku === productId);
    
  } catch (error) {
    console.error('Product fetch error:', error);
    return null;
  }
}
