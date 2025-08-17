import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import { getServerSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { product_id: string } }
) {
  try {
    const { product_id } = params;
    
    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }
    
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
    
    // Fetch existing cart
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
    
    // Remove item from cart
    const initialItemCount = cart.items.length;
    cart.items = cart.items.filter((item: any) => item.product_id !== product_id);
    
    if (cart.items.length === initialItemCount) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }
    
    // Recalculate totals
    const updatedCart = recalculateCartTotals(cart);
    
    // Save updated cart
    await put(`${cartId}.json`, JSON.stringify(updatedCart, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true
    });
    
    return NextResponse.json({
      cart: updatedCart,
      message: 'Item removed from cart successfully'
    });
    
  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart', details: (error as any).message },
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
    tax: 0,
    shipping: 0,
    discount: 0,
    total: subtotal
  };
  
  cart.updated_at = new Date().toISOString();
  
  return cart;
}
