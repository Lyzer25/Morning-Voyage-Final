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
    console.log('🛒 [CART API] POST /api/cart/items - Request received');
    console.log('🛒 [CART API] Request method:', request.method);
    console.log('🛒 [CART API] Request URL:', request.url);
    
    const body: AddItemRequest = await request.json();
    const { product_id, quantity, is_subscription, subscription_interval } = body;
    
    console.log('🛒 [CART API] Request body:', { product_id, quantity, is_subscription, subscription_interval });
    
    // Validate input
    if (!product_id || !quantity || quantity < 1) {
      console.log('❌ [CART API] Invalid input - product_id:', product_id, 'quantity:', quantity);
      return NextResponse.json(
        { error: 'Invalid product_id or quantity' },
        { status: 400 }
      );
    }
    
    console.log('🛒 [CART API] Getting session...');
    const session = await getServerSession();
    const guestCookie = request.cookies.get('mv_guest_session')?.value;
    
    console.log('🛒 [CART API] Session:', session ? { userId: session.userId, email: session.email, role: session.role } : 'null');
    console.log('🛒 [CART API] Guest cookie:', guestCookie ? 'present' : 'null');
    
    // Get or create cart ID and guest session
    let cartId: string;
    let isUser: boolean;
    let guestSessionId: string | null = null;
    
    if (session?.userId) {
      cartId = session.userId;
      isUser = true;
      console.log('🛒 [CART API] Using user cart:', cartId);
    } else {
      guestSessionId = guestCookie || null;
      
      if (!guestSessionId) {
        // Create new guest session
        guestSessionId = crypto.randomUUID();
        console.log('🛒 [CART API] Created new guest session:', guestSessionId);
      } else {
        console.log('🛒 [CART API] Using existing guest session:', guestSessionId);
      }
      
      cartId = guestSessionId;
      isUser = false;
    }
    
    console.log('🛒 [CART API] Final cart config - cartId:', cartId, 'isUser:', isUser);
    
    // Fetch product data to get details
    console.log('🛒 [CART API] Fetching product data for:', product_id);
    const productData = await fetchProductData(product_id);
    
    console.log('🛒 [CART API] Product fetch result:', productData ? {
      id: productData.id,
      sku: productData.sku,
      productName: productData.productName,
      price: productData.price
    } : 'null');
    
    if (!productData) {
      console.log('❌ [CART API] Product not found, returning 404');
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    console.log('🛒 [CART API] Adding to cart with params:', {
      cartId,
      product_id,
      productName: productData.productName,
      price: productData.price,
      quantity,
      isUser
    });
    
    // Add to cart using existing helper
    const cart = await addToCart(
      cartId, 
      product_id, 
      productData.productName, 
      parseFloat(productData.price), 
      quantity, 
      isUser
    );
    
    console.log('✅ [CART API] Cart operation successful. Cart items:', cart.items.length);
    console.log('✅ [CART API] Cart total:', cart.totals.total);
    
    const response = NextResponse.json({
      success: true,
      cart,
      message: 'Item added to cart successfully'
    });
    
    // Set guest session cookie if needed
    if (!isUser && !guestCookie && guestSessionId) {
      console.log('🍪 [CART API] Setting guest session cookie:', guestSessionId);
      response.cookies.set('mv_guest_session', guestSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });
    }
    
    console.log('✅ [CART API] Returning successful response');
    return response;
    
  } catch (error) {
    console.error('❌ [CART API] Cart operation failed:', error);
    console.error('❌ [CART API] Error stack:', (error as any)?.stack);
    return NextResponse.json(
      { error: 'Failed to add item to cart', details: (error as any)?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to fetch product data
async function fetchProductData(productId: string) {
  try {
    console.log('🔍 [PRODUCT FETCH] Starting product lookup for:', productId);
    
    // Construct absolute URL for server-side fetch
    let baseUrl: string;
    
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      // For production deployment, default to morningvoyage.co
      baseUrl = process.env.NODE_ENV === 'production' ? 'https://morningvoyage.co' : 'http://localhost:3000';
    }
    
    console.log('🔍 [PRODUCT FETCH] Base URL:', baseUrl);
    console.log('🔍 [PRODUCT FETCH] Full URL:', `${baseUrl}/api/products/fresh`);
    
    const response = await fetch(`${baseUrl}/api/products/fresh`, {
      cache: 'no-store'
    });
    
    console.log('🔍 [PRODUCT FETCH] Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      console.log('❌ [PRODUCT FETCH] Products API failed with status:', response.status);
      throw new Error(`Products API failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('🔍 [PRODUCT FETCH] Raw response keys:', Object.keys(data));
    console.log('🔍 [PRODUCT FETCH] Products array length:', (data.products || data).length);
    
    const products = data.products || data; // Handle both {products: [...]} and [...] formats
    const foundProduct = products.find((p: any) => p.id === productId || p.sku === productId);
    
    console.log('🔍 [PRODUCT FETCH] Searching for product with id/sku:', productId);
    console.log('🔍 [PRODUCT FETCH] Found product:', foundProduct ? 'YES' : 'NO');
    
    if (!foundProduct) {
      console.log('🔍 [PRODUCT FETCH] Available product IDs:', products.slice(0, 5).map((p: any) => ({ id: p.id, sku: p.sku })));
    }
    
    return foundProduct;
    
  } catch (error) {
    console.error('❌ [PRODUCT FETCH] Error:', error);
    return null;
  }
}
