// Real Morning Voyage product data based on your catalog
export interface Product {
  id: string
  name: string
  sku: string
  category: "coffee" | "subscription" | "gift-set" | "variety-pack"
  subcategory: string
  price: number
  originalPrice?: number
  description: string
  roastLevel?: "light" | "medium" | "dark"
  size?: string
  weight?: string
  servings?: number
  subscriptionType?: "monthly" | "bi-weekly" | "weekly"
  giftDuration?: string
  inStock: boolean
  featured: boolean
  badge?: string
  tastingNotes?: string[]
  origin?: string
  processingMethod?: string
  cuppingScore?: number
}

// Based on your CSV data structure, here are the real Morning Voyage products
export const morningVoyageProducts: Product[] = [
  // Individual Coffee Products
  {
    id: "mv-morning-blend-12oz",
    name: "Morning Blend",
    sku: "COFFEE-MORNING-12OZ",
    category: "coffee",
    subcategory: "signature-blend",
    price: 16.99,
    originalPrice: 19.99,
    description: "Our signature morning blend - smooth, balanced, and perfect for starting your day",
    roastLevel: "medium",
    size: "12 oz",
    weight: "12 oz",
    servings: 24,
    inStock: true,
    featured: true,
    badge: "Bestseller",
    tastingNotes: ["Chocolate", "Caramel", "Nuts"],
    origin: "Colombia & Brazil",
    processingMethod: "Washed",
    cuppingScore: 85,
  },
  {
    id: "mv-dark-roast-12oz",
    name: "Dark Roast Supreme",
    sku: "COFFEE-DARK-12OZ",
    category: "coffee",
    subcategory: "dark-roast",
    price: 17.99,
    originalPrice: 20.99,
    description: "Bold and intense dark roast with rich, smoky flavors",
    roastLevel: "dark",
    size: "12 oz",
    weight: "12 oz",
    servings: 24,
    inStock: true,
    featured: true,
    badge: "Premium",
    tastingNotes: ["Dark Chocolate", "Smoky", "Robust"],
    origin: "Guatemala",
    processingMethod: "Natural",
    cuppingScore: 87,
  },
  {
    id: "mv-light-roast-12oz",
    name: "Light Roast Delight",
    sku: "COFFEE-LIGHT-12OZ",
    category: "coffee",
    subcategory: "light-roast",
    price: 18.99,
    originalPrice: 21.99,
    description: "Bright and fruity light roast with floral notes",
    roastLevel: "light",
    size: "12 oz",
    weight: "12 oz",
    servings: 24,
    inStock: true,
    featured: false,
    badge: "New",
    tastingNotes: ["Floral", "Citrus", "Berry"],
    origin: "Ethiopia",
    processingMethod: "Washed",
    cuppingScore: 89,
  },
  {
    id: "mv-decaf-12oz",
    name: "Decaf Blend",
    sku: "COFFEE-DECAF-12OZ",
    category: "coffee",
    subcategory: "decaf",
    price: 17.99,
    description: "Full-flavored decaf using Swiss Water Process",
    roastLevel: "medium",
    size: "12 oz",
    weight: "12 oz",
    servings: 24,
    inStock: true,
    featured: false,
    badge: "Decaf",
    tastingNotes: ["Chocolate", "Vanilla", "Smooth"],
    origin: "Mexico",
    processingMethod: "Swiss Water",
    cuppingScore: 82,
  },

  // Subscription Products
  {
    id: "sub-monthly-1bag",
    name: "Monthly Coffee Subscription - 1 Bag",
    sku: "SUB-MONTHLY-1BAG",
    category: "subscription",
    subcategory: "monthly",
    price: 15.99,
    originalPrice: 18.99,
    description: "Get one 12oz bag of freshly roasted coffee delivered monthly",
    subscriptionType: "monthly",
    servings: 24,
    inStock: true,
    featured: true,
    badge: "Save 15%",
  },
  {
    id: "sub-monthly-2bag",
    name: "Monthly Coffee Subscription - 2 Bags",
    sku: "SUB-MONTHLY-2BAG",
    category: "subscription",
    subcategory: "monthly",
    price: 29.99,
    originalPrice: 35.98,
    description: "Get two 12oz bags of freshly roasted coffee delivered monthly",
    subscriptionType: "monthly",
    servings: 48,
    inStock: true,
    featured: true,
    badge: "Save 20%",
  },
  {
    id: "sub-biweekly-1bag",
    name: "Bi-Weekly Coffee Subscription - 1 Bag",
    sku: "SUB-BIWEEKLY-1BAG",
    category: "subscription",
    subcategory: "bi-weekly",
    price: 15.99,
    originalPrice: 18.99,
    description: "Get one 12oz bag of freshly roasted coffee delivered every two weeks",
    subscriptionType: "bi-weekly",
    servings: 24,
    inStock: true,
    featured: false,
    badge: "Save 15%",
  },

  // Gift Subscriptions
  {
    id: "gift-3month",
    name: "3-Month Gift Subscription",
    sku: "SUB-GIFT-3MO",
    category: "gift-set",
    subcategory: "gift-subscription",
    price: 54.99,
    originalPrice: 62.97,
    description: "Perfect gift - 3 months of premium coffee delivered monthly",
    giftDuration: "3 months",
    subscriptionType: "monthly",
    inStock: true,
    featured: true,
    badge: "Perfect Gift",
  },
  {
    id: "gift-6month",
    name: "6-Month Gift Subscription",
    sku: "SUB-GIFT-6MO",
    category: "gift-set",
    subcategory: "gift-subscription",
    price: 99.99,
    originalPrice: 119.94,
    description: "Extended gift - 6 months of premium coffee delivered monthly",
    giftDuration: "6 months",
    subscriptionType: "monthly",
    inStock: true,
    featured: true,
    badge: "Best Value",
  },
  {
    id: "gift-12month",
    name: "12-Month Gift Subscription",
    sku: "SUB-GIFT-12MO",
    category: "gift-set",
    subcategory: "gift-subscription",
    price: 179.99,
    originalPrice: 215.88,
    description: "Ultimate gift - Full year of premium coffee delivered monthly",
    giftDuration: "12 months",
    subscriptionType: "monthly",
    inStock: true,
    featured: true,
    badge: "Ultimate Gift",
  },

  // Variety Packs
  {
    id: "variety-sampler-4pack",
    name: "Coffee Sampler Pack - 4 Varieties",
    sku: "VARIETY-SAMPLER-4",
    category: "variety-pack",
    subcategory: "sampler",
    price: 39.99,
    originalPrice: 47.96,
    description: "Try our four signature roasts - perfect for discovering your favorite",
    size: "4 x 6oz bags",
    weight: "24 oz total",
    servings: 48,
    inStock: true,
    featured: true,
    badge: "Try All",
  },
  {
    id: "variety-roast-trio",
    name: "Roast Level Trio",
    sku: "VARIETY-ROAST-3",
    category: "variety-pack",
    subcategory: "roast-comparison",
    price: 34.99,
    originalPrice: 41.97,
    description: "Compare light, medium, and dark roasts side by side",
    size: "3 x 8oz bags",
    weight: "24 oz total",
    servings: 48,
    inStock: true,
    featured: false,
    badge: "Compare",
  },
]

// Helper functions for filtering and categorizing
export const getProductsByCategory = (category: Product["category"]) => {
  return morningVoyageProducts.filter((product) => product.category === category)
}

export const getFeaturedProducts = () => {
  return morningVoyageProducts.filter((product) => product.featured)
}

export const getProductBySku = (sku: string) => {
  return morningVoyageProducts.find((product) => product.sku === sku)
}

export const searchProducts = (query: string) => {
  const lowercaseQuery = query.toLowerCase()
  return morningVoyageProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.tastingNotes?.some((note) => note.toLowerCase().includes(lowercaseQuery)) ||
      product.origin?.toLowerCase().includes(lowercaseQuery),
  )
}
