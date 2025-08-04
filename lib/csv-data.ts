import { put, list } from "@vercel/blob"
import Papa from "papaparse"
import type { Product } from "@/lib/types"
import { transformHeader } from "@/lib/csv-helpers"

const BLOB_FILENAME = "products.csv"

// In-memory cache to reduce blob storage reads
let productCache: Product[] | null = null
let lastFetchTime = 0
const CACHE_DURATION = 60 * 1000 // 1 minute

// Sample products for development when Vercel Blob is not configured
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'sample-1',
    sku: "COFFEE-MORNING-12OZ-WHOLE",
    productName: "Morning Blend",
    category: "coffee",
    status: "active",
    price: 16.99,
    description: "Our signature morning blend - smooth, balanced, and perfect for starting your day",
    roastLevel: "medium",
    origin: "Colombia & Brazil",
    weight: "12 oz",
    format: "whole-bean",
    tastingNotes: ["Chocolate", "Caramel", "Nuts"],
    featured: true,
    inStock: true,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sample-2',
    sku: "COFFEE-MORNING-12OZ-GROUND",
    productName: "Morning Blend",
    category: "coffee",
    status: "active",
    price: 16.99,
    description: "Our signature morning blend - smooth, balanced, and perfect for starting your day",
    roastLevel: "medium",
    origin: "Colombia & Brazil",
    weight: "12 oz",
    format: "ground",
    tastingNotes: ["Chocolate", "Caramel", "Nuts"],
    featured: true,
    inStock: true,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sample-3',
    sku: "COFFEE-DARK-12OZ-WHOLE",
    productName: "Dark Roast Supreme",
    category: "coffee",
    status: "active",
    price: 17.99,
    description: "Bold and intense dark roast with rich, smoky flavors",
    roastLevel: "dark",
    origin: "Guatemala",
    weight: "12 oz",
    format: "whole-bean",
    tastingNotes: ["Dark Chocolate", "Smoky", "Robust"],
    featured: true,
    inStock: true,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sample-4',
    sku: "COFFEE-LIGHT-12OZ-WHOLE",
    productName: "Ethiopian Single Origin",
    category: "coffee",
    status: "active",
    price: 19.99,
    description: "Bright and fruity single origin from Ethiopia",
    roastLevel: "light", 
    origin: "Ethiopia",
    weight: "12 oz",
    format: "whole-bean",
    tastingNotes: ["Blueberry", "Floral", "Citrus"],
    featured: false,
    inStock: true,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
]

async function fetchAndParseCsv(bustCache = false): Promise<Product[]> {
  try {
    console.log('📊 ========== CSV DATA FLOW DEBUG START ==========');
    console.log('📊 fetchAndParseCsv: Starting comprehensive trace...', { bustCache });
    console.log('📊 Environment check:', {
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN ? 'EXISTS' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      allBlobEnvKeys: Object.keys(process.env).filter(key => key.includes('BLOB'))
    });
    
    // CRITICAL FIX: Handle build-time vs runtime
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('📊 No blob token available - returning empty array (build time)')
      return []
    }

    // CRITICAL FIX: Detect build-time and return empty array
    const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL
    if (isBuildTime) {
      console.log('📊 Build time detected - returning empty array')
      return []
    }

    console.log('📊 BLOB_READ_WRITE_TOKEN exists, proceeding to fetch...');
    console.log('📊 Looking for blob file with name:', BLOB_FILENAME);

    // First, check what blob files exist
    console.log('📊 Listing blobs with exact prefix:', BLOB_FILENAME);
    const blob = await list({ prefix: BLOB_FILENAME, limit: 10 });
    console.log('📊 Blob list result (exact prefix):', {
      blobCount: blob.blobs?.length || 0,
      blobs: blob.blobs?.map(b => ({ 
        url: b.url, 
        size: b.size, 
        uploadedAt: b.uploadedAt,
        pathname: b.pathname
      })) || []
    });

    // If no exact match, check for ANY blob files
    if (!blob.blobs || blob.blobs.length === 0) {
      console.log('❌ NO BLOB FILES FOUND with prefix:', BLOB_FILENAME);
      console.log('📊 Checking for ANY blob files in storage...');
      
      const allBlobs = await list({ limit: 20 });
      console.log('📊 ALL blob files found:', {
        totalCount: allBlobs.blobs?.length || 0,
        files: allBlobs.blobs?.map(b => ({
          pathname: b.pathname,
          url: b.url,
          size: b.size,
          uploadedAt: b.uploadedAt
        })) || []
      });
      
      if (allBlobs.blobs && allBlobs.blobs.length > 0) {
        console.log('❌ ISSUE FOUND: Blob files exist but not with expected name!');
        console.log('📊 Expected filename:', BLOB_FILENAME);
        console.log('📊 Actual filenames:', allBlobs.blobs.map(b => b.pathname));
      } else {
        console.log('❌ ISSUE FOUND: No blob files exist at all in storage!');
      }
      
      console.log('📊 Falling back to sample products');
      return SAMPLE_PRODUCTS;
    }

    const targetBlob = blob.blobs[0];
    console.log('📊 Found target blob file:', {
      pathname: targetBlob.pathname,
      url: targetBlob.url,
      size: targetBlob.size,
      uploadedAt: targetBlob.uploadedAt
    });

    console.log('📊 Fetching CSV content from URL:', targetBlob.url);
    const response = await fetch(targetBlob.url, { cache: "no-store" });
    console.log('📊 Fetch response details:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch CSV file:', response.status, response.statusText);
      console.log('📊 Falling back to sample products');
      return SAMPLE_PRODUCTS;
    }

    const csvText = await response.text();
    console.log('📊 CSV file contents analysis:', {
      totalLength: csvText.length,
      firstLine: csvText.split('\n')[0] || 'EMPTY',
      lineCount: csvText.split('\n').length,
      isEmpty: csvText.trim().length === 0,
      preview: csvText.substring(0, 500)
    });

    if (!csvText || csvText.trim().length === 0) {
      console.error('❌ ISSUE FOUND: CSV file exists but is completely empty!');
      console.log('📊 File size was:', targetBlob.size);
      console.log('📊 Falling back to sample products');
      return SAMPLE_PRODUCTS;
    }

    console.log('📊 Starting Papa Parse with detailed tracking...');
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header) => {
        const transformed = transformHeader(header);
        console.log('📊 Header transformation:', `"${header}" → "${transformed}"`);
        return transformed;
      }
    });

    console.log('📊 Papa Parse complete:', {
      rowCount: parseResult.data?.length || 0,
      errorCount: parseResult.errors?.length || 0,
      metaFields: parseResult.meta?.fields || [],
      hasData: !!parseResult.data,
      isDataArray: Array.isArray(parseResult.data)
    });

    if (parseResult.errors && parseResult.errors.length > 0) {
      console.error('❌ CSV parsing errors found:', parseResult.errors);
      parseResult.errors.forEach((error, index) => {
        console.error(`Error ${index + 1}:`, {
          type: error.type,
          code: error.code,
          message: error.message,
          row: error.row
        });
      });
    }

    if (!parseResult.data || !Array.isArray(parseResult.data)) {
      console.error('❌ ISSUE FOUND: Papa Parse did not return valid data array!');
      console.error('Returned data type:', typeof parseResult.data);
      console.error('Returned data value:', parseResult.data);
      console.log('📊 Falling back to sample products');
      return SAMPLE_PRODUCTS;
    }

    if (parseResult.data.length === 0) {
      console.log('📊 CSV parsed successfully but contains 0 data rows - this may be intentional empty state');
      console.log('📊 Headers found:', parseResult.meta?.fields);
      console.log('📊 CSV content was:', csvText.substring(0, 200));
      
      // Check if this is intentional empty state (headers only) vs parsing issue
      const hasValidHeaders = parseResult.meta?.fields && parseResult.meta.fields.length > 0;
      
      if (hasValidHeaders && csvText.includes('sku') && csvText.includes('productName')) {
        console.log('📊 This appears to be intentional empty state (user deleted all products)');
        console.log('📊 Returning empty array to maintain empty state');
        return []; // Return empty array for intentional empty state
      } else {
        console.error('❌ ISSUE FOUND: CSV parsing failed - no valid headers or structure');
        console.log('📊 Falling back to sample products');
        return SAMPLE_PRODUCTS;
      }
    }

    console.log('📊 Raw parsed data sample:', parseResult.data.slice(0, 2));

    // Process and validate data
    const processedProducts = parseResult.data.map((rawProduct: any, index) => {
      const processed = {
        ...rawProduct,
        status: rawProduct.status || "active",
        price: typeof rawProduct.price === "number" ? rawProduct.price : 0,
      };
      
      // Log first few products for debugging
      if (index < 3) {
        console.log(`📊 Processed Product ${index + 1}:`, {
          sku: processed.sku,
          productName: processed.productName,
          category: processed.category,
          price: processed.price,
          status: processed.status,
          allFields: Object.keys(processed)
        });
      }
      
      return processed;
    });

    const categoriesFound = [...new Set(processedProducts.map(p => p.category).filter(Boolean))];
    console.log('📊 Categories found in processed data:', categoriesFound);
    console.log('📊 Products by category:', 
      categoriesFound.map(cat => ({
        category: cat,
        count: processedProducts.filter(p => p.category === cat).length
      }))
    );

    console.log(`✅ SUCCESS: Parsed and processed ${processedProducts.length} products from CSV`);
    console.log('📊 ========== CSV DATA FLOW DEBUG END ==========');
    
    return processedProducts;
  } catch (error) {
    console.error("❌ CRITICAL ERROR in fetchAndParseCsv:", error);
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    console.log("📊 Emergency fallback to sample products");
    console.log('📊 Sample products count:', SAMPLE_PRODUCTS.length);
    console.log('📊 Sample products categories:', SAMPLE_PRODUCTS.map(p => p.category));
    return SAMPLE_PRODUCTS;
  }
}

// ENHANCED: getProducts with cache-busting for verification
export async function getProducts(bustCache = false): Promise<Product[]> {
  try {
    console.log('🔍 getProducts called', { bustCache })
    
    const now = Date.now()
    
    // Skip cache if busting or cache is expired
    if (!bustCache && productCache && now - lastFetchTime < CACHE_DURATION) {
      console.log("Returning products from cache.")
      return productCache
    }

    console.log(bustCache ? '💥 Cache busting requested - fetching fresh data' : '⏰ Cache expired - fetching fresh data')
    
    productCache = await fetchAndParseCsv(bustCache)
    lastFetchTime = now
    
    console.log(`✅ getProducts returning ${productCache.length} products`, { bustCache })
    return productCache
    
  } catch (error) {
    console.error('❌ Error in getProducts:', error)
    // Fallback to cached data if available, otherwise empty array
    if (productCache) {
      console.log('⚠️ Using cached data as fallback')
      return productCache
    }
    console.log('⚠️ No cached data available - returning empty array')
    return []
  }
}

// Handle empty product state when user deletes all products
export async function handleEmptyProductState(): Promise<void> {
  try {
    console.log('🗑️ Handling empty product state - user deleted all products')
    
    // Create a valid empty CSV with just headers (prevents parsing errors)
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
    
    // Generate CSV with headers only (no data rows)
    const csvText = Papa.unparse([emptyProductTemplate], { header: true }).split('\n')[0] + '\n'
    
    console.log('🗑️ Generated empty CSV structure:', {
      csvLength: csvText.length,
      content: csvText,
      hasHeaders: csvText.includes('sku,productName,category')
    })
    
    console.log('🗑️ Saving empty state to Vercel Blob...')
    await put(BLOB_FILENAME, csvText, {
      access: "public",
      contentType: "text/csv",
      allowOverwrite: true,
    })
    
    // Invalidate cache after successful upload
    productCache = null
    console.log("✅ Empty product state saved successfully - ready for CSV re-upload.")
    
  } catch (error) {
    console.error("❌ CRITICAL ERROR in handleEmptyProductState:", error)
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    throw error
  }
}

export async function updateProducts(products: Product[]): Promise<void> {
  try {
    // Category-specific validation
    const validatedProducts = products.map(product => {
      // Validate required fields by category
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
    
    console.log('💾 BLOB STORAGE: Saving products by category:', {
      total: validatedProducts.length,
      coffee: validatedProducts.filter(p => p.category === 'coffee').length,
      subscription: validatedProducts.filter(p => p.category === 'subscription').length,
      other: validatedProducts.filter(p => !['coffee', 'subscription'].includes(p.category as string)).length
    })
    
    // Save to blob storage with enhanced metadata
    const blobData = {
      version: '2.1',
      timestamp: new Date().toISOString(),
      productCount: validatedProducts.length,
      categories: [...new Set(validatedProducts.map(p => p.category))],
      products: validatedProducts
    }
    
    const jsonString = JSON.stringify(blobData, null, 2)
    
    await put(BLOB_FILENAME, jsonString, {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
    })
    
    console.log('✅ BLOB STORAGE: Successfully saved enhanced product data')
    
  } catch (error) {
    console.error("❌ CRITICAL ERROR in updateProducts:", error)
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    console.error('❌ Failed products data:', products.slice(0, 2))
    throw error // Re-throw to be handled by calling function
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
