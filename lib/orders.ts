import { put, list } from '@vercel/blob';
import type { Order, RoastifyData } from '@/types/orders';
import { OrderStatus } from '@/types/orders';

/**
 * Structured logging for order operations
 */
const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugMode = process.env.ORDER_DEBUG === 'true';

function logOrderOperation(operation: string, data: any) {
  if (isDevelopment || isDebugMode) {
    console.log(`[Order ${operation}]:`, data);
  }
}

function logOrderError(operation: string, error: any, context?: any) {
  console.error(`[Order ${operation} Error]:`, error, context || '');
}

/**
 * Generate unique order ID
 */
function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MV-${timestamp}-${random}`;
}

/**
 * Create a new order in blob storage
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
  const orderId = generateOrderId();
  const now = new Date().toISOString();
  
  const order: Order = {
    ...orderData,
    id: orderId,
    created_at: now,
    updated_at: now
  };
  
  logOrderOperation('create_start', { orderId, status: order.status, itemCount: order.items.length });
  
  try {
    // Save to blob storage
    await put(`orders/${orderId}.json`, JSON.stringify(order, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true
    });
    
    logOrderOperation('create_success', { orderId, total: order.totals.total });
    return order;
  } catch (error) {
    logOrderError('create_failed', error, { orderId });
    throw error;
  }
}

/**
 * Get order by ID from blob storage
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    logOrderOperation('get_start', { orderId });
    
    // Use list() to locate the order blob (proven approach from cart/account systems)
    const blobs = await list({ prefix: `orders/${orderId}.json`, limit: 1 });
    const blobItem = blobs?.blobs?.[0];
    const downloadUrl = blobItem?.url;
    
    if (!downloadUrl) {
      logOrderOperation('get_not_found', { orderId });
      return null;
    }

    const response = await fetch(downloadUrl, { cache: 'no-store' });
    if (!response.ok) {
      logOrderError('get_fetch_failed', `HTTP ${response.status}`, { orderId });
      return null;
    }
    
    const order: Order = await response.json();
    logOrderOperation('get_success', { orderId, status: order.status });
    
    return order;
  } catch (error) {
    logOrderError('get_failed', error, { orderId });
    return null;
  }
}

/**
 * Update order status and Roastify data
 */
export async function updateOrderStatus(
  orderId: string, 
  status: OrderStatus, 
  roastifyData?: Partial<RoastifyData>
): Promise<void> {
  try {
    logOrderOperation('update_start', { orderId, status, roastifyData });
    
    const order = await getOrder(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    // Update order data
    order.status = status;
    order.updated_at = new Date().toISOString();
    
    if (roastifyData) {
      order.roastify = { ...order.roastify, ...roastifyData };
    }
    
    // Save updated order
    await put(`orders/${orderId}.json`, JSON.stringify(order, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true
    });
    
    logOrderOperation('update_success', { orderId, status, roastifyOrderId: order.roastify.roastify_order_id });
  } catch (error) {
    logOrderError('update_failed', error, { orderId, status });
    throw error;
  }
}

/**
 * Get all orders (for admin interface)
 */
export async function getAllOrders(limit: number = 100): Promise<Order[]> {
  try {
    logOrderOperation('get_all_start', { limit });
    
    const { blobs } = await list({
      prefix: 'orders/',
      limit
    });
    
    const orders = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const response = await fetch(blob.url, { cache: 'no-store' });
          if (!response.ok) {
            logOrderError('get_all_blob_fetch_failed', `HTTP ${response.status}`, { blobPath: blob.pathname });
            return null;
          }
          
          const orderText = await response.text();
          return JSON.parse(orderText) as Order;
        } catch (error) {
          logOrderError('get_all_parse_failed', error, { blobPath: blob.pathname });
          return null;
        }
      })
    );
    
    // Filter out failed parses and sort by created_at descending (newest first)
    const validOrders = orders
      .filter((order): order is Order => order !== null)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    logOrderOperation('get_all_success', { total: validOrders.length, requested: limit });
    return validOrders;
      
  } catch (error) {
    logOrderError('get_all_failed', error, { limit });
    return [];
  }
}

/**
 * Get orders for a specific customer (by user ID or email)
 */
export async function getCustomerOrders(userId?: string, email?: string): Promise<Order[]> {
  try {
    const allOrders = await getAllOrders();
    
    const customerOrders = allOrders.filter(order => {
      if (userId && order.customer.id === userId) return true;
      if (email && order.customer.email.toLowerCase() === email.toLowerCase()) return true;
      return false;
    });
    
    logOrderOperation('get_customer_orders_success', { 
      userId, 
      email, 
      orderCount: customerOrders.length 
    });
    
    return customerOrders;
  } catch (error) {
    logOrderError('get_customer_orders_failed', error, { userId, email });
    return [];
  }
}

/**
 * Search orders by various criteria
 */
export async function searchOrders(searchTerm: string, statusFilter?: OrderStatus): Promise<Order[]> {
  try {
    const allOrders = await getAllOrders();
    
    const filteredOrders = allOrders.filter(order => {
      // Search term matches order ID, customer name, or email
      const matchesSearch = !searchTerm || 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter matches
      const matchesStatus = !statusFilter || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    logOrderOperation('search_success', { 
      searchTerm, 
      statusFilter, 
      resultCount: filteredOrders.length 
    });
    
    return filteredOrders;
  } catch (error) {
    logOrderError('search_failed', error, { searchTerm, statusFilter });
    return [];
  }
}

/**
 * Get order statistics for admin dashboard
 */
export async function getOrderStats(): Promise<{
  total: number;
  byStatus: Record<OrderStatus, number>;
  totalRevenue: number;
  avgOrderValue: number;
}> {
  try {
    const allOrders = await getAllOrders();
    
    const stats = {
      total: allOrders.length,
      byStatus: {
        [OrderStatus.CREATED]: 0,
        [OrderStatus.SUBMITTED]: 0,
        [OrderStatus.PROCESSING]: 0,
        [OrderStatus.SHIPPED]: 0,
        [OrderStatus.DELIVERED]: 0,
        [OrderStatus.CANCELLED]: 0,
        [OrderStatus.FAILED]: 0,
      },
      totalRevenue: 0,
      avgOrderValue: 0
    };
    
    allOrders.forEach(order => {
      stats.byStatus[order.status]++;
      if (order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.FAILED) {
        stats.totalRevenue += order.totals.total;
      }
    });
    
    stats.avgOrderValue = stats.total > 0 ? stats.totalRevenue / stats.total : 0;
    
    logOrderOperation('stats_success', stats);
    return stats;
  } catch (error) {
    logOrderError('stats_failed', error);
    return {
      total: 0,
      byStatus: {
        [OrderStatus.CREATED]: 0,
        [OrderStatus.SUBMITTED]: 0,
        [OrderStatus.PROCESSING]: 0,
        [OrderStatus.SHIPPED]: 0,
        [OrderStatus.DELIVERED]: 0,
        [OrderStatus.CANCELLED]: 0,
        [OrderStatus.FAILED]: 0,
      },
      totalRevenue: 0,
      avgOrderValue: 0
    };
  }
}
