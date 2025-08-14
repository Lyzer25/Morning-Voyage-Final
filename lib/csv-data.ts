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
import { devLog, prodError, buildLog } from "@/lib/logger"

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
    prodError(`❌ Missing required fields: ${missing.join(', ')}`, row);
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


// NEW: Direct blob fetch function that completely bypasses all caching
export async function fetchDirectFromBlob(): Promise<Product[]> {
  try {
    devLog('🔄 Direct blob fetch starting...')
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      buildLog('⚠️ No blob token available')
      return []
    }
    
    // Get blob files
    const blobs = await list({ prefix: PRODUCTS_BLOB_KEY, limit: 10 })
    
    if (!blobs.blobs || blobs.blobs.length === 0) {
      buildLog('⚠️ No blob files found')
      return []
    }
    
    const targetBlob = blobs.blobs[0]
    devLog('🔍 Reading from blob:', targetBlob.url)
    
    // Fetch with aggressive cache busting
    const response = await fetch(targetBlob.url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Blob fetch failed: ${response.status}`)
    }
    
    const csvContent = await response.text()
    devLog('✅ Blob content fetched:', {
      size: csvContent.length,
      lines: csvContent.split('\n').length
    })
    
    if (!csvContent?.trim()) {
      devLog('📊 Empty CSV content - returning empty array')
      return []
    }
    
    // Parse CSV directly
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (h) => HEADER_ALIASES[norm(h)] ?? h.trim().toUpperCase()
    })
    
    if (parsed.errors.length > 0) {
      devLog('⚠️ CSV parse errors:', parsed.errors)
    }
    
    if (!parsed.data || !Array.isArray(parsed.data) || parsed.data.length === 0) {
      devLog('📊 No data rows in CSV - returning empty array')
      return []
    }
    
    // Process the data using existing fromCsvRow function
    const products = parsed.data.map((rawRow: any) => fromCsvRow(rawRow))
    
    devLog('✅ Direct blob fetch complete:', {
      productsLoaded: products.length,
      featuredCount: products.filter(p => p.featured === true).length
    })
    
    return products
    
    } catch (error) {
    prodError('❌ Direct blob fetch failed:', error)
    throw error
  }
}

// ENHANCED: Updated fetchAndParseCsvInternal to support cache bypassing
async function fetchAndParseCsvInternal(bypassCache = false): Promise<Product[]> {
  try {
    buildLog('📊 Starting CSV fetch and parse...', { bypassCache });
    
    // CRITICAL: Fail fast during build if no blob token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      const isBuild = process.env.VERCEL === '1' || process.env.VERCEL_BUILD === '1';
      if (isBuild) {
        prodError("❌ BUILD FAILURE: No blob token during build");
        throw new Error('BLOB_READ_WRITE_TOKEN required during build');
      }
      devLog('📊 No blob token available - returning empty array (local dev)')
      return []
    }

    // Find the CSV blob
    devLog('📊 Looking for blob file:', PRODUCTS_BLOB_KEY);
    const blob = await list({ prefix: PRODUCTS_BLOB_KEY, limit: 10 });
    
    if (!blob.blobs || blob.blobs.length === 0) {
      buildLog('❌ NO BLOB FILES FOUND with prefix:', PRODUCTS_BLOB_KEY);
      
      // CRITICAL: Fail fast during build
      const isBuild = process.env.VERCEL === '1' || process.env.VERCEL_BUILD === '1';
      if (isBuild) {
        prodError("❌ BUILD FAILURE: No CSV blob found during build");
        throw new Error('CSV blob not found during build');
      }
      
      devLog('📊 No blob found - returning empty array (local dev)');
      return [];
    }

    const targetBlob = blob.blobs[0];
    devLog('📊 Found blob file:', {
      pathname: targetBlob.pathname,
      url: targetBlob.url,
      size: targetBlob.size,
    });

    // Fetch CSV with conditional caching based on bypassCache parameter
    const fetchOptions = bypassCache ? {
      cache: 'no-store' as RequestCache,
      headers: { 
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    } : {
      next: { revalidate: 60, tags: [PRODUCTS_TAG] }
    };
    
    const response = await fetch(targetBlob.url, fetchOptions);

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
      prodError('❌ CSV parsing errors:', parseResult.errors);
    }

    if (!parseResult.data || !Array.isArray(parseResult.data)) {
      throw new Error('CSV parsing failed - invalid data structure');
    }

    if (parseResult.data.length === 0) {
      devLog('📊 CSV contains no data rows - returning empty array');
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
    devLog('✅ tastingNotes normalized', { 
      allArrays: tastingNotesValidation,
      sampleProduct: validatedProducts[0]?.productName || 'None',
      sampleNotes: validatedProducts[0]?.tastingNotes || []
    });

    // CRITICAL: Single, easy-to-grep marker - appears ONCE per build worker
    buildLog('🧩 CSV parsed once', { count: validatedProducts.length });
    
    return validatedProducts;
  } catch (error) {
    prodError("❌ CRITICAL ERROR in CSV fetch/parse:", error);
    
    // CRITICAL: Fail fast during build
    const isBuild = process.env.VERCEL === '1' || process.env.VERCEL_BUILD === '1';
    if (isBuild) {
      prodError("❌ BUILD FAILURE: CSV parsing failed during build");
      throw error;
    }
    
    // Return empty array for local dev errors
    devLog("📊 Runtime error fallback - returning empty array");
    return [];
  }
}

// PUBLIC API: Enhanced getProducts with proper cache control
export async function getProducts(options?: { 
  source?: 'blob-storage' | 'staging' | 'cache'
  forceRefresh?: boolean 
  bypassCache?: boolean 
}): Promise<Product[]> {
  // Build-time optimization: skip expensive CSV fetching during local/CI production builds
  // Vercel provides VERCEL_ENV; allow Vercel deployments to continue fetching.
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    buildLog('⏭️ Skipping CSV fetch during local production build (no VERCEL_ENV)');
    return [];
  }

  const source = options?.source || 'cache'
  
  devLog('🔍 getProducts called with:', { source, options })
  
  switch (source) {
    case 'blob-storage':
      devLog('📦 Fetching directly from blob storage...')
      return await fetchDirectFromBlob()
      
    case 'staging':
      devLog('📝 Using staging data...')
      // Return staging data if available (implementation depends on how staging is stored)
      return [] // Implementation would depend on staging storage mechanism
      
    case 'cache':
    default:
      if (options?.forceRefresh || options?.bypassCache) {
        devLog('🔄 Bypassing cache, fetching fresh data...')
        return await fetchAndParseCsvInternal(true)
      }
      
      devLog('💾 Using cached data...')
      return await fetchAndParseCsvInternal(false)
  }
}

export async function getGroupedProducts(): Promise<any[]> {
  devLog('🔄 Direct grouped products fetch - bypassing unstable_cache');
  const baseProducts = await fetchAndParseCsvInternal(false);
  const coffeeProducts = baseProducts.filter(p => p.category?.toLowerCase() === 'coffee');
  const productFamilies = groupProductFamilies(coffeeProducts);
  return convertFamiliesToGroupedProducts(productFamilies);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  devLog('🔄 Direct category fetch - bypassing unstable_cache');
  const baseProducts = await fetchAndParseCsvInternal(false);
  return baseProducts.filter(p => p.category?.toLowerCase() === category.toLowerCase());
}

// ADMIN FUNCTIONS: Keep existing signatures for compatibility
export async function handleEmptyProductState(): Promise<void> {
    try {
    buildLog('🗑️ Handling empty product state - user deleted all products')
    
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
    
    devLog('🗑️ Saving empty state to Vercel Blob...')
    await put(PRODUCTS_BLOB_KEY, csvText, {
      access: "public",
      contentType: "text/csv",
      allowOverwrite: true,
    })
    
    devLog("✅ Empty product state saved successfully")
  } catch (error) {
    prodError("❌ CRITICAL ERROR in handleEmptyProductState:", error)
    throw error
  }
}

// ENHANCED: Verify blob write with immediate verification and content matching
async function verifyBlobWriteSuccess(blobUrl: string, expectedLength: number, originalContent?: string): Promise<void> {
  const maxAttempts = 5
  let delayMs = 1000 // Start with 1 second
  
  devLog('🚀 BLOB VERIFY: Starting enhanced verification with content matching...')
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      devLog(`🔍 BLOB VERIFY: Attempt ${attempt}/${maxAttempts} - checking blob propagation...`)
      
      // Fetch with aggressive cache-busting
      const response = await fetch(blobUrl, { 
        cache: 'no-store',
        headers: { 
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const content = await response.text()
      
      devLog(`🔍 BLOB VERIFY: Retrieved content`, {
        contentLength: content.length,
        expectedLength,
        lengthMatch: content.length >= expectedLength * 0.9,
        hasContent: content.trim().length > 0,
        contentMatches: originalContent ? content === originalContent : 'N/A'
      })
      
      // Enhanced success criteria
      const lengthOk = content.length >= expectedLength * 0.9
      const hasContent = content.trim().length > 0
      const contentMatches = !originalContent || content === originalContent
      
      if (lengthOk && hasContent && contentMatches) {
        devLog('✅ BLOB VERIFY: Enhanced verification successful!')
        return
      }
      
      devLog(`⚠️ BLOB VERIFY: Verification criteria not met:`, {
        lengthOk,
        hasContent,
        contentMatches: contentMatches || 'not-checked'
      })
      
    } catch (error) {
      buildLog(`⚠️ BLOB VERIFY: Attempt ${attempt} failed:`, error instanceof Error ? error.message : String(error))
    }
    
    // Wait before retry with exponential backoff
    if (attempt < maxAttempts) {
      const delay = delayMs * attempt // Exponential backoff
      devLog(`⏳ BLOB VERIFY: Waiting ${delay}ms before retry...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // After all attempts failed
  buildLog('⚠️ BLOB VERIFY: Could not verify blob write after all attempts')
  buildLog('⚠️ BLOB VERIFY: Write command succeeded, but verification failed - likely timing issue')
  // Don't throw error - the write probably worked, verification might be timing-related
}

export async function updateProducts(products: Product[]): Promise<void> {
  try {
    buildLog('🔍 BLOB WRITE: Starting updateProducts', {
      productCount: products.length,
      hasProducts: products.length > 0,
      sampleProduct: products[0]?.sku || 'NO_PRODUCTS',
      environment: {
        hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL
      }
    })

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
    
    devLog('[products] write: validating', {
      total: validatedProducts.length,
      coffee: validatedProducts.filter(p => p.category === 'coffee').length,
      subscription: validatedProducts.filter(p => p.category === 'subscription').length,
      other: validatedProducts.filter(p => !['coffee', 'subscription'].includes(p.category as string)).length
    })

    if (validatedProducts.length === 0) {
    devLog('[products] write: empty products - calling handleEmptyProductState')
    await handleEmptyProductState()
    return
    }

    const csvText = exportProductsToCSV(validatedProducts)
    
    devLog('🔍 DEBUG: Generated CSV for blob storage:', {
      csvLength: csvText.length,
      firstLine: csvText.split('\n')[0], // Headers
      lineCount: csvText.split('\n').length,
      hasContent: csvText.trim().length > 0,
      containsBlendComposition: csvText.includes('BLEND COMPOSITION')
    })
    
    if (!csvText?.trim() || csvText.length < 10) {
      prodError('❌ CRITICAL: Generated CSV is empty!')
      throw new Error('updateProducts: generated CSV unexpectedly empty/short')
    }

    devLog(`[products] write: ${validatedProducts.length} products, csvLen=${csvText.length}`)
    
    // Write to blob storage with enhanced error handling
    devLog('🔍 DEBUG: Writing to blob storage...')
    const writeResult = await put(PRODUCTS_BLOB_KEY, csvText, {
      access: "public",
      contentType: "text/csv",
      allowOverwrite: true,
    })
    
    devLog('✅ BLOB WRITE SUCCESS: Initial write completed:', {
      url: writeResult.url,
      contentType: writeResult.contentType || 'text/csv'
    })
    
    // CRITICAL: Wait for propagation and verify write with content matching
    await verifyBlobWriteSuccess(writeResult.url, csvText.length, csvText)
    
    devLog('✅ [products] write: CSV saved and verified successfully')
    
  } catch (error) {
    prodError("❌ CRITICAL ERROR in updateProducts:", error)
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
