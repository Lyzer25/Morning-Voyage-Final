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
  console.log("Fetching products from Vercel Blob...")
  try {
    // Check if we have a Vercel Blob token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log("⚠️ No BLOB_READ_WRITE_TOKEN found, using sample products for development")
      return SAMPLE_PRODUCTS
    }

    const blob = await list({ prefix: BLOB_FILENAME, limit: 1 })
    if (blob.blobs.length === 0) {
      console.log("No products.csv found in blob storage, using sample products")
      return SAMPLE_PRODUCTS
    }

    const fileUrl = blob.blobs[0].url
    const response = await fetch(fileUrl, { cache: "no-store" })
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`)
    }
    const csvText = await response.text()

    const parsed = Papa.parse<Product>(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: transformHeader,
    })

    // Add default status if missing
    const productsWithStatus = parsed.data.map((p) => ({
      ...p,
      status: p.status || "active",
      price: typeof p.price === "number" ? p.price : 0,
    }))

    console.log(`Successfully parsed and processed ${productsWithStatus.length} products.`)
    return productsWithStatus
  } catch (error) {
    console.error("Error fetching or parsing CSV from blob:", error)
    console.log("Falling back to sample products")
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
