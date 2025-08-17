import { NextRequest, NextResponse } from 'next/server';
import { createOrder, updateOrderStatus } from '@/lib/orders';
import { submitOrderToRoastify } from '@/lib/roastify-integration';
import { getServerSession } from '@/lib/auth';
import { OrderStatus } from '@/types/orders';
import type { CheckoutRequest } from '@/types/orders';
import { validateProductsData, validateProductsForCheckout } from '@/lib/validation';
import { fetchDirectFromBlob } from '@/lib/csv-data';
import { generateCorrelationId, logCheckoutEvent, createCheckoutTimer, sanitizeForLog } from '@/lib/checkout-logging';

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const checkoutTimer = createCheckoutTimer(correlationId, 'full_checkout');
  
  try {
    logCheckoutEvent('started', correlationId, { 
      url: request.url,
      method: request.method 
    });
    
    const body: CheckoutRequest = await request.json();
    const { customer, shipping, cart } = body;
    
    logCheckoutEvent('request_parsed', correlationId, sanitizeForLog({
      customerEmail: customer.email,
      itemCount: cart?.items?.length || 0,
      total: cart?.totals?.total || 0,
      hasShipping: !!shipping.address1
    }));
    
    // Validate required fields
    if (!customer.email || !customer.firstName || !customer.lastName) {
      logCheckoutEvent('validation_failed', correlationId, { 
        reason: 'incomplete_customer_info',
        missing: {
          email: !customer.email,
          firstName: !customer.firstName,
          lastName: !customer.lastName
        }
      });
      return NextResponse.json(
        { error: 'Customer information is incomplete', correlationId },
        { status: 400 }
      );
    }
    
    if (!shipping.address1 || !shipping.city || !shipping.state || !shipping.zipCode) {
      logCheckoutEvent('validation_failed', correlationId, { 
        reason: 'incomplete_shipping_address',
        missing: {
          address1: !shipping.address1,
          city: !shipping.city,
          state: !shipping.state,
          zipCode: !shipping.zipCode
        }
      });
      return NextResponse.json(
        { error: 'Shipping address is incomplete', correlationId },
        { status: 400 }
      );
    }
    
    if (!cart?.items?.length) {
      logCheckoutEvent('validation_failed', correlationId, { 
        reason: 'empty_cart',
        cartItems: cart?.items?.length || 0
      });
      return NextResponse.json(
        { error: 'Cart is empty', correlationId },
        { status: 400 }
      );
    }
    
    const session = await getServerSession();
    logCheckoutEvent('session_validated', correlationId, { 
      userId: session?.userId,
      hasSession: !!session
    });
    
    // CRITICAL FIX: Robust product data fetching with validation and fallback
    logCheckoutEvent('products_fetch_started', correlationId, {});
    const productTimer = createCheckoutTimer(correlationId, 'product_fetch');
    
    let validatedProducts;
    
    try {
      // Primary: Fetch from products API
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                      (request.nextUrl.origin.includes('localhost') ? 'http://localhost:3000' : request.nextUrl.origin);
      
      const productResponse = await fetch(`${baseUrl}/api/products`, {
        cache: 'no-store'
      });
      
      if (!productResponse.ok) {
        throw new Error(`Products API returned ${productResponse.status}: ${productResponse.statusText}`);
      }
      
      const rawProductData = await productResponse.json();
      
      logCheckoutEvent('products_api_response', correlationId, {
        responseType: typeof rawProductData,
        isArray: Array.isArray(rawProductData),
        hasProductsProperty: rawProductData && 'products' in rawProductData,
        dataKeys: rawProductData && typeof rawProductData === 'object' ? Object.keys(rawProductData) : []
      });
      
      // Use validation utility to normalize products data
      validatedProducts = validateProductsData(rawProductData);
      
      productTimer.end({ 
        source: 'api',
        productCount: validatedProducts.length 
      });
      
    } catch (primaryError) {
      const errorMessage = primaryError instanceof Error ? primaryError.message : String(primaryError);
      logCheckoutEvent('products_api_failed', correlationId, { 
        error: errorMessage,
        attemptingFallback: true
      });
      
      try {
        // Fallback: Direct blob storage fetch
        logCheckoutEvent('products_fallback_started', correlationId, {});
        const blobProducts = await fetchDirectFromBlob();
        validatedProducts = validateProductsData(blobProducts);
        
        productTimer.end({ 
          source: 'blob_fallback',
          productCount: validatedProducts.length 
        });
        
        logCheckoutEvent('products_fallback_success', correlationId, {
          productCount: validatedProducts.length
        });
        
      } catch (fallbackError) {
        const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        logCheckoutEvent('products_fallback_failed', correlationId, { 
          error: fallbackErrorMessage 
        });
        
        productTimer.end({ source: 'failed', error: fallbackErrorMessage });
        
        return NextResponse.json(
          { 
            error: 'Unable to load product information. Please try again.', 
            correlationId,
            details: 'Product data temporarily unavailable'
          },
          { status: 500 }
        );
      }
    }
    
    // Extract cart SKUs for validation
    const cartSkus = cart.items.map((item: any) => 
      item.product_id || item.sku
    ).filter(Boolean);
    
    logCheckoutEvent('sku_validation_started', correlationId, {
      cartSkus,
      availableProductCount: validatedProducts.length
    });
    
    try {
      validateProductsForCheckout(validatedProducts, cartSkus);
    } catch (skuError) {
      const skuErrorMessage = skuError instanceof Error ? skuError.message : String(skuError);
      logCheckoutEvent('sku_validation_failed', correlationId, { 
        error: skuErrorMessage,
        cartSkus,
        availableSkus: validatedProducts.map(p => p.sku)
      });
      
      return NextResponse.json(
        { 
          error: skuErrorMessage, 
          correlationId,
          details: 'One or more products in your cart are no longer available'
        },
        { status: 400 }
      );
    }
    
    // Map cart items to order items with validated products
    const orderItems = [];
    const skuMapTimer = createCheckoutTimer(correlationId, 'sku_mapping');
    
    for (const cartItem of cart.items) {
      const productId = cartItem.product_id || cartItem.sku;
      const product = validatedProducts.find((p) => 
        p.id === productId || 
        p.sku === productId
      );
      
      if (!product) {
        // This should not happen after validateProductsForCheckout, but safety check
        logCheckoutEvent('sku_mapping_error', correlationId, { 
          productId,
          cartItem: sanitizeForLog(cartItem)
        });
        
        return NextResponse.json(
          { 
            error: `Product ${cartItem.product_name || productId} not found`, 
            correlationId,
            details: 'Product validation failed during order creation'
          },
          { status: 400 }
        );
      }
      
      // NOTE: Using main SKU for Roastify (roastify_sku was removed in previous session)
      orderItems.push({
        product_id: productId,
        sku: product.sku,
        roastify_sku: product.sku, // Use main SKU for Roastify mapping
        name: cartItem.product_name || product.productName,
        quantity: cartItem.quantity,
        price: cartItem.base_price,
        line_total: cartItem.line_total || (cartItem.quantity * cartItem.base_price),
        is_subscription: cartItem.is_subscription || false
      });
    }
    
    skuMapTimer.end({ orderItemCount: orderItems.length });
    
    logCheckoutEvent('order_items_mapped', correlationId, { 
      count: orderItems.length,
      totalValue: orderItems.reduce((sum, item) => sum + item.line_total, 0)
    });
    
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logCheckoutEvent('checkout_failed', correlationId, {
      error: errorMessage,
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    });
    
    checkoutTimer.end({ 
      status: 'failed',
      error: errorMessage
    });
    
    return NextResponse.json(
      { 
        error: 'Checkout failed. Please try again.', 
        details: errorMessage,
        correlationId
      },
      { status: 500 }
    );
  }
}
