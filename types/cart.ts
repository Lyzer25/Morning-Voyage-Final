export interface Cart {
  id: string;
  user_id?: string;
  guest_session_id?: string;
  items: CartItem[];
  totals: CartTotals;
  created_at: string;
  updated_at: string;
  expires_at: string;
  metadata?: CartMetadata;
}

export interface CartItem {
  product_id: string;
  sku: string;
  name: string;
  quantity: number;
  base_price: number;
  line_total: number;
  is_subscription?: boolean;
  subscription_interval?: string;
  metadata?: {
    variant?: string;
    customization?: any;
  };
}

export interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface CartMetadata {
  discount_codes?: string[];
  shipping_method?: string;
  notes?: string;
}

export interface AddToCartRequest {
  product_id: string;
  quantity: number;
  is_subscription?: boolean;
  subscription_interval?: string;
}

export interface UpdateCartRequest {
  discount_codes?: string[];
  shipping_method?: string;
  notes?: string;
}
