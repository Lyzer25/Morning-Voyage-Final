import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import { getServerSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import type { Cart } from '@/types/cart';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    const cookieStore = await cookies();
    
    let cartId: string | null = null;
    
    // Determine cart ID from user session or guest cookie
    if (session?.userId) {
      cartId = `cart_user_${session.userId}`;
    } else {
      const guestSessionId = cookieStore.get('mv_guest_session')?.value;
      if (guestSessionId) {
        cartId = `cart_guest_${guestSessionId}`;
      }
    }
    
    if (!cartId) {
      // No cart exists - return empty cart structure
      return NextResponse.json({
        cart: null,
        message: 'No cart found'
      });
    }
    
    // Fetch cart from blob storage using list() approach
    try {
      const blobs = await list({ prefix: `${cartId}.json`, limit: 1 });
      const blobItem = blobs?.blobs?.[0];
      const downloadUrl = blobItem?.url;
      
      if (!downloadUrl) {
        return NextResponse.json({
          cart: null,
          message: 'Cart not found'
        });
      }
      
      const res = await fetch(downloadUrl, { cache: 'no-store' });
      if (!res.ok) {
        console.error('Cart blob fetch error:', res.status);
        return NextResponse.json({
          cart: null,
          message: 'Cart not found'
        });
      }
      
      const cartData = await res.json();
      
      // Check if cart has expired
      const now = new Date();
      const expiresAt = new Date(cartData.expires_at);
      
      if (now > expiresAt) {
        // Cart expired - clean up and return null
        // Note: blob cleanup handled by separate maintenance task
        return NextResponse.json({
          cart: null,
          message: 'Cart expired'
        });
      }
      
      // Recalculate totals to ensure accuracy
      const updatedCart = recalculateCartTotals(cartData);
      
      return NextResponse.json({
        cart: updatedCart,
        message: 'Cart retrieved successfully'
      });
      
    } catch (blobError) {
      console.error('Cart blob fetch error:', blobError);
      return NextResponse.json({
        cart: null,
        message: 'Cart not found'
      });
    }
    
  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart', details: (error as any).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { discount_codes, shipping_method, notes } = body;
    
    const session = await getServerSession();
    const cookieStore = await cookies();
    
    // Determine cart ID
    let cartId: string | null = null;
    
    if (session?.userId) {
      cartId = `cart_user_${session.userId}`;
    } else {
      const guestSessionId = cookieStore.get('mv_guest_session')?.value;
      if (guestSessionId) {
        cartId = `cart_guest_${guestSessionId}`;
      }
    }
    
    if (!cartId) {
      return NextResponse.json(
        { error: 'No cart found' },
        { status: 404 }
      );
    }
    
    // Fetch existing cart using list() approach
    const blobs = await list({ prefix: `${cartId}.json`, limit: 1 });
    const blobItem = blobs?.blobs?.[0];
    const downloadUrl = blobItem?.url;
    
    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }
    
    const res = await fetch(downloadUrl, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }
    
    const cart = await res.json();
    
    // Update metadata
    cart.metadata = {
      ...cart.metadata,
      discount_codes: discount_codes || cart.metadata?.discount_codes,
      shipping_method: shipping_method || cart.metadata?.shipping_method,
      notes: notes || cart.metadata?.notes
    };
    
    cart.updated_at = new Date().toISOString();
    
    // Save updated cart
    await put(`${cartId}.json`, JSON.stringify(cart, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true
    });
    
    return NextResponse.json({
      cart,
      message: 'Cart updated successfully'
    });
    
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart', details: (error as any)?.message || 'Unknown error' },
      { status: 500 }
    );
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
    tax: 0,        // TODO: Add tax calculation later
    shipping: 0,   // TODO: Add shipping calculation later  
    discount: 0,   // TODO: Add discount calculation later
    total: subtotal
  };
  
  cart.updated_at = new Date().toISOString();
  
  return cart;
}
