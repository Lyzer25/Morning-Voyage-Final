import { put, list } from "@vercel/blob"
import Papa from "papaparse"
import { unstable_cache } from "next/cache"
import type { Product } from "@/lib/types"
import { 
  transformHeader, 
  exportProductsToCSV, 
  HEADER_ALIASES,
  normalizeCategory,
  normalizeFormat,
  normalizeWeight,
  normalizeBool,
  normalizeMoney,
  normalizeTastingNotes,
  normalizeRoastLevel,
  processMultipleOrigins,
  norm
} from "@/lib/csv-helpers"
import { groupProductFamilies, convertFamiliesToGroupedProducts } from "@/lib/family-grouping"

// CRITICAL: Centralized blob key for consistency
export const PRODUCTS_BLOB_KEY = "products.csv"

// TAG-BASED ISR: Centralized cache tag for coordinated revalidation
export const PRODUCTS_TAG = 'products'

// ENHANCED: Convert CSV row to normalized Product using all value normalizers
export function fromCsvRow(row: Record<string, any>): Product {
  // CRITICAL: Validate required fields only - warn for missing optional
  const requiredFields = ['SKU', 'PRODUCTNAME', 'CATEGORY', 'PRICE'];
  const missing = requiredFields.filter(field => !row[field]);
  if (missing.length > 0) {
    console.error(`❌ Missing required fields: ${missing.join(', ')}`, row);
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  const price = normalizeMoney(row["PRICE"]);
  
  const product: Product = {
    id: crypto.randomUUID(),
    sku: row["SKU"]?.toString().trim() || '',
    productName: row["PRODUCTNAME"]?.toString().trim() || '',
    category: normalizeCategory(row["CATEGORY"]),
    price: price,
    originalPrice: row["ORIGINAL PRICE"] ? normalizeMoney(row["ORIGINAL PRICE"]) : price,
    description: row["DESCRIPTION"]?.toString().trim() || '',
    roastLevel: normalizeRoastLevel(row["ROAST LEVEL"]),
    origin: processMultipleOrigins(row["ORIGIN"]),
    format: normalizeFormat(row["FORMAT"]),
    weight: normalizeWeight(row["WEIGHT"]),
    tastingNotes: normalizeTastingNotes(row["TASTING NOTES"]),
    blendComposition: row["BLEND COMPOSITION"]?.toString().trim() || undefined,
    featured: normalizeBool(row["FEATURED"]),
    shippingFirst: row["SHIPPINGFIRST"] ? normalizeMoney(row["SHIPPINGFIRST"]) : undefined,
    shippingAdditional: row["SHIPPINGADDITIONAL"] ? normalizeMoney(row["SHIPPINGADDITIONAL"]) : undefined,
    status: row["STATUS"]?.toString().toLowerCase() || "active",
    inStock: true,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  return product
}

// SINGLE-SHOT: Core CSV fetch and parse function (called once per build/runtime)
async function fetchAndParseCsvInternal(): Promise<Product[]> {
  try {
    console.log('📊 Starting single-shot CSV fetch and parse...');
    
    // CRITICAL: Fail fast during build if no blob token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      const isBuild = process.env.VERCEL === '1' || process.env.VERCEL_BUILD === '1';
      if (isBuild) {
        console.error("❌ BUILD FAILURE: No blob token during build");
        throw new Error('BLOB_READ_WRITE_TOKEN required during build');
      }
      console.log('📊 No blob token available - returning empty array (local dev)')
      return []
    }

    // Find the CSV blob
    console.log('📊 Looking for blob file:', PRODUCTS_BLOB_KEY);
    const blob = await list({ prefix: PRODUCTS_BLOB_KEY, limit: 10 });
    
    if (!blob.blobs || blob.blobs.length === 0) {
      console.log('❌ NO BLOB FILES FOUND with prefix:', PRODUCTS_BLOB_KEY);
      
      // CRITICAL: Fail fast during build
      const isBuild = process.env.VERCEL === '1' || process.env.VERCEL_BUILD === '1';
      if (isBuild) {
        console.error("❌ BUILD FAILURE: No CSV blob found during build");
        throw new Error('CSV blob not found during build');
      }
      
      console.log('📊 No blob found - returning empty array (local dev)');
      return [];
    }

    const targetBlob = blob.blobs[0];
    console.log('📊 Found blob file:', {
      pathname: targetBlob.pathname,
      url: targetBlob.url,
      size: targetBlob.size,
    });

    // Fetch CSV with proper caching
    const response = await fetch(targetBlob.url, {
      next: { revalidate: 3600, tags: [PRODUCTS_TAG] }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    
    if (!csvText || csvText.trim().length === 0) {
      console.log('📊 Empty CSV file - returning empty array');
      return [];
    }

    // Parse CSV
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (h) => HEADER_ALIASES[norm(h)] ?? h.trim().toUpperCase()
    });

    if (parseResult.errors && parseResult.errors.length > 0) {
      console.error('❌ CSV parsing errors:', parseResult.errors);
    }

    if (!parseResult.data || !Array.isArray(parseResult.data)) {
      throw new Error('CSV parsing failed - invalid data structure');
    }

    if (parseResult.data.length === 0) {
      console.log('📊 CSV contains no data rows - returning empty array');
      return [];
    }

    // Process rows to Product objects
    const processedProducts = parseResult.data.map((rawRow: any) => fromCsvRow(rawRow));

    // CRITICAL: Second-pass validation for tastingNotes normalization
    const validatedProducts = processedProducts.map(p => ({
      ...p,
      tastingNotes: normalizeTastingNotes(p.tastingNotes)
    }));

    // VALIDATION: Verify all tastingNotes are arrays
    const tastingNotesValidation = validatedProducts.every(p => Array.isArray(p.tastingNotes));
    console.log('✅ tastingNotes normalized', { 
      allArrays: tastingNotesValidation,
      sampleProduct: validatedProducts[0]?.productName || 'None',
      sampleNotes: validatedProducts[0]?.tastingNotes || []
    });

    // CRITICAL: Single, easy-to-grep marker - appears ONCE per build worker
    console.log('🧩 CSV parsed once', { count: validatedProducts.length });
    
    return validatedProducts;
  } catch (error) {
    console.error("❌ CRITICAL ERROR in CSV fetch/parse:", error);
    
    // CRITICAL: Fail fast during build
    const isBuild = process.env.VERCEL === '1' || process.env.VERCEL_BUILD === '1';
    if (isBuild) {
      console.error("❌ BUILD FAILURE: CSV parsing failed during build");
      throw error;
    }
    
    // Return empty array for local dev errors
    console.log("📊 Runtime error fallback - returning empty array");
    return [];
  }
}

// PUBLIC API: Direct blob fetching with ISR instead of unstable_cache
export async function getProducts(): Promise<Product[]> {
  console.log('🔄 Direct blob fetch - bypassing unstable_cache');
  return fetchAndParseCsvInternal();
}

export async function getGroupedProducts(): Promise<any[]> {
  console.log('🔄 Direct grouped products fetch - bypassing unstable_cache');
  const baseProducts = await fetchAndParseCsvInternal();
  const coffeeProducts = baseProducts.filter(p => p.category?.toLowerCase() === 'coffee');
  const productFamilies = groupProductFamilies(coffeeProducts);
  return convertFamiliesToGroupedProducts(productFamilies);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  console.log('🔄 Direct category fetch - bypassing unstable_cache');
  const baseProducts = await fetchAndParseCsvInternal();
  return baseProducts.filter(p => p.category?.toLowerCase() === category.toLowerCase());
}

// ADMIN FUNCTIONS: Keep existing signatures for compatibility
export async function handleEmptyProductState(): Promise<void> {
  try {
    console.log('🗑️ Handling empty product state - user deleted all products')
    
    const emptyProductTemplate: Partial<Product> = {
      sku: '',
      productName: '',
      category: '',
      status: 'active',
      price: 0,
      description: '',
      roastLevel: '',
      origin: '',
      weight: '',
      format: '',
      tastingNotes: [],
      featured: false,
    }
    
    const csvText = Papa.unparse([emptyProductTemplate], { header: true }).split('\n')[0] + '\n'
    
    console.log('🗑️ Saving empty state to Vercel Blob...')
    await put(PRODUCTS_BLOB_KEY, csvText, {
      access: "public",
      contentType: "text/csv",
      allowOverwrite: true,
    })
    
    console.log("✅ Empty product state saved successfully")
  } catch (error) {
    console.error("❌ CRITICAL ERROR in handleEmptyProductState:", error)
    throw error
  }
}

export async function updateProducts(products: Product[]): Promise<void> {
  try {
    if (!Array.isArray(products)) {
      throw new Error('updateProducts: products must be an array')
    }

    // Category-specific validation
    const validatedProducts = products.map(product => {
      if (product.category === 'coffee') {
        if (!product.roastLevel) {
          console.warn(`⚠️ Coffee product ${product.sku} missing roast level - defaulting to medium`)
          product.roastLevel = 'medium'
        }
      }
      
      if (product.category === 'subscription') {
        if (!product.subscriptionInterval) {
          console.warn(`⚠️ Subscription product ${product.sku} missing interval - defaulting to monthly`)
          product.subscriptionInterval = 'monthly'
        }
      }
      
      return product
    })
    
    console.log('[products] write: validating', {
      total: validatedProducts.length,
      coffee: validatedProducts.filter(p => p.category === 'coffee').length,
      subscription: validatedProducts.filter(p => p.category === 'subscription').length,
      other: validatedProducts.filter(p => !['coffee', 'subscription'].includes(p.category as string)).length
    })

    if (validatedProducts.length === 0) {
      console.log('[products] write: empty products - calling handleEmptyProductState')
      await handleEmptyProductState()
      return
    }

    const csvText = exportProductsToCSV(validatedProducts)
    
    if (!csvText?.trim() || csvText.length < 10) {
      throw new Error('updateProducts: generated CSV unexpectedly empty/short')
    }

    console.log(`[products] write: ${validatedProducts.length} products, csvLen=${csvText.length}`)
    
    await put(PRODUCTS_BLOB_KEY, csvText, {
      access: "public",
      contentType: "text/csv",
      allowOverwrite: true,
    })
    
    console.log('✅ [products] write: CSV saved successfully')
    
  } catch (error) {
    console.error("❌ CRITICAL ERROR in updateProducts:", error)
    throw error
  }
}

export async function addProduct(product: Product): Promise<void> {
  const products = await getProducts()
  products.push(product)
  await updateProducts(products)
}

export async function deleteProduct(sku: string): Promise<void> {
  let products = await getProducts()
  products = products.filter((p) => p.sku !== sku)
  await updateProducts(products)
}

export async function updateProduct(updatedProduct: Product): Promise<void> {
  const products = await getProducts()
  const index = products.findIndex((p) => p.sku === updatedProduct.sku)
  if (index !== -1) {
    products[index] = updatedProduct
    await updateProducts(products)
  } else {
    throw new Error("Product not found for update")
  }
}
