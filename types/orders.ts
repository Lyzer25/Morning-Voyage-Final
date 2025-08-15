export interface Order {
  id: string;                    // Our internal order ID (e.g., "MV-001234")
  roastifyOrderId?: string;      // Roastify's auto-generated ID
  status: OrderStatus;           // Current order status
  customer: CustomerInfo;        // Customer details
  shipping: ShippingInfo;        // Shipping address
  items: OrderItem[];           // Products ordered
  totals: OrderTotals;          // Pricing breakdown
  roastify: RoastifyData;       // Roastify-specific data
  created_at: string;           // ISO timestamp
  updated_at: string;           // ISO timestamp
  metadata?: OrderMetadata;     // Additional data
}

export enum OrderStatus {
  CREATED = 'created',          // Order created in our system
  SUBMITTED = 'submitted',      // Sent to Roastify
  PROCESSING = 'processing',    // Roastify is processing
  SHIPPED = 'shipped',          // Shipped by Roastify
  DELIVERED = 'delivered',      // Delivered to customer
  CANCELLED = 'cancelled',      // Order cancelled
  FAILED = 'failed'             // Roastify submission failed
}

export interface CustomerInfo {
  id?: string;                  // User ID if logged in
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface OrderItem {
  product_id: string;           // Our product ID
  sku: string;                  // Our SKU
  roastify_sku: string;         // Mapped Roastify SKU
  name: string;
  quantity: number;
  price: number;
  line_total: number;
  is_subscription?: boolean;
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface RoastifyData {
  submitted: boolean;           // Whether sent to Roastify
  submitted_at?: string;        // When sent to Roastify
  roastify_order_id?: string;   // Roastify's order ID
  roastify_status?: string;     // Status from Roastify
  last_sync?: string;           // Last status sync
  error?: string;               // Any error messages
}

export interface OrderMetadata {
  source: 'web' | 'admin';      // Order source
  user_agent?: string;          // Browser info
  ip_address?: string;          // Customer IP
  notes?: string;               // Admin notes
}

// Request/Response types
export interface CheckoutRequest {
  customer: CustomerInfo;
  shipping: ShippingInfo;
  cart: any; // ShoppingCart from cart types
}

export interface CheckoutResponse {
  success: boolean;
  orderId: string;
  roastifySubmitted: boolean;
  message: string;
  error?: string;
}
