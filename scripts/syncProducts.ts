#!/usr/bin/env node

// Persistent Google Sheets Product Sync Script
// Fetches live product data, groups variants, and writes to persistent JSON cache

import { fetchProductsFromSheet } from '../lib/google-sheets-integration'
import { groupProductVariants } from '../lib/product-variants'
import { writeFileSync, statSync } from 'fs'
import { join } from 'path'
import { validateSheetAccess } from './validateSheet'

interface SyncStats {
  rawProducts: number
  groupedProducts: number
  activeProducts: number
  timestamp: string
}

// Robust file writing with disk space checks
function writeProductCache(data: any, cachePath: string): void {
  try {
    // Check write permissions and disk space
    console.log('💾 Checking disk space and write permissions...')
    
    const jsonString = JSON.stringify(data, null, 2)
    const dataSizeKB = Math.round(Buffer.byteLength(jsonString, 'utf8') / 1024)
    
    console.log(`📦 Cache data size: ${dataSizeKB} KB`)
    
    // Write the cache file
    writeFileSync(cachePath, jsonString, 'utf8')
    
    // Verify file was written
    const stats = statSync(cachePath)
    const fileSizeKB = Math.round(stats.size / 1024)
    
    console.log(`💾 Cache saved to: ${cachePath}`)
    console.log(`📦 Cache file size: ${fileSizeKB} KB`)
    
  } catch (error: any) {
    if (error.code === 'ENOSPC') {
      console.error('❌ DISK FULL (ENOSPC): Cannot write product-cache.json')
      console.error('   Please free up disk space and try again')
      console.error('   The sync operation has been aborted to prevent data corruption')
      process.exit(1)
    } else if (error.code === 'EACCES') {
      console.error('❌ PERMISSION DENIED: Cannot write to product-cache.json')
      console.error('   Check file permissions and try again')
      process.exit(1)
    } else {
      console.error('❌ Failed to write product cache:', error.message)
      process.exit(1)
    }
  }
}

export async function syncProducts(skipValidation = false): Promise<SyncStats> {
  const startTime = Date.now()
  console.log('🔄 Starting Google Sheets product sync...\n')

  try {
    // Step 1: Run preflight validation (unless skipped)
    if (!skipValidation) {
      console.log('🔍 Running preflight validation...')
      const validation = await validateSheetAccess()
      
      if (!validation.success) {
        console.error('❌ Preflight validation failed - aborting sync')
        console.error('   Run npm run validate for detailed error information')
        process.exit(1)
      }
      
      console.log('✅ Preflight validation passed\n')
    }

    // Step 2: Fetch raw products from Google Sheets
    console.log('📥 Fetching products from Google Sheets...')
    const rawProducts = await fetchProductsFromSheet()
    
    if (rawProducts.length === 0) {
      console.error('❌ No products found in Google Sheets')
      console.error('   Refusing to overwrite cache with empty data')
      console.error('   Run npm run validate to check your configuration')
      process.exit(1)
    }

    console.log(`✅ Fetched ${rawProducts.length} raw products from Google Sheets`)

    // Step 3: Group products into variants
    console.log('🔄 Grouping products into variants...')
    const groupedProducts = groupProductVariants(rawProducts)
    
    const activeProducts = groupedProducts.filter(p => 
      p.variants.some(v => v.inStock)
    ).length

    console.log(`✅ Grouped into ${groupedProducts.length} products (${activeProducts} active)`)

    if (activeProducts === 0) {
      console.error('❌ No active products found after grouping')
      console.error('   Check product status and format in your spreadsheet')
      process.exit(1)
    }

    // Step 4: Write to persistent JSON cache with robust error handling
    const cacheData = {
      products: groupedProducts,
      stats: {
        rawProducts: rawProducts.length,
        groupedProducts: groupedProducts.length,
        activeProducts: activeProducts,
        timestamp: new Date().toISOString(),
        syncDuration: Date.now() - startTime
      }
    }

    const cachePath = join(process.cwd(), 'product-cache.json')
    writeProductCache(cacheData, cachePath)
    
    console.log(`✅ Synced ${activeProducts} product groups from ${rawProducts.length} raw products`)
    console.log(`⏱️  Sync completed in ${Date.now() - startTime}ms`)

    // Step 5: Log sample products for verification
    if (groupedProducts.length > 0) {
      console.log('\n📊 Sample synced products:')
      groupedProducts.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.productName}`)
        console.log(`      - Slug: ${product.baseSku.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)
        console.log(`      - Variants: ${product.variants.length}`)
        console.log(`      - Formats: ${product.availableFormats.join(', ')}`)
        console.log(`      - Price: $${product.priceRange.min}-$${product.priceRange.max}`)
      })
    }

    return {
      rawProducts: rawProducts.length,
      groupedProducts: groupedProducts.length,
      activeProducts: activeProducts,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('❌ Product sync failed:', error)
    
    // Write error info to cache file for debugging (only if we can write)
    try {
      const errorCacheData = {
        products: [],
        stats: {
          rawProducts: 0,
          groupedProducts: 0,
          activeProducts: 0,
          timestamp: new Date().toISOString(),
          syncDuration: Date.now() - startTime,
          error: error instanceof Error ? error.message : String(error)
        }
      }

      const cachePath = join(process.cwd(), 'product-cache.json')
      writeFileSync(cachePath, JSON.stringify(errorCacheData, null, 2), 'utf8')
      console.log('💾 Written error cache file for debugging')
    } catch (writeError: any) {
      if (writeError.code === 'ENOSPC') {
        console.error('❌ Cannot write error cache - disk full')
      } else {
        console.error('❌ Failed to write error cache:', writeError.message)
      }
    }

    throw error
  }
}

// Run script if called directly
if (require.main === module) {
  const skipValidation = process.argv.includes('--skip-validation')
  
  syncProducts(skipValidation)
    .then((stats) => {
      console.log('\n🎉 Sync completed successfully!')
      console.log(`📊 Final stats: ${stats.activeProducts} active products ready`)
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Sync failed:', error.message)
      process.exit(1)
    })
}
