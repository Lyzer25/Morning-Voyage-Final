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
    tastingNotes: "Chocolate, Caramel, Nuts",
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
    tastingNotes: "Chocolate, Caramel, Nuts",
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
    tastingNotes: "Dark Chocolate, Smoky, Robust",
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
    tastingNotes: "Blueberry, Floral, Citrus",
    featured: false,
  }
]

async function fetchAndParseCsv(): Promise<Product[]> {
  try {
    console.log('📊 fetchAndParseCsv: Starting...');
    console.log('📊 Environment check:', {
      hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL
    });
    
    // Check if we have a Vercel Blob token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log("⚠️ No BLOB_READ_WRITE_TOKEN found, using sample products for development")
      console.log('📊 Returning sample products count:', SAMPLE_PRODUCTS.length);
      return SAMPLE_PRODUCTS
    }

    console.log('📊 Listing blobs with prefix:', BLOB_FILENAME);
    const blob = await list({ prefix: BLOB_FILENAME, limit: 1 })
    console.log('📊 Blob list result:', {
      count: blob.blobs?.length || 0,
      blobs: blob.blobs?.map(b => ({ url: b.url, size: b.size, uploadedAt: b.uploadedAt })) || []
    });
    
    if (!blob.blobs || blob.blobs.length === 0) {
      console.log("⚠️ No products.csv found in blob storage, using sample products")
      console.log('📊 Returning sample products count:', SAMPLE_PRODUCTS.length);
      return SAMPLE_PRODUCTS
    }

    const fileUrl = blob.blobs[0].url
    console.log('📊 Fetching CSV from URL:', fileUrl);
    
    const response = await fetch(fileUrl, { cache: "no-store" })
    console.log('📊 Fetch response:', {
      status: response.status,
      statusText: response.statusText,
      headers: {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }
    
    const csvText = await response.text()
    console.log('📊 CSV text received:', {
      length: csvText.length,
      preview: csvText.substring(0, 500),
      lineCount: csvText.split('\n').length
    });

    console.log('📊 Parsing CSV with Papa Parse...');
    const parsed = Papa.parse<Product>(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: transformHeader,
    })

    console.log('📊 Papa Parse result:', {
      rowCount: parsed.data?.length || 0,
      errorCount: parsed.errors?.length || 0,
      headers: parsed.meta?.fields || [],
      errors: parsed.errors
    });

    if (parsed.errors && parsed.errors.length > 0) {
      console.error('❌ CSV Parse errors:', parsed.errors);
    }

    if (!parsed.data || !Array.isArray(parsed.data)) {
      console.error('❌ Parsed data is not an array:', typeof parsed.data);
      console.log('📊 Falling back to sample products');
      return SAMPLE_PRODUCTS;
    }

    // Add default status if missing and log transformation
    const productsWithStatus = parsed.data.map((p, index) => {
      const transformed = {
        ...p,
        status: p.status || "active",
        price: typeof p.price === "number" ? p.price : 0,
      };
      
      // Log first few products for debugging
      if (index < 3) {
        console.log(`📊 Product ${index + 1}:`, {
          sku: transformed.sku,
          productName: transformed.productName,
          category: transformed.category,
          price: transformed.price,
          status: transformed.status
        });
      }
      
      return transformed;
    })

    console.log(`✅ Successfully parsed and processed ${productsWithStatus.length} products.`)
    console.log('📊 Final products sample categories:', productsWithStatus.slice(0, 5).map(p => p.category));
    
    return productsWithStatus
  } catch (error) {
    console.error("❌ Error fetching or parsing CSV from blob:", error)
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    console.log("📊 Falling back to sample products");
    console.log('📊 Sample products count:', SAMPLE_PRODUCTS.length);
    console.log('📊 Sample products categories:', SAMPLE_PRODUCTS.map(p => p.category));
    return SAMPLE_PRODUCTS
  }
}

export async function getProducts(): Promise<Product[]> {
  const now = Date.now()
  if (productCache && now - lastFetchTime < CACHE_DURATION) {
    console.log("Returning products from cache.")
    return productCache
  }

  productCache = await fetchAndParseCsv()
  lastFetchTime = now
  return productCache
}

export async function updateProducts(products: Product[]): Promise<void> {
  console.log(`Updating products.csv with ${products.length} products...`)
  const csvText = Papa.unparse(products, { header: true })
  await put(BLOB_FILENAME, csvText, {
    access: "public",
    contentType: "text/csv",
  })
  productCache = null // Invalidate cache
  console.log("Product update complete.")
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
