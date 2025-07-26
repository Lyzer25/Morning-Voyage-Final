// API-based product cache management system
import type { Product } from "./types"
import type { GroupedProduct } from "./product-variants"

// In-memory cache for products
let productCache: Product[] = []
let groupedProductCache: GroupedProduct[] = []
let lastSyncTime = 0
let isSyncing = false

// Cache duration (1 minute for development, 5 minutes for production)
const CACHE_DURATION = process.env.NODE_ENV === 'development' ? 60 * 1000 : 5 * 60 * 1000

// Fetch products from API - Vercel-optimized URL resolution
async function fetchProducts(grouped: boolean = false, category?: string): Promise<any> {
  try {
    // Use different URL resolution strategies for different contexts
    let baseUrl = ''
    
    if (typeof window === 'undefined') {
      // Server-side: Use relative URLs for internal API calls on Vercel
      if (process.env.VERCEL) {
        // On Vercel, use relative URLs for internal API calls
        baseUrl = ''
      } else if (process.env.VERCEL_URL) {
        // Vercel preview/production - construct full URL carefully
        baseUrl = process.env.VERCEL_URL.startsWith('http') 
          ? process.env.VERCEL_URL 
          : `https://${process.env.VERCEL_URL}`
      } else {
        // Local development
        baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      }
    }
    // Client-side: always use relative URLs
    
    const params = new URLSearchParams()
    if (grouped) params.append('grouped', 'true')
    if (category) params.append('category', category)
    
    const url = `${baseUrl}/api/products${params.toString() ? '?' + params.toString() : ''}`
    console.log(`🔄 Fetching products from API: ${url} (Vercel: ${!!process.env.VERCEL})`)
    
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout for production reliability
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log(`✅ API Response: ${data.count || data.products?.length || 0} products`)
    
    return data
  } catch (error) {
    console.error("❌ Error fetching products from API:", error)
    // In production, provide more detailed error context
    if (process.env.VERCEL) {
      console.error("🔍 Vercel context:", {
        VERCEL_URL: process.env.VERCEL_URL,
        NODE_ENV: process.env.NODE_ENV,
        isServer: typeof window === 'undefined'
      })
    }
    throw error
  }
}

// Get raw products from cache or API (admin only)
export async function getCachedProducts(): Promise<Product[]> {
  const now = Date.now()
  
  // Return cached data if fresh
  if (productCache.length > 0 && now - lastSyncTime < CACHE_DURATION) {
    console.log("📦 Returning cached raw products")
    return productCache
  }

  try {
    isSyncing = true
    const data = await fetchProducts(false)
    productCache = data.products || []
    lastSyncTime = now
    console.log(`✅ Updated raw product cache: ${productCache.length} products`)
    return productCache
  } catch (error) {
    console.error("❌ Failed to fetch products, returning cached data:", error)
    return productCache
  } finally {
    isSyncing = false
  }
}

// Get grouped products from cache or API (for end users)
export async function getCachedGroupedProducts(): Promise<GroupedProduct[]> {
  const now = Date.now()
  
  // Return cached data if fresh
  if (groupedProductCache.length > 0 && now - lastSyncTime < CACHE_DURATION) {
    console.log("📦 Returning cached grouped products")
    return groupedProductCache
  }

  try {
    isSyncing = true
    const data = await fetchProducts(true)
    groupedProductCache = data.products || []
    lastSyncTime = now
    console.log(`✅ Updated grouped product cache: ${groupedProductCache.length} products`)
    return groupedProductCache
  } catch (error) {
    console.error("❌ Failed to fetch grouped products, returning cached data:", error)
    return groupedProductCache
  } finally {
    isSyncing = false
  }
}

// Synchronous version for immediate access (returns cached data only)
export function getCachedGroupedProductsSync(): GroupedProduct[] {
  return groupedProductCache
}

// Get raw products synchronously (returns cached data only)
export function getCachedProductsSync(): Product[] {
  return productCache
}

// Check if cache needs refresh
export function isCacheStale(): boolean {
  const now = Date.now()
  return now - lastSyncTime > CACHE_DURATION
}

// Force cache refresh
export async function refreshCache(): Promise<void> {
  console.log("🔄 Force refreshing product cache...")
  lastSyncTime = 0 // Force cache refresh
  await Promise.all([
    getCachedProducts(),
    getCachedGroupedProducts()
  ])
}

// Invalidate cache (force next request to fetch fresh data)
export function invalidateCache(): void {
  console.log("🗑️ Invalidating product cache")
  lastSyncTime = 0
  productCache = []
  groupedProductCache = []
}

// Get cache status
export function getCacheStatus() {
  return {
    rawProductCount: productCache.length,
    groupedProductCount: groupedProductCache.length,
    lastSync: lastSyncTime > 0 ? new Date(lastSyncTime).toISOString() : null,
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

// Trigger cache revalidation via API
export async function revalidateCache(paths?: string[]): Promise<void> {
  try {
    console.log("🔄 Triggering cache revalidation...")
    
    const response = await fetch('/api/products/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paths })
    })

    if (!response.ok) {
      throw new Error(`Revalidation failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("✅ Cache revalidation triggered:", result.revalidatedPaths)
    
    // Also invalidate local cache
    invalidateCache()
    
  } catch (error) {
    console.error("❌ Failed to trigger cache revalidation:", error)
  }
}
