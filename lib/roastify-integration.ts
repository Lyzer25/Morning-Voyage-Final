import { getCurrentConfig } from './roastify-config';
import type { Order, OrderItem } from '@/types/orders';

interface RoastifyOrderRequest {
  externalSourceId: string;     // Our order ID
  toAddress: {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    country: string;
    zip: string;
    phone?: string;
    email?: string;
  };
  shipping?: {
    carrier: string;
    priority: string;
  };
  items: {
    externalSourceId: string;   // Our line item ID
    sku: string;               // Roastify SKU
    quantity: number;
  }[];
}

export async function submitOrderToRoastify(order: Order): Promise<{ success: boolean; roastifyOrderId?: string; error?: string }> {
  const config = getCurrentConfig();
  
  try {
    // Prepare Roastify order request
    const roastifyOrder: RoastifyOrderRequest = {
      externalSourceId: order.id,
      toAddress: {
        name: `${order.shipping.firstName} ${order.shipping.lastName}`,
        street1: order.shipping.address1,
        street2: order.shipping.address2,
        city: order.shipping.city,
        state: order.shipping.state,
        country: order.shipping.country,
        zip: order.shipping.zipCode,
        phone: order.shipping.phone,
        email: order.customer.email
      },
      shipping: {
        carrier: 'USPS',
        priority: 'GroundAdvantage'
      },
      items: order.items.map((item, index) => ({
        externalSourceId: `${order.id}-${index}`,
        sku: item.roastify_sku,
        quantity: item.quantity
      }))
    };
    
    console.log('Submitting order to Roastify:', {
      orderId: order.id,
      itemCount: order.items.length,
      config: `${config.baseUrl} (${config.mode})`
    });
    
    const response = await fetch(`${config.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'Idempotency-Key': `${order.id}-${Date.now()}`
      },
      body: JSON.stringify(roastifyOrder)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Roastify API error: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    
    console.log('Roastify order submitted successfully:', {
      orderId: order.id,
      roastifyOrderId: result.orderId || result.id
    });
    
    return {
      success: true,
      roastifyOrderId: result.orderId || result.id
    };
    
  } catch (error) {
    console.error('Roastify submission failed:', error);
    return {
      success: false,
      error: (error as any)?.message || 'Unknown error'
    };
  }
}

export async function getRoastifyOrderStatus(roastifyOrderId: string): Promise<any> {
  const config = getCurrentConfig();
  
  try {
    const response = await fetch(`${config.baseUrl}/orders/${roastifyOrderId}`, {
      headers: {
        'x-api-key': config.apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Roastify status check failed: ${response.status}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Failed to get Roastify status:', error);
    return null;
  }
}

export async function testRoastifyConnection(): Promise<{ success: boolean; error?: string }> {
  const config = getCurrentConfig();
  
  try {
    console.log('Testing Roastify connection:', {
      baseUrl: config.baseUrl,
      mode: config.mode
    });
    
    // Try to fetch orders endpoint - should return 200 or at least authenticate correctly
    const response = await fetch(`${config.baseUrl}/orders?limit=1`, {
      headers: {
        'x-api-key': config.apiKey
      }
    });
    
    if (response.ok) {
      console.log('Roastify connection test successful');
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error('Roastify connection test failed:', response.status, errorText);
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${errorText}` 
      };
    }
    
  } catch (error) {
    console.error('Roastify connection test error:', error);
    return {
      success: false,
      error: (error as any)?.message || 'Network error'
    };
  }
}
