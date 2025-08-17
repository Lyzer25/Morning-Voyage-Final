import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import { getServerSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import type { AddToCartRequest } from '@/types/cart';

export async function POST(request: NextRequest) {
  try {
    const body: AddToCartRequest = await request.json();
    const { product_id, quantity, is_subscription, subscription_interval } = body;
    
    // Validate input
    if (!product_id || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid product_id or quantity' },
        { status: 400 }
      );
    }
    
    const session = await getServerSession();
    const cookieStore = await cookies();
    
    // Get or create cart ID and guest session
    let cartId: string;
    let guestSessionId: string | null = null;
    
    if (session?.userId) {
      cartId = `cart_user_${session.userId}`;
    } else {
      guestSessionId = cookieStore.get('mv_guest_session')?.value || null;
      
      if (!guestSessionId) {
        // Create new guest session
        guestSessionId = crypto.randomUUID();
      }
      
      cartId = `cart_guest_${guestSessionId}`;
    }
    
    // Fetch product data to validate and get details
    const productData = await fetchProductData(product_id);
    if (!productData) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Get existing cart or create new one
    let cart;
    try {
      const blobs = await list({ prefix: `${cartId}.json`, limit: 1 });
      const blobItem = blobs?.blobs?.[0];
      if (blobItem?.url) {
        const res = await fetch(blobItem.url, { cache: 'no-store' });
        if (res.ok) {
          cart = await res.json();
          
          // Check if cart expired
          const now = new Date();
          const expiresAt = new Date(cart.expires_at);
          if (now > expiresAt) {
            throw new Error('Cart expired');
          }
        }
      }
    } catch (error) {
      console.log('Creating new cart:', (error as any).message);
      cart = null;
    }
    
    if (!cart) {
      // Create new cart
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
      
      cart = {
        id: cartId,
        user_id: session?.userId || undefined,
        guest_session_id: guestSessionId || undefined,
        items: [],
        totals: {
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0
        },
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        metadata: {}
      };
    }
    
    // Add or update item in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.product_id === product_id
    );
    
    const cartItem = {
      product_id,
      sku: productData.sku,
      name: productData.productName,
      quantity,
      base_price: parseFloat(productData.price),
      line_total: quantity * parseFloat(productData.price),
      is_subscription: is_subscription || false,
      subscription_interval: subscription_interval || undefined,
      metadata: {
        variant: productData.variant || undefined
      }
    };
    
    if (existingItemIndex >= 0) {
      // Update existing item
      cart.items[existingItemIndex] = cartItem;
    } else {
      // Add new item
      cart.items.push(cartItem);
    }
    
    // Recalculate totals
    cart = recalculateCartTotals(cart);
    
    // Save cart to blob storage
    await put(`${cartId}.json`, JSON.stringify(cart, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true
    });
    
    const response = NextResponse.json({
      cart,
      message: 'Item added to cart successfully'
    });
    
    // Set guest session cookie if needed
    if (guestSessionId && !session?.userId) {
      response.cookies.set('mv_guest_session', guestSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
    }
    
    return response;
    
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart', details: (error as any)?.message },
      { status: 500 }
    );
  }
}

// Helper function to fetch product data
async function fetchProductData(productId: string) {
  try {
    // Use existing product API
    let baseUrl: string;
    
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      baseUrl = process.env.NODE_ENV === 'production' ? 'https://morningvoyage.co' : 'http://localhost:3000';
    }
    
    const response = await fetch(`${baseUrl}/api/products/fresh`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Products API failed');
    }
    
    const data = await response.json();
    const products = data.products || data;
    return products.find((p: any) => p.id === productId || p.sku === productId);
    
  } catch (error) {
    console.error('Product fetch error:', error);
    return null;
  }
}

// Helper function to recalculate cart totals
function recalculateCartTotals(cart: any) {
  const subtotal = cart.items.reduce((sum: number, item: any) => {
    item.line_total = item.quantity * item.base_price;
    return sum + item.line_total;
  }, 0);
  
  cart.totals = {
    subtotal,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: subtotal
  };
  
  cart.updated_at = new Date().toISOString();
  
  return cart;
}
