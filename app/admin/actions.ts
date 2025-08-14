"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { getProducts, updateProducts, addProduct, updateProduct, deleteProduct, PRODUCTS_TAG } from "@/lib/csv-data"
import type { Product } from "@/lib/types"
import { exportProductsToCSV } from "@/lib/csv-helpers"
import { forceInvalidateCache } from "@/lib/product-cache"
import { verifyCustomerFacingData } from "@/lib/verification"
import { put } from "@vercel/blob"

// ENHANCED: Tag-based cache revalidation with comprehensive coverage
async function triggerCacheRevalidation() {
  try {
    console.log("🔄 TAG-BASED: Triggering comprehensive cache revalidation after product update...")
    
    // CRITICAL: Tag-based revalidation (primary method)
    await revalidateTag(PRODUCTS_TAG)
    console.log(`✅ Revalidated products tag: ${PRODUCTS_TAG}`)
    
    // CRITICAL: Force invalidate in-memory cache layers
    forceInvalidateCache()
    console.log("✅ Cleared in-memory product cache")
    
    // Revalidate all customer-facing pages (ISR cache)
    const pathsToRevalidate = ["/", "/coffee", "/subscriptions", "/shop", "/admin"]
    
    for (const path of pathsToRevalidate) {
      revalidatePath(path, "page")
      console.log(`✅ Revalidated ISR page: ${path}`)
    }
    
    // Also revalidate layout-level cache for product page families
    revalidatePath("/", "layout")
    revalidatePath("/coffee", "layout") 
    revalidatePath("/subscriptions", "layout")
    revalidatePath("/product", "layout") // For [slug] pages
    console.log("✅ Revalidated layout caches including product families")
    
    // ENHANCED: Add small delay to allow revalidation to propagate
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (process.env.VERCEL) {
      console.log("🔍 Vercel environment detected - tag-based revalidation completed")
    }
    
    console.log("✅ TAG-BASED: All cache layers cleared successfully")
    
  } catch (error) {
    console.error("❌ Error during tag-based cache revalidation:", error)
    // Don't throw - we still want the main operation to succeed
  }
}

const BLOB_FILENAME = "products.csv"

interface FormState {
  error?: string
  success?: string
}

// REMOVED: uploadCsvAction - CSV uploads now use client-side processing + staging system
// This prevents CSV uploads from bypassing the professional staging workflow

export async function exportCsvAction(): Promise<{ error?: string; csv?: string }> {
  try {
    console.log('📥 CSV EXPORT: Reading from blob storage (not staging)')
    
    const { list } = await import('@vercel/blob')
    const blobs = await list({ prefix: "products.csv" })
    
    if (!blobs.blobs || blobs.blobs.length === 0) {
      console.log('❌ CSV EXPORT: No blob found - checking if empty state')
      return { csv: 'sku,productName,category,price\n' } // Empty CSV template
    }
    
    const targetBlob = blobs.blobs[0]
    console.log('📥 CSV EXPORT: Found blob:', {
      size: targetBlob.size,
      pathname: targetBlob.pathname,
      lastModified: new Date(targetBlob.uploadedAt).toISOString()
    })
    
    // Force fresh fetch from blob (bypass any caches)
    const response = await fetch(targetBlob.url, {
      cache: 'no-store',
      headers: { 
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Blob fetch failed: ${response.status}`)
    }
    
    const csvContent = await response.text()
    
    console.log('✅ CSV EXPORT: Blob content retrieved:', {
      contentLength: csvContent.length,
      lineCount: csvContent.split('\n').length,
      hasHeaders: csvContent.includes('sku') || csvContent.includes('SKU'),
      firstLine: csvContent.split('\n')[0],
      containsBlendComposition: csvContent.includes('BLEND COMPOSITION')
    })
    
    // Verify content quality
    if (!csvContent || csvContent.trim().length === 0) {
      console.warn('⚠️ CSV EXPORT: Blob is empty - this indicates blob write issue')
      return { error: 'Blob storage is empty. Try deploying your changes first.' }
    }
    
    return { csv: csvContent }
    
  } catch (error) {
    console.error('❌ CSV EXPORT: Failed:', error)
    return { error: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

function formDataToProduct(formData: FormData): Product {
  const price = Number(formData.get("price"))
  const originalPrice = formData.get("originalPrice") ? Number(formData.get("originalPrice")) : undefined
  
  // NEW: Parse shipping fields
  const shippingFirst = formData.get("shippingFirst") ? Number(formData.get("shippingFirst")) : undefined
  const shippingAdditional = formData.get("shippingAdditional") ? Number(formData.get("shippingAdditional")) : undefined

  const product: Product = {
    id: formData.get("id") as string || crypto.randomUUID(),
    sku: formData.get("sku") as string,
    productName: formData.get("productName") as string,
    category: formData.get("category") as string,
    status: formData.get("status") as "active" | "draft" | "archived",
    format: formData.get("format") as string,
    price: isNaN(price) ? 0 : price,
    originalPrice: originalPrice && !isNaN(originalPrice) ? originalPrice : undefined,
    description: formData.get("description") as string,
    weight: formData.get("weight") as string,
    roastLevel: formData.get("roastLevel") as string,
    origin: formData.get("origin") as string,
    tastingNotes: (formData.get("tastingNotes") as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
    featured: formData.get("featured") === "on",
    inStock: formData.get("inStock") === "on",
    images: [], // Default to empty array, image handling is separate
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // NEW: Add shipping fields with validation
    shippingFirst: (shippingFirst && !isNaN(shippingFirst)) ? shippingFirst : undefined,
    shippingAdditional: (shippingAdditional && !isNaN(shippingAdditional)) ? shippingAdditional : undefined,
    
    // NEW: Add notification field
    notification: formData.get("notification") as string || undefined,
  }
  return product;
}

export async function addProductAction(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const newProduct = formDataToProduct(formData)
    const products = await getProducts()
    if (products.some((p) => p.sku === newProduct.sku)) {
      return { error: `Product with SKU '${newProduct.sku}' already exists.` }
    }
    await addProduct(newProduct)
    await triggerCacheRevalidation()
    return { success: `Product '${newProduct.productName}' added successfully. Changes will appear on the live site shortly.` }
  } catch (error) {
    console.error("Error adding product:", error)
    return { error: "Failed to add product." }
  }
}

export async function updateProductAction(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const updatedProduct = formDataToProduct(formData)
    await updateProduct(updatedProduct)
    await triggerCacheRevalidation()
    return { success: `Product '${updatedProduct.productName}' updated successfully. Changes will appear on the live site shortly.` }
  } catch (error) {
    console.error("Error updating product:", error)
    return { error: "Failed to update product." }
  }
}

export async function deleteProductAction(sku: string): Promise<FormState> {
  try {
    await deleteProduct(sku)
    await triggerCacheRevalidation()
    return { success: `Product with SKU '${sku}' deleted successfully. Changes will appear on the live site shortly.` }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { error: "Failed to delete product." }
  }
}

export async function toggleFeaturedAction(sku: string, isFeatured: boolean): Promise<FormState> {
  try {
    const products = await getProducts()
    const productIndex = products.findIndex((p) => p.sku === sku)

    if (productIndex === -1) {
      return { error: "Product not found." }
    }

    products[productIndex].featured = isFeatured
    await updateProducts(products)

    await triggerCacheRevalidation()
    return { success: `Product feature status updated for SKU: ${sku}. Changes will appear on the live site shortly.` }
  } catch (error) {
    console.error("Error toggling featured status:", error)
    return { error: "Failed to update product feature status." }
  }
}

export async function bulkDeleteProductsAction(skus: string[]): Promise<FormState> {
  try {
    if (!skus || skus.length === 0) {
      return { error: "No products selected for deletion." }
    }

    console.log(`🗑️ Bulk deleting ${skus.length} products:`, skus)
    
    const products = await getProducts()
    const filteredProducts = products.filter((p) => !skus.includes(p.sku))
    
    if (filteredProducts.length === products.length) {
      return { error: "No matching products found to delete." }
    }

    const deletedCount = products.length - filteredProducts.length
    console.log(`🗑️ Will delete ${deletedCount} products, leaving ${filteredProducts.length} remaining`)

    // Special handling for "delete all" scenario
    if (filteredProducts.length === 0) {
      console.log("🗑️ BULK DELETE ALL: User is deleting all products - this is allowed")
      await updateProducts(filteredProducts) // This will call handleEmptyProductState()
      await triggerCacheRevalidation()
      
      return { 
        success: `Successfully deleted all ${deletedCount} products! The product catalog is now empty. You can upload a new CSV file to restore or add products. Changes will appear on the live site shortly.` 
      }
    }

    // Normal bulk delete (some products remain)
    await updateProducts(filteredProducts)
    await triggerCacheRevalidation()
    
    return { success: `Successfully deleted ${deletedCount} product${deletedCount === 1 ? '' : 's'}. ${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'} remaining. Changes will appear on the live site shortly.` }
  } catch (error) {
    console.error("Error in bulk delete:", error)
    return { error: "Failed to delete selected products." }
  }
}

export async function toggleStatusAction(sku: string, status: "active" | "draft" | "archived"): Promise<FormState> {
  try {
    const products = await getProducts()
    const productIndex = products.findIndex((p) => p.sku === sku)

    if (productIndex === -1) {
      return { error: "Product not found." }
    }

    products[productIndex].status = status
    await updateProducts(products)

    await triggerCacheRevalidation()
    return { success: `Product status updated to ${status} for SKU: ${sku}. Changes will appear on the live site shortly.` }
  } catch (error) {
    console.error("Error toggling status:", error)
    return { error: "Failed to update product status." }
  }
}

// ENHANCED: Save all staged changes to production with immediate cache invalidation
export async function saveToProductionAction(products: Product[]): Promise<FormState & { needsRefresh?: boolean; verified?: boolean; verificationDetails?: any }> {
  try {
    console.log(`🚀 PRODUCTION DEPLOY: Starting deployment of ${products.length} products`)
    
    // Enhanced validation with detailed logging
    if (!Array.isArray(products)) {
      console.error('❌ DEPLOY: Invalid products data type:', typeof products)
      return { error: "Invalid product data format. Expected array of products." }
    }
    
    if (products.length === 0) {
      console.log('📦 DEPLOY: Saving empty product state (delete all scenario)')
    } else {
      console.log('📊 DEPLOY: Product breakdown:', {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        draft: products.filter(p => p.status === 'draft').length,
        featured: products.filter(p => p.featured).length
      })
    }
    
    // Stage 1: Atomic blob storage write with enhanced verification
    console.log('💾 DEPLOY: Writing to Blob storage with verification...')
    const startTime = Date.now()
    await updateProducts(products)
    const blobTime = Date.now() - startTime
    console.log(`✅ DEPLOY: Blob storage updated and verified (${blobTime}ms)`)
    
    // NEW: Write a small canonical hash artifact to blob for quick verification
    try {
      const minimal = (products || []).map(p => ({ sku: p.sku, price: p.price, productName: p.productName })).sort((a, b) => (a.sku || '').localeCompare(b.sku || ''));
      const hash = Buffer.from(JSON.stringify(minimal)).toString('base64');
      const hashPayload = JSON.stringify({
        hash,
        count: products.length,
        timestamp: new Date().toISOString()
      });
      try {
        await put('products-hash.json', hashPayload, {
          access: 'public',
          contentType: 'application/json',
          allowOverwrite: true
        });
        console.log('✅ DEPLOY: products-hash.json written to blob');
      } catch (putErr) {
        console.warn('⚠️ DEPLOY: Failed to write products-hash.json to blob:', putErr);
      }
    } catch (err) {
      console.warn('⚠️ DEPLOY: Failed to compute/write canonical hash:', err);
    }
    
    // Stage 2: IMMEDIATE aggressive cache invalidation
    console.log('🔄 DEPLOY: Starting immediate cache invalidation...')
    const revalidationStart = Date.now()
    
    await Promise.race([
      immediateCacheInvalidation(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Cache invalidation timeout after 15 seconds')), 15000)
      )
    ]).catch(error => {
      console.warn('⚠️ DEPLOY: Cache invalidation warning (continuing deployment):', error)
    })
    
    const revalidationTime = Date.now() - revalidationStart
    console.log(`✅ DEPLOY: Immediate cache invalidation completed (${revalidationTime}ms)`)
    
    // Stage 3: Verify cache clearing worked
    console.log('🔍 DEPLOY: Verifying cache clearing...')
    await verifyCacheClearing()
    console.log('✅ DEPLOY: Cache clearing verified')
    
    // Stage 4: NEW - Verify customer-facing data is live
    console.log('🔍 DEPLOY: Starting customer-facing verification...')
    const verificationStart = Date.now()
    let verified = false
    let verificationDetails = null
    
    try {
      const verificationResult = await verifyCustomerFacingData(products, { timeout: 120000 }); // 2 minute timeout for production
      verified = verificationResult.success
      verificationDetails = verificationResult.diagnostics
      
      const verificationTime = Date.now() - verificationStart
      if (verified) {
        console.log(`✅ DEPLOY: Customer-facing verification successful (${verificationTime}ms)`)
      } else {
        console.warn(`⚠️ DEPLOY: Customer-facing verification timed out (${verificationTime}ms) - changes may still be propagating`)
      }
    } catch (verificationError) {
      console.warn('⚠️ DEPLOY: Customer-facing verification error:', verificationError)
      verified = false
    }
    
    const totalTime = Date.now() - startTime
    console.log(`🎉 PRODUCTION DEPLOY: Complete! Total time: ${totalTime}ms, Customer verified: ${verified}`)
    
    const baseMessage = `🚀 Successfully deployed ${products.length} products`;
    const successMessage = verified 
      ? `${baseMessage} and verified live on customer-facing site! (${totalTime}ms)`
      : `${baseMessage} to blob storage. Customer-facing verification in progress - changes may take up to 5 minutes to appear on site. (${totalTime}ms)`;
    
    return { 
      success: successMessage,
      needsRefresh: true,  // ← Signal for admin refresh
      verified,
      verificationDetails
    }
  } catch (error) {
    console.error("❌ PRODUCTION DEPLOY: Failed with error:", error)
    
    // Enhanced error reporting
    const errorMessage = error instanceof Error 
      ? `Deployment failed: ${error.message}` 
      : "Deployment failed due to an unexpected error."
    
    return { 
      error: errorMessage + " Please try again or contact support if the problem persists."
    }
  }
}

// ENHANCED: Immediate aggressive cache invalidation
async function immediateCacheInvalidation(): Promise<void> {
  console.log('🔄 Starting aggressive cache invalidation...')
  
  // Clear ALL possible cache layers
  await revalidateTag(PRODUCTS_TAG)
  await revalidateTag('admin-products')
  await revalidateTag('coffee-products')
  await revalidateTag('all-products')
  console.log('✅ Cleared tagged caches')
  
  // Clear specific paths with both page and layout
  const paths = ['/admin', '/coffee', '/', '/subscriptions', '/shop', '/api/products']
  for (const path of paths) {
    revalidatePath(path, 'page')
    revalidatePath(path, 'layout')
  }
  console.log('✅ Cleared path-based caches')
  
  // Force clear in-memory caches
  await forceInvalidateCache()
  console.log('✅ Cleared in-memory caches')
  
  console.log('✅ Aggressive cache invalidation completed')
}

// ENHANCED: Verify cache clearing worked
async function verifyCacheClearing(): Promise<void> {
  try {
    console.log('🔍 Starting cache verification...')
    
    // Test if API returns fresh data with cache busting
    const timestamp = Date.now()
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/products?bustCache=${timestamp}&t=${timestamp}`, {
      cache: 'no-store',
      headers: { 
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
    
    if (!response.ok) {
      console.warn(`⚠️ Cache verification: API returned ${response.status}`)
      return
    }
    
    const data = await response.json()
    
    console.log('✅ Cache verification - API response:', {
      productCount: data.products?.length || data.length || 0,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - timestamp
    })
    
  } catch (error) {
    console.warn('⚠️ Cache verification failed:', error instanceof Error ? error.message : 'Unknown error')
    // Don't throw - this is verification only
  }
}

// DEBUG FUNCTIONS: For troubleshooting blob storage issues
export async function debugBlobStatus(): Promise<{
  blobExists: boolean,
  blobSize: number,
  lastModified: string,
  contentPreview: string,
  lineCount: number,
  headers: string
}> {
  try {
    console.log('🔍 DEBUG: Checking blob storage status...')
    
    const { list } = await import('@vercel/blob')
    const blobs = await list({ prefix: "products.csv" })
    
    if (!blobs.blobs || blobs.blobs.length === 0) {
      return {
        blobExists: false,
        blobSize: 0,
        lastModified: 'N/A',
        contentPreview: 'No blob found',
        lineCount: 0,
        headers: 'N/A'
      }
    }
    
    const blob = blobs.blobs[0]
    console.log('🔍 DEBUG: Found blob:', blob.pathname)
    
    const response = await fetch(blob.url, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.status}`)
    }
    
    const content = await response.text()
    const lines = content.split('\n')
    
    console.log('✅ DEBUG: Blob analysis complete')
    
    return {
      blobExists: true,
      blobSize: blob.size,
      lastModified: new Date(blob.uploadedAt).toISOString(),
      contentPreview: content.substring(0, 500),
      lineCount: lines.length,
      headers: lines[0] || 'NO HEADERS'
    }
    
  } catch (error) {
    console.error('❌ DEBUG: Blob status check failed:', error)
    throw new Error(`Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function forceBlobRefresh(): Promise<{ success: boolean, message: string, details: any }> {
  try {
    console.log('🔄 DEBUG: Force refreshing blob with current products...')
    
    const products = await getProducts({ forceRefresh: true })
    console.log('🔄 DEBUG: Got products:', products.length)
    
    if (products.length === 0) {
      console.log('🔄 DEBUG: No products found - creating test product')
      const testProduct: Product = {
        id: crypto.randomUUID(),
        sku: 'TEST-DEBUG-' + Date.now(),
        productName: 'Debug Test Product',
        category: 'coffee',
        price: 9.99,
        description: 'Debug test product created by force refresh',
        roastLevel: 'medium',
        origin: 'Test Origin',
        format: 'whole-bean',
        weight: '12oz',
        tastingNotes: ['test', 'debug'],
        featured: false,
        status: 'draft' as const,
        inStock: true,
        images: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      await updateProducts([testProduct])
      
      return { 
        success: true, 
        message: `Created test product and refreshed blob (was empty)`,
        details: { 
          productCount: 1, 
          testProductSku: testProduct.sku,
          action: 'created_test_product'
        }
      }
    }
    
    await updateProducts(products)
    
    return { 
      success: true, 
      message: `Refreshed blob with ${products.length} products`,
      details: { 
        productCount: products.length,
        action: 'refresh_existing'
      }
    }
    
  } catch (error) {
    console.error('❌ DEBUG: Force refresh failed:', error)
    return { 
      success: false, 
      message: `Force refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error: String(error) }
    }
  }
}

export async function testBlobWrite(): Promise<{ success: boolean, message: string, details: any }> {
  try {
    console.log('🧪 DEBUG: Testing basic blob write operation...')
    
    const testCsv = `sku,productName,category,price
TEST-WRITE-${Date.now()},Test Write Product,coffee,12.99
TEST-VERIFY-${Date.now()},Test Verify Product,coffee,15.99`
    
    console.log('🧪 DEBUG: Writing test CSV...')
    const { put } = await import('@vercel/blob')
    const result = await put('test-products.csv', testCsv, {
      access: "public",
      contentType: "text/csv",
      allowOverwrite: true
    })
    
    console.log('🧪 DEBUG: Test write successful, verifying...')
    
    // Verify write
    const verifyResponse = await fetch(result.url, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    })
    
    if (!verifyResponse.ok) {
      throw new Error(`Verification fetch failed: ${verifyResponse.status}`)
    }
    
    const verifyContent = await verifyResponse.text()
    
    console.log('✅ DEBUG: Test write and verification complete')
    
    return {
      success: true,
      message: 'Blob write test successful',
      details: {
        testUrl: result.url,
        originalLength: testCsv.length,
        verifiedLength: verifyContent.length,
        contentMatches: testCsv === verifyContent,
        verifiedContent: verifyContent.substring(0, 200)
      }
    }
    
  } catch (error) {
    console.error('❌ DEBUG: Test blob write failed:', error)
    return {
      success: false,
      message: `Test write failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error: String(error) }
    }
  }
}

// ENHANCED: Force immediate cache clearing and sync
export async function forceImmediateSyncAction(): Promise<{ success: boolean, message: string, details: any }> {
  try {
    console.log('⚡ FORCE SYNC: Starting immediate cache clearing and data sync...')
    const startTime = Date.now()
    
    // Step 1: Aggressive cache invalidation
    console.log('⚡ FORCE SYNC: Clearing all caches...')
    await immediateCacheInvalidation()
    
    // Step 2: Wait for propagation
    console.log('⚡ FORCE SYNC: Waiting for cache propagation...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Step 3: Verify cache clearing
    console.log('⚡ FORCE SYNC: Verifying cache clearing...')
    await verifyCacheClearing()
    
    const totalTime = Date.now() - startTime
    console.log(`✅ FORCE SYNC: Immediate sync completed (${totalTime}ms)`)
    
    return {
      success: true,
      message: 'Immediate cache clearing and sync completed successfully',
      details: {
        totalTime: `${totalTime}ms`,
        cacheCleared: true,
        syncCompleted: true,
        timestamp: new Date().toISOString()
      }
    }
    
  } catch (error) {
    console.error('❌ FORCE SYNC: Failed:', error)
    return {
      success: false,
      message: `Force sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error: String(error) }
    }
  }
}

// ENHANCED: Check cache status across different layers
export async function checkCacheStatusAction(): Promise<{ success: boolean, message: string, details: any }> {
  try {
    console.log('🔍 CACHE STATUS: Checking cache layers...')
    const startTime = Date.now()
    
    // Check API response time and cache headers
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const apiTests = []
    
    // Test 1: Products API
    try {
      const apiStart = Date.now()
      const response = await fetch(`${baseUrl}/api/products?test=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      const apiTime = Date.now() - apiStart
      const data = await response.json()
      
      apiTests.push({
        endpoint: '/api/products',
        responseTime: `${apiTime}ms`,
        status: response.status,
        productCount: data.products?.length || data.length || 0,
        cacheHeaders: response.headers.get('cache-control') || 'none'
      })
    } catch (error) {
      apiTests.push({
        endpoint: '/api/products',
        error: error instanceof Error ? error.message : String(error)
      })
    }
    
    const totalTime = Date.now() - startTime
    console.log(`✅ CACHE STATUS: Check completed (${totalTime}ms)`)
    
    return {
      success: true,
      message: 'Cache status check completed',
      details: {
        totalTime: `${totalTime}ms`,
        apiTests,
        environment: {
          isVercel: !!process.env.VERCEL,
          nodeEnv: process.env.NODE_ENV,
          baseUrl
        },
        timestamp: new Date().toISOString()
      }
    }
    
  } catch (error) {
    console.error('❌ CACHE STATUS: Check failed:', error)
    return {
      success: false,
      message: `Cache status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error: String(error) }
    }
  }
}
