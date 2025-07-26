// Enhanced product cache management system with better variant grouping
import type { SheetProduct } from "./google-sheets-integration"
import type { GroupedProduct } from "./product-variants"
import { groupProductVariants } from "./product-variants"

// In-memory cache for products
let productCache: SheetProduct[] = []
let groupedProductCache: GroupedProduct[] = []
let lastSyncTime = 0
let isSyncing = false

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

// Get raw products from cache (admin only)
export function getCachedProductsSync(): SheetProduct[] {
  return productCache
}

// Get grouped products from cache (for end users)
export function getCachedGroupedProducts(): GroupedProduct[] {
  return groupedProductCache
}

// Check if cache needs refresh
export function isCacheStale(): boolean {
  const now = Date.now()
  return now - lastSyncTime > CACHE_DURATION
}

// Update cache with new products (admin only)
export function updateProductCache(products: SheetProduct[]): void {
  console.log(`🔄 Updating cache with ${products.length} raw products...`)

  productCache = products

  // Group products into variants
  console.log(`🔄 Grouping products into variants...`)
  groupedProductCache = groupProductVariants(products)

  lastSyncTime = Date.now()

  console.log(`✅ Product cache updated:`)
  console.log(`   - Raw products: ${products.length}`)
  console.log(`   - Grouped products: ${groupedProductCache.length}`)
  console.log(`   - Sync time: ${new Date(lastSyncTime).toLocaleString()}`)

  // Log some examples for debugging
  if (groupedProductCache.length > 0) {
    console.log(`📊 Sample grouped products:`)
    groupedProductCache.slice(0, 3).forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.productName}:`)
      console.log(`      - Variants: ${product.variants.length}`)
      console.log(`      - Formats: ${product.availableFormats.join(", ")}`)
      console.log(`      - Price range: $${product.priceRange.min} - $${product.priceRange.max}`)
    })
  }
}

// Get cache status
export function getCacheStatus() {
  return {
    rawProductCount: productCache.length,
    groupedProductCount: groupedProductCache.length,
    lastSync: new Date(lastSyncTime).toISOString(),
    isStale: isCacheStale(),
    isSyncing,
    nextSyncIn: Math.max(0, CACHE_DURATION - (Date.now() - lastSyncTime)),
  }
}

// Set syncing status
export function setSyncingStatus(status: boolean): void {
  isSyncing = status
  console.log(`🔄 Sync status: ${status ? "SYNCING" : "IDLE"}`)
}

// Initialize cache with static data if empty
export function initializeCache(): void {
  if (productCache.length === 0) {
    console.log("🚀 Initializing product cache with sample products...")

    // Initialize with sample products that demonstrate variants
    productCache = [
      {
        sku: "COFFEE-MORNING-12OZ-WHOLE",
        productName: "Morning Blend",
        category: "coffee",
        subcategory: "signature-blend",
        status: "active",
        price: 16.99,
        description: "Our signature morning blend - smooth, balanced, and perfect for starting your day",
        roastLevel: "medium",
        origin: "Colombia & Brazil",
        weight: "12 oz",
        format: "whole-bean",
        tastingNotes: ["Chocolate", "Caramel", "Nuts"],
        featured: true,
      },
      {
        sku: "COFFEE-MORNING-12OZ-GROUND",
        productName: "Morning Blend",
        category: "coffee",
        subcategory: "signature-blend",
        status: "active",
        price: 16.99,
        description: "Our signature morning blend - smooth, balanced, and perfect for starting your day",
        roastLevel: "medium",
        origin: "Colombia & Brazil",
        weight: "12 oz",
        format: "ground",
        tastingNotes: ["Chocolate", "Caramel", "Nuts"],
        featured: true,
      },
      {
        sku: "COFFEE-DARK-12OZ-WHOLE",
        productName: "Dark Roast Supreme",
        category: "coffee",
        subcategory: "dark-roast",
        status: "active",
        price: 17.99,
        description: "Bold and intense dark roast with rich, smoky flavors",
        roastLevel: "dark",
        origin: "Guatemala",
        weight: "12 oz",
        format: "whole-bean",
        tastingNotes: ["Dark Chocolate", "Smoky", "Robust"],
        featured: true,
      },
      {
        sku: "COFFEE-DARK-12OZ-GROUND",
        productName: "Dark Roast Supreme",
        category: "coffee",
        subcategory: "dark-roast",
        status: "active",
        price: 17.99,
        description: "Bold and intense dark roast with rich, smoky flavors",
        roastLevel: "dark",
        origin: "Guatemala",
        weight: "12 oz",
        format: "ground",
        tastingNotes: ["Dark Chocolate", "Smoky", "Robust"],
        featured: true,
      },
      {
        sku: "COFFEE-LIGHT-12OZ-WHOLE",
        productName: "Ethiopian Single Origin",
        category: "coffee",
        subcategory: "single-origin",
        status: "active",
        price: 19.99,
        description: "Bright and fruity single origin from Ethiopia",
        roastLevel: "light",
        origin: "Ethiopia",
        weight: "12 oz",
        format: "whole-bean",
        tastingNotes: ["Blueberry", "Floral", "Citrus"],
        featured: false,
      },
    ] as SheetProduct[]

    groupedProductCache = groupProductVariants(productCache)
    lastSyncTime = Date.now()

    console.log(`✅ Initialized cache:`)
    console.log(`   - Raw products: ${productCache.length}`)
    console.log(`   - Grouped products: ${groupedProductCache.length}`)
  }
}

// Auto-initialize cache
initializeCache()
