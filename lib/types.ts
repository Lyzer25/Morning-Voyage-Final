export interface ProductImage {
  id: string
  url: string
  alt: string
  type: 'thumbnail' | 'main' | 'gallery'
  order: number
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
  origin?: string;
  format?: 'whole-bean' | 'ground' | 'instant' | 'pods' | string;
  weight?: string;
  tastingNotes?: string; // Changed to string for form binding simplicity

  // Subscription-specific fields
  notification?: string;
  subscriptionInterval?: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly' | string;
  deliveryFrequency?: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | string;
  notificationEnabled?: boolean;
  maxDeliveries?: number;
  trialDays?: number;

  // Shipping fields
  shippingFirst?: number;
  shippingAdditional?: number;

  [key: string]: any; // For other dynamic properties from CSV
}
