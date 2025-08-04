"use server"

import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"
import Papa from "papaparse"
import { getProducts, updateProducts, addProduct, updateProduct, deleteProduct } from "@/lib/csv-data"
import type { Product } from "@/lib/types"
import { transformHeader } from "@/lib/csv-helpers"
import { forceInvalidateCache } from "@/lib/product-cache"

// ENHANCED: Aggressive cache clearing for all layers
async function triggerCacheRevalidation() {
  try {
    console.log("🔄 ENHANCED: Triggering aggressive cache revalidation after product update...")
    
    // CRITICAL: Force invalidate ALL cache layers immediately
    forceInvalidateCache()
    
    // Revalidate all customer-facing pages (ISR cache)
    const pathsToRevalidate = ["/", "/coffee", "/subscriptions", "/shop", "/admin"]
    
    for (const path of pathsToRevalidate) {
      revalidatePath(path, "page")
      console.log(`✅ Revalidated ISR page: ${path}`)
    }
    
    // Also revalidate layout-level cache
    revalidatePath("/", "layout")
    revalidatePath("/coffee", "layout")
    revalidatePath("/subscriptions", "layout")
    console.log("✅ Revalidated layout caches")
    
    // ENHANCED: Add small delay to allow revalidation to propagate
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (process.env.VERCEL) {
      console.log("🔍 Vercel environment detected - enhanced revalidation completed")
    }
    
    console.log("✅ ENHANCED: All cache layers cleared successfully")
    
  } catch (error) {
    console.error("❌ Error during enhanced cache revalidation:", error)
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
    const products = await getProducts()
    if (products.length === 0) {
      return { error: "No products to export." }
    }
    const csv = Papa.unparse(products)
    return { csv }
  } catch (error) {
    console.error("Error exporting CSV:", error)
    return { error: "Failed to export products." }
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
    tastingNotes: (formData.get("tastingNotes") as string)?.split(',').map(s => s.trim()) || [],
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

// ENHANCED: Save all staged changes to production with comprehensive progress feedback
export async function saveToProductionAction(products: Product[]): Promise<FormState> {
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
    
    // Stage 1: Atomic blob storage write
    console.log('💾 DEPLOY: Writing to Blob storage...')
    const startTime = Date.now()
    await updateProducts(products)
    const blobTime = Date.now() - startTime
    console.log(`✅ DEPLOY: Blob storage updated successfully (${blobTime}ms)`)
    
    // Stage 2: Enhanced cache revalidation with timeout protection
    console.log('🔄 DEPLOY: Triggering comprehensive cache revalidation...')
    const revalidationStart = Date.now()
    
    await Promise.race([
      triggerCacheRevalidation(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Cache revalidation timeout after 10 seconds')), 10000)
      )
    ]).catch(error => {
      console.warn('⚠️ DEPLOY: Cache revalidation warning (continuing deployment):', error)
      // Don't fail entire deployment for cache issues - this is non-critical
    })
    
    const revalidationTime = Date.now() - revalidationStart
    console.log(`🔄 DEPLOY: Cache revalidation completed (${revalidationTime}ms)`)
    
    const totalTime = Date.now() - startTime
    console.log(`🎉 PRODUCTION DEPLOY: Complete! Total time: ${totalTime}ms`)
    
    return { 
      success: `🚀 Successfully deployed ${products.length} products to live site! Changes are now visible to customers. (${totalTime}ms)` 
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
