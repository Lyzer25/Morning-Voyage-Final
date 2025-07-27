"use server"

import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"
import Papa from "papaparse"
import { getProducts, updateProducts, addProduct, updateProduct, deleteProduct } from "@/lib/csv-data"
import type { Product } from "@/lib/types"
import { transformHeader } from "@/lib/csv-helpers"

// Helper function to trigger cache revalidation after product changes - Vercel optimized
async function triggerCacheRevalidation() {
  try {
    console.log("🔄 Triggering cache revalidation after product update...")
    
    // Revalidate Next.js paths (this is sufficient for Vercel)
    const pathsToRevalidate = ["/", "/coffee", "/shop", "/admin"]
    
    for (const path of pathsToRevalidate) {
      revalidatePath(path, "page")
      console.log(`✅ Revalidated path: ${path}`)
    }
    
    // Also revalidate layout-level cache
    revalidatePath("/", "layout")
    revalidatePath("/coffee", "layout")
    
    // Note: Removed problematic API fetch call that was causing URL errors
    // Next.js revalidatePath() is sufficient for cache clearing in Vercel
    
    if (process.env.VERCEL) {
      console.log("🔍 Vercel environment detected - revalidation should be immediate")
    }
    
    console.log("✅ Cache revalidation completed successfully")
    
  } catch (error) {
    console.error("❌ Error during cache revalidation:", error)
    // Don't throw - we still want the main operation to succeed
  }
}

const BLOB_FILENAME = "products.csv"

interface FormState {
  error?: string
  success?: string
}

export async function uploadCsvAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const file = formData.get("csvFile") as File

  console.log('🔧 ========== ADMIN CSV UPLOAD DEBUG START ==========');
  console.log('🔧 ADMIN: CSV upload initiated');
  console.log('🔧 ADMIN: File details:', {
    name: file?.name,
    size: file?.size,
    type: file?.type
  });

  if (!file || file.size === 0) {
    return { error: "Please select a CSV file to upload." }
  }
  if (file.type !== "text/csv") {
    return { error: "Invalid file type. Please upload a CSV file." }
  }

  try {
    console.log('🔧 ADMIN: Reading file content...');
    const csvText = await file.text()
    console.log('🔧 ADMIN: File content received:', {
      length: csvText.length,
      firstLine: csvText.split('\n')[0] || 'EMPTY',
      preview: csvText.substring(0, 300)
    });

    console.log('🔧 ADMIN: Parsing CSV with Papa Parse...');
    const parsed = Papa.parse<Product>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: transformHeader,
    })

    console.log('🔧 ADMIN: Parse results:', {
      dataRows: parsed.data?.length || 0,
      errors: parsed.errors?.length || 0,
      headers: parsed.meta?.fields || []
    });

    if (parsed.errors.length > 0) {
      console.error('🔧 ADMIN: Parse errors:', parsed.errors);
      return { error: `CSV parsing error on row ${parsed.errors[0].row}: ${parsed.errors[0].message}` }
    }

    if (!parsed.meta.fields?.includes("sku") || !parsed.meta.fields?.includes("productName")) {
      console.error('🔧 ADMIN: Missing required columns');
      return { error: "CSV must contain 'sku' and 'productName' columns." }
    }

    console.log('🔧 ADMIN: Processing data with enhanced format handling...');
    
    // Import the enhanced processing function
    const { processCSVData } = await import("@/lib/csv-helpers");
    const processedData = processCSVData(parsed.data);

    console.log('🔧 ADMIN: Processed data sample:', processedData.slice(0, 2));
    console.log('🔧 ADMIN: Categories in processed data:', 
      [...new Set(processedData.map(p => p.category).filter(Boolean))]
    );
    console.log('🔧 ADMIN: Data types check:', {
      firstProductPrice: typeof processedData[0]?.price,
      firstProductFeatured: typeof processedData[0]?.featured,
      sampleProduct: processedData[0]
    });

    const standardizedCsvText = Papa.unparse(processedData, { header: true })
    console.log('🔧 ADMIN: Generated CSV text:', {
      length: standardizedCsvText.length,
      preview: standardizedCsvText.substring(0, 300)
    });

    console.log('🔧 ADMIN: Saving to blob storage...');
    console.log('🔧 ADMIN: Target filename:', BLOB_FILENAME);
    console.log('🔧 ADMIN: Environment check:', {
      hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL
    });

    await put(BLOB_FILENAME, standardizedCsvText, { 
      access: "public", 
      contentType: "text/csv",
      allowOverwrite: true
    })
    console.log('🔧 ADMIN: Successfully saved to blob storage!');

    // Trigger comprehensive cache revalidation
    console.log('🔧 ADMIN: Triggering cache revalidation...');
    await triggerCacheRevalidation()
    
    console.log(`🔧 ADMIN: Upload complete - ${processedData.length} products saved to ${BLOB_FILENAME}`);
    console.log('🔧 ========== ADMIN CSV UPLOAD DEBUG END ==========');
    
    return { success: `Successfully uploaded and updated ${processedData.length} products! Changes will appear on the live site shortly.` }
  } catch (error) {
    console.error("🔧 ADMIN: Error in uploadCsvAction:", error)
    if (error instanceof Error) {
      console.error('🔧 ADMIN: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return { error: "An unexpected error occurred during upload." }
  }
}

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

  return {
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
    tastingNotes: formData.get("tastingNotes") as string,
    featured: formData.get("featured") === "on",
    badge: formData.get("badge") as string,
  }
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

    await updateProducts(filteredProducts)
    await triggerCacheRevalidation()
    
    const deletedCount = products.length - filteredProducts.length
    return { success: `Successfully deleted ${deletedCount} product${deletedCount === 1 ? '' : 's'}. Changes will appear on the live site shortly.` }
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
