// File-based product cache management system
import type { SheetProduct } from './google-sheets-integration'
import type { GroupedProduct } from './product-variants'
import { groupProductVariants } from './product-variants'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Cache interfaces
interface CacheData {
  products: GroupedProduct[]
  stats: {
    rawProducts: number
    groupedProducts: number
    activeProducts: number
    timestamp: string
    syncDuration?: number
    error?: string
  }
}

// Cache file path
const CACHE_FILE_PATH = join(process.cwd(), 'product-cache.json')

// Sync status tracking
let isSyncing = false

// Load products from persistent JSON cache
export function getCachedGroupedProducts(): GroupedProduct[] {
  try {
    if (existsSync(CACHE_FILE_PATH)) {
      console.log('📂 Loading products from persistent cache:', CACHE_FILE_PATH)
      const raw = readFileSync(CACHE_FILE_PATH, 'utf8')
      const cacheData: CacheData = JSON.parse(raw)
      
      if (cacheData.products && Array.isArray(cacheData.products)) {
        console.log(`✅ Loaded ${cacheData.products.length} products from cache`)
        console.log(`📊 Cache stats:`, cacheData.stats)
        return cacheData.products
      } else {
        console.warn('⚠️ Invalid cache data structure, using fallback')
        return getFallbackProducts()
      }
    } else {
      console.warn('⚠️ Product cache file not found, using fallback products')
      console.log(`   Expected file: ${CACHE_FILE_PATH}`)
      console.log(`   Run 'npm run sync' to create initial cache`)
      return getFallbackProducts()
    }
  } catch (error) {
    console.error('❌ Error reading product cache:', error)
    console.log('   Using fallback products instead')
    return getFallbackProducts()
  }
}

// Get raw products from cache (admin/API use)
export function getCachedProductsSync(): SheetProduct[] {
  // This function is for admin use - we'll read the cache and return raw products
  // For now, we don't store raw products in the cache file, only grouped ones
  console.warn('⚠️ getCachedProductsSync: Raw products not stored in file cache')
  return []
}

// Get cache status and stats
export function getCacheStatus() {
  try {
    if (existsSync(CACHE_FILE_PATH)) {
      const raw = readFileSync(CACHE_FILE_PATH, 'utf8')
      const cacheData: CacheData = JSON.parse(raw)
      
      return {
        exists: true,
        groupedProductCount: cacheData.products?.length || 0,
        lastSync: cacheData.stats?.timestamp || 'unknown',
        rawProductCount: cacheData.stats?.rawProducts || 0,
        activeProductCount: cacheData.stats?.activeProducts || 0,
        syncDuration: cacheData.stats?.syncDuration,
        error: cacheData.stats?.error,
        isSyncing,
        filePath: CACHE_FILE_PATH
      }
    } else {
      return {
        exists: false,
        groupedProductCount: 0,
        lastSync: 'never',
        rawProductCount: 0,
        activeProductCount: 0,
        isSyncing,
        filePath: CACHE_FILE_PATH
      }
    }
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : String(error),
      groupedProductCount: 0,
      lastSync: 'error',
      rawProductCount: 0,
      activeProductCount: 0,
      isSyncing,
      filePath: CACHE_FILE_PATH
    }
  }
}

// Set syncing status
export function setSyncingStatus(status: boolean): void {
  isSyncing = status
  console.log(`🔄 Sync status: ${status ? 'SYNCING' : 'IDLE'}`)
}

// Legacy function for backward compatibility
export function updateProductCache(products: SheetProduct[]): void {
  console.log(`🔄 Legacy updateProductCache called with ${products.length} products`)
  console.log('   Note: File-based cache is updated by syncProducts.ts script')
  
  if (products.length > 0) {
    console.log('   Consider running: npm run sync')
  }
}

// Fallback products when cache file doesn't exist
function getFallbackProducts(): GroupedProduct[] {
  console.log('🚀 Using fallback sample products...')
  
  const sampleProducts: SheetProduct[] = [
    {
      sku: 'COFFEE-MORNING-12OZ-WHOLE',
      productName: 'Morning Blend',
      category: 'coffee',
      subcategory: 'signature-blend',
      status: 'active',
      price: 16.99,
      description: 'Our signature morning blend - smooth, balanced, and perfect for starting your day',
      roastLevel: 'medium',
      origin: 'Colombia & Brazil',
      weight: '12 oz',
      format: 'whole-bean',
      tastingNotes: ['Chocolate', 'Caramel', 'Nuts'],
      featured: true,
    },
    {
      sku: 'COFFEE-MORNING-12OZ-GROUND',
      productName: 'Morning Blend',
      category: 'coffee',
      subcategory: 'signature-blend',
      status: 'active',
      price: 16.99,
      description: 'Our signature morning blend - smooth, balanced, and perfect for starting your day',
      roastLevel: 'medium',
      origin: 'Colombia & Brazil',
      weight: '12 oz',
      format: 'ground',
      tastingNotes: ['Chocolate', 'Caramel', 'Nuts'],
      featured: true,
    },
    {
      sku: 'COFFEE-DARK-12OZ-WHOLE',
      productName: 'Dark Roast Supreme',
      category: 'coffee',
      subcategory: 'dark-roast',
      status: 'active',
      price: 17.99,
      description: 'Bold and intense dark roast with rich, smoky flavors',
      roastLevel: 'dark',
      origin: 'Guatemala',
      weight: '12 oz',
      format: 'whole-bean',
      tastingNotes: ['Dark Chocolate', 'Smoky', 'Robust'],
      featured: true,
    },
    {
      sku: 'COFFEE-DARK-12OZ-GROUND',
      productName: 'Dark Roast Supreme',
      category: 'coffee',
      subcategory: 'dark-roast',
      status: 'active',
      price: 17.99,
      description: 'Bold and intense dark roast with rich, smoky flavors',
      roastLevel: 'dark',
      origin: 'Guatemala',
      weight: '12 oz',
      format: 'ground',
      tastingNotes: ['Dark Chocolate', 'Smoky', 'Robust'],
      featured: true,
    },
    {
      sku: 'COFFEE-LIGHT-12OZ-WHOLE',
      productName: 'Ethiopian Single Origin',
      category: 'coffee',
      subcategory: 'single-origin',
      status: 'active',
      price: 19.99,
      description: 'Bright and fruity single origin from Ethiopia',
      roastLevel: 'light',
      origin: 'Ethiopia',
      weight: '12 oz',
      format: 'whole-bean',
      tastingNotes: ['Blueberry', 'Floral', 'Citrus'],
      featured: false,
    },
  ]

  const groupedProducts = groupProductVariants(sampleProducts)
  
  console.log(`✅ Generated ${groupedProducts.length} fallback products`)
  return groupedProducts
}

// Check if cache file exists
export function cacheFileExists(): boolean {
  return existsSync(CACHE_FILE_PATH)
}

// Get cache file path (for debugging)
export function getCacheFilePath(): string {
  return CACHE_FILE_PATH
}
