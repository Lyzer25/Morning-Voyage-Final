export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  category: string
  tags: string[]
  variants?: ProductVariant[]
  featured?: boolean
  bestSeller?: boolean
  new?: boolean
  stock: number
  createdAt: string
  updatedAt: string
}

export interface ProductVariant {
  id: string
  name: string
  options: string[]
}
