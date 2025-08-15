export interface ProductImage {
  id: string
  url: string
  alt: string
  type: 'thumbnail' | 'main' | 'gallery'
  order: number
}

export interface BundleItem {
  sku: string
  productName: string
  quantity: number
  unitPrice: number
  notes?: string
}

export interface Product {
  id: string;
  sku: string;
  productName: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'coffee' | 'subscription' | 'gift-set' | 'equipment' | string; // Allow other strings
  status: 'active' | 'draft' | 'archived';
  featured: boolean;
  inStock: boolean;
  images: ProductImage[];
  createdAt: Date;
  updatedAt: Date;

  // Coffee-specific fields
  roastLevel?: 'light' | 'medium' | 'medium-dark' | 'dark' | string;
  origin?: string | string[]; // Support multiple origins
  format?: 'whole-bean' | 'ground' | 'instant' | 'pods' | string;
  weight?: string;
  tastingNotes?: string[]; // Array of tasting notes
  blendComposition?: string; // "60% Colombian, 40% Brazilian"

  // Enhanced Subscription fields (supporting both naming conventions)
  notification?: string;
  subscriptionInterval?: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly' | string;
  billingInterval?: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | string; // NEW: Alternative naming
  deliveryFrequency?: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly' | string;
  notificationEnabled?: boolean;
  enableNotificationBanner?: boolean; // NEW: Alternative naming
  notificationMessage?: string; // NEW: Message content
  maxDeliveries?: number;
  trialDays?: number;
  trialPeriodDays?: number; // NEW: Alternative naming

  // Gift Bundle fields
  bundleType?: 'starter-pack' | 'premium-bundle' | 'custom-selection' | 'seasonal-gift' | string;
  bundleContents?: BundleItem[];
  bundleDescription?: string;
  giftMessage?: string;
  packagingType?: 'standard' | 'premium' | 'gift-box' | string;
  seasonalAvailability?: string;

  // Shipping fields
  shippingFirst?: number;
  shippingAdditional?: number;

  [key: string]: any; // For other dynamic properties from CSV
}

// Specialized subscription interface
export interface SubscriptionProduct extends Product {
  category: 'subscription';
  billingInterval: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  deliveryFrequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  trialPeriodDays: number;
  maxDeliveries?: number;
  enableNotificationBanner: boolean;
  notificationMessage?: string;
  inStock: boolean;
}

// Specialized gift bundle interface
export interface GiftBundleProduct extends Product {
  category: 'gift-set';
  bundleType: 'starter-pack' | 'premium-bundle' | 'custom-selection' | 'seasonal-gift';
  bundleContents: BundleItem[];
  bundleDescription?: string;
  giftMessage?: string;
  packagingType?: 'standard' | 'premium' | 'gift-box';
  seasonalAvailability?: string;
}

/**
 * Account & Session Types (Phase 1)
 */

export interface UserAccount {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  status: 'active' | 'suspended' | 'deleted';

  // Password authentication
  password_hash: string;
  email_verified: boolean;

  subscriber: {
    is_subscriber: boolean;
    tier: 'basic' | 'premium' | null;
    expires_at: string | null;
  };
  profile: {
    display_name: string;
    preferences?: Record<string, any>;
    created_at: string;
    last_login: string;
    password_changed_at?: string;
  };
}

export interface PasswordResetToken {
  token: string;
  user_id: string;
  email: string;
  expires_at: string;
  created_at: string;
  used: boolean;
}

export interface SessionData {
  userId: string;
  email: string;
  role: 'admin' | 'customer';
  isSubscriber: boolean;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  base_price: number;
  line_total: number;
}

export interface ShoppingCart {
  id: string;
  user_id?: string;
  session_id: string;
  items: CartItem[];
  totals: { subtotal: number; total: number; };
  created_at: string;
  updated_at: string;
  expires_at: string;
}

// Cart API Request Types
export interface AddToCartRequest {
  product_id: string;
  quantity: number;
  is_subscription?: boolean;
  subscription_interval?: string;
}
