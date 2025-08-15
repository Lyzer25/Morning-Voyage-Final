import { NextRequest, NextResponse } from 'next/server';
import { createOrder, updateOrderStatus } from '@/lib/orders';
import { submitOrderToRoastify } from '@/lib/roastify-integration';
import { getServerSession } from '@/lib/auth';
import { OrderStatus } from '@/types/orders';
import type { CheckoutRequest } from '@/types/orders';

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { customer, shipping, cart } = body;
    
    console.log('Checkout request received:', {
      customerEmail: customer.email,
      itemCount: cart?.items?.length || 0,
      total: cart?.totals?.total || 0
    });
    
    // Validate required fields
    if (!customer.email || !customer.firstName || !customer.lastName) {
      return NextResponse.json(
        { error: 'Customer information is incomplete' },
        { status: 400 }
      );
    }
    
    if (!shipping.address1 || !shipping.city || !shipping.state || !shipping.zipCode) {
      return NextResponse.json(
        { error: 'Shipping address is incomplete' },
        { status: 400 }
      );
    }
    
    if (!cart?.items?.length) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }
    
    const session = await getServerSession();
    console.log('Checkout session:', { userId: session?.userId });
    
    // Get product details and validate Roastify SKUs
    console.log('Fetching products for SKU mapping...');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    (request.nextUrl.origin.includes('localhost') ? 'http://localhost:3000' : request.nextUrl.origin);
    
    const productResponse = await fetch(`${baseUrl}/api/products`, {
      cache: 'no-store'
    });
    
    if (!productResponse.ok) {
      console.error('Failed to fetch products for checkout:', productResponse.status);
      return NextResponse.json(
        { error: 'Unable to validate product information' },
        { status: 500 }
      );
    }
    
    const products = await productResponse.json();
    console.log('Products fetched:', { count: products.length });
    
    // Map cart items to order items with Roastify SKUs
    const orderItems = [];
    
    for (const cartItem of cart.items) {
      const product = products.find((p: any) => 
        p.id === cartItem.product_id || 
        p.sku === cartItem.product_id ||
        p.sku === cartItem.sku
      );
      
      if (!product) {
        console.error('Product not found:', { product_id: cartItem.product_id, sku: cartItem.sku });
        return NextResponse.json(
          { error: `Product ${cartItem.product_name || cartItem.product_id} not found` },
          { status: 400 }
        );
      }
      
      if (!product.roastify_sku) {
        console.error('Product missing Roastify SKU:', { productName: product.productName, sku: product.sku });
        return NextResponse.json(
          { error: `Product "${product.productName}" has no Roastify SKU mapping. Please contact support.` },
          { status: 400 }
        );
      }
      
      orderItems.push({
        product_id: cartItem.product_id,
        sku: product.sku,
        roastify_sku: product.roastify_sku,
        name: cartItem.product_name || product.productName,
        quantity: cartItem.quantity,
        price: cartItem.base_price,
        line_total: cartItem.line_total || (cartItem.quantity * cartItem.base_price),
        is_subscription: cartItem.is_subscription || false
      });
    }
    
    console.log('Order items mapped:', { count: orderItems.length });
    
    // Create order in our system
    const order = await createOrder({
      status: OrderStatus.CREATED,
      customer: {
        id: session?.userId,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone
      },
      shipping: {
        firstName: shipping.firstName,
        lastName: shipping.lastName,
        company: shipping.company,
        address1: shipping.address1,
        address2: shipping.address2,
        city: shipping.city,
        state: shipping.state,
        zipCode: shipping.zipCode,
        country: shipping.country || 'US',
        phone: shipping.phone
      },
      items: orderItems,
      totals: {
        subtotal: cart.totals.subtotal,
        tax: cart.totals.tax || 0,
        shipping: cart.totals.shipping || 0,
        total: cart.totals.total
      },
      roastify: {
        submitted: false
      },
      metadata: {
        source: 'web',
        user_agent: request.headers.get('user-agent') || undefined,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
      }
    });
    
    console.log('Order created:', { orderId: order.id, itemCount: order.items.length, total: order.totals.total });
    
    // Submit to Roastify
    console.log('Submitting order to Roastify...');
    const roastifyResult = await submitOrderToRoastify(order);
    
    if (roastifyResult.success) {
      await updateOrderStatus(order.id, OrderStatus.SUBMITTED, {
        submitted: true,
        submitted_at: new Date().toISOString(),
        roastify_order_id: roastifyResult.roastifyOrderId
      });
      
      console.log('Order submitted to Roastify successfully:', {
        orderId: order.id,
        roastifyOrderId: roastifyResult.roastifyOrderId
      });
      
      return NextResponse.json({
        success: true,
        orderId: order.id,
        roastifySubmitted: true,
        roastifyOrderId: roastifyResult.roastifyOrderId,
        message: 'Order placed successfully and sent to fulfillment!'
      });
    } else {
      await updateOrderStatus(order.id, OrderStatus.FAILED, {
        submitted: false,
        error: roastifyResult.error
      });
      
      console.error('Roastify submission failed:', {
        orderId: order.id,
        error: roastifyResult.error
      });
      
      // Still return success - order was created, fulfillment can be retried
      return NextResponse.json({
        success: true,
        orderId: order.id,
        roastifySubmitted: false,
        message: 'Order created successfully, but fulfillment submission failed. Our team will retry shortly.',
        warning: `Fulfillment error: ${roastifyResult.error}`
      });
    }
    
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { 
        error: 'Checkout failed', 
        details: (error as any)?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
