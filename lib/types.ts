export interface ProductImage {
  id: string
  url: string
  alt: string
  type: 'thumbnail' | 'main' | 'gallery'
  order: number
}

export interface Product {
  sku: string
  productName: string
  category: string
  subcategory?: string
  status: "active" | "draft" | "archived"
  format: string
  weight?: string
  packSize?: number
  price: number
  originalPrice?: number
  description: string
  longDescription?: string
  roastLevel?: string
  origin?: string
  processingMethod?: string
  tastingNotes?: string | string[] // Allow both for processing
  featured?: boolean
  badge?: string
  images?: ProductImage[] // Add images support
  [key: string]: any // Allow other properties from the full CSV
}
