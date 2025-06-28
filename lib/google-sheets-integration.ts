// Enhanced Google Sheets Integration with Format, Weight, and Tasting Notes
export interface SheetProduct {
  sku: string
  productName: string
  category: 'coffee' | 'subscription' | 'gift-set' | 'variety-pack' | 'equipment'
  subcategory: string
  status: 'active' | 'inactive' | 'coming-soon' | 'sold-out'
  format?: 'whole-bean' | 'ground' | 'pods'
  weight?: string // "12 oz" | "12-pack"
  packSize?: number // 1 for single bag, 12 for pod pack
  price: number
  originalPrice?: number
  description: string
  longDescription?: string
  sizeOptions?: string[]
  roastLevel?: 'light' | 'medium' | 'medium-dark' | 'dark'
  origin?: string
  processingMethod?: string
  tastingNotes?: string[] // Parsed from comma-separated or individual columns
  altitude?: string
  variety?: string
  subscriptionType?: 'monthly' | 'bi-weekly' | 'weekly'
  subscriptionBags?: number
  giftDuration?: string
  featured: boolean
  badge?: string
  tags?: string[]
  season?: 'spring' | 'summer' | 'fall' | 'winter' | 'year-round'
  primaryImageUrl?: string
  galleryImages?: string[]
  videoUrl?: string
  metaTitle?: string
  metaDescription?: string
  urlSlug?: string
  createdDate?: string
  updatedDate?: string
  launchDate?: string
  discontinueDate?: string
}

// Google Sheets API configuration
const SHEET_CONFIG = {
  spreadsheetId: process.env.GOOGLE_SHEETS_ID,
  range: 'Sheet1!A:Z', // Changed from "Products!A:AZ" to "Sheet1!A:Z"
  apiKey: process.env.GOOGLE_SHEETS_API_KEY,
}

// Transform sheet row to product object
export function transformSheetRowToProduct(row: string[], headers: string[]): SheetProduct | null {
  if (!row || row.length === 0) return null

  const product: any = {}

  headers.forEach((header, index) => {
    const value = row[index]?.trim()
    if (!value) return

    // Normalize header for comparison (remove spaces, convert to lowercase)
    const normalizedHeader = header
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '')

    switch (normalizedHeader) {
      case 'sku':
        product.sku = value
        break
      case 'productname':
        product.productName = value
        break
      case 'category':
        product.category = value.toLowerCase()
        break
      case 'subcategory':
        product.subcategory = value.toLowerCase().replace(/\s+/g, '-')
        break
      case 'status':
        product.status = value.toLowerCase()
        break
      case 'format':
        product.format = value.toLowerCase().replace(/\s+/g, '-')
        break
      case 'weight':
        product.weight = value
        break
      case 'packsize':
        product.packSize = Number.parseInt(value)
        break
      case 'price':
        product.price = Number.parseFloat(value)
        break
      case 'originalprice':
        product.originalPrice = Number.parseFloat(value)
        break
      case 'description':
        product.description = value
        break
      case 'longdescription':
        product.longDescription = value
        break
      case 'sizeoptions':
        product.sizeOptions = value.split('|').map(s => s.trim())
        break
      case 'roastlevel':
        product.roastLevel = value.toLowerCase()
        break
      case 'origin':
        product.origin = value
        break
      case 'processingmethod':
        product.processingMethod = value.toLowerCase().replace(/\s+/g, '-')
        break
      case 'tastingnotes':
        // Handle comma-separated tasting notes
        product.tastingNotes = value
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
        break
      case 'featured':
        product.featured =
          value.toLowerCase() === 'true' || value.toLowerCase() === 'yes' || value === '1'
        break
      case 'badge':
        product.badge = value
        break
      case 'tags':
        product.tags = value.split('|').map(s => s.trim())
        break
      case 'season':
        product.season = value.toLowerCase()
        break
      case 'primaryimageurl':
        product.primaryImageUrl = value
        break
      case 'galleryimages':
        product.galleryImages = value.split('|').map(s => s.trim())
        break
      case 'videourl':
        product.videoUrl = value
        break
      case 'metatitle':
        product.metaTitle = value
        break
      case 'metadescription':
        product.metaDescription = value
        break
      case 'urlslug':
        product.urlSlug = value || generateSlug(product.productName)
        break
      case 'createddate':
        product.createdDate = value
        break
      case 'updateddate':
        product.updatedDate = value
        break
      case 'launchdate':
        product.launchDate = value
        break
      case 'discontinuedate':
        product.discontinueDate = value
        break
    }
  })

  // Clean up tasting notes array (remove empty values)
  if (product.tastingNotes) {
    product.tastingNotes = product.tastingNotes.filter(Boolean)
  }

  // Set default values for missing fields
  if (!product.subcategory && product.category) {
    product.subcategory = product.category
  }

  if (!product.status) {
    product.status = 'active'
  }

  if (product.featured === undefined) {
    product.featured = false
  }

  // Validate required fields
  if (!product.sku || !product.productName || !product.category || !product.price) {
    console.warn('Invalid product row - missing required fields:', {
      sku: product.sku,
      productName: product.productName,
      category: product.category,
      price: product.price,
      rawRow: row,
    })
    return null
  }

  console.log('Successfully transformed product:', product.productName)
  return product as SheetProduct
}

// Generate URL slug from product name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Fetch products from Google Sheets
export async function fetchProductsFromSheet(): Promise<SheetProduct[]> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_CONFIG.spreadsheetId}/values/${SHEET_CONFIG.range}?key=${SHEET_CONFIG.apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (!data.values || data.values.length === 0) {
      console.warn('No data found in spreadsheet')
      return []
    }

    const [headers, ...rows] = data.values
    console.log('Found headers:', headers)
    console.log('Found rows:', rows.length)

    const products: SheetProduct[] = []

    rows.forEach((row: string[], index: number) => {
      console.log(`Processing row ${index + 2}:`, row.slice(0, 3)) // Log first 3 columns
      const product = transformSheetRowToProduct(row, headers)
      if (product) {
        console.log(`✅ Added product: ${product.productName}`)
        products.push(product)
      } else {
        console.log(`❌ Skipped row ${index + 2} - invalid or inactive`)
      }
    })

    console.log(`Loaded ${products.length} active products from spreadsheet`)
    return products
  } catch (error) {
    console.error('Error fetching products from sheet:', error)
    return []
  }
}

// Filter products by format
export function filterProductsByFormat(products: SheetProduct[], format: string): SheetProduct[] {
  if (format === 'all') return products
  return products.filter(product => product.format === format)
}

// Get unique formats from products
export function getAvailableFormats(products: SheetProduct[]): string[] {
  const formats = new Set(products.map(p => p.format).filter(Boolean))
  return Array.from(formats)
}

// Get unique weights from products
export function getAvailableWeights(products: SheetProduct[]): string[] {
  const weights = new Set(products.map(p => p.weight).filter(Boolean))
  return Array.from(weights)
}

// Search products including format and weight
export function searchProducts(products: SheetProduct[], query: string): SheetProduct[] {
  const lowercaseQuery = query.toLowerCase()
  return products.filter(
    product =>
      product.productName.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.format?.toLowerCase().includes(lowercaseQuery) ||
      product.weight?.toLowerCase().includes(lowercaseQuery) ||
      product.tastingNotes?.some(note => note.toLowerCase().includes(lowercaseQuery)) ||
      product.origin?.toLowerCase().includes(lowercaseQuery) ||
      product.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

// Generate product page data with enhanced fields
export function generateProductPageData(product: SheetProduct) {
  return {
    id: product.sku,
    name: product.productName,
    slug: product.urlSlug || generateSlug(product.productName),
    category: product.category,
    subcategory: product.subcategory,
    format: product.format,
    weight: product.weight,
    packSize: product.packSize,
    price: product.price,
    originalPrice: product.originalPrice,
    description: product.description,
    longDescription: product.longDescription,
    images: [product.primaryImageUrl, ...(product.galleryImages || [])].filter(Boolean),
    video: product.videoUrl,
    specifications: {
      weight: product.weight,
      format: product.format,
      packSize: product.packSize,
      roastLevel: product.roastLevel,
      origin: product.origin,
      processingMethod: product.processingMethod,
      tastingNotes: product.tastingNotes,
      altitude: product.altitude,
      variety: product.variety,
    },
    subscription: {
      type: product.subscriptionType,
      bags: product.subscriptionBags,
      giftDuration: product.giftDuration,
    },
    seo: {
      title: product.metaTitle || `${product.productName} | Morning Voyage`,
      description: product.metaDescription || product.description,
      slug: product.urlSlug || generateSlug(product.productName),
    },
    marketing: {
      featured: product.featured,
      badge: product.badge,
      tags: product.tags,
      season: product.season,
    },
    dates: {
      created: product.createdDate,
      updated: product.updatedDate,
      launch: product.launchDate,
      discontinue: product.discontinueDate,
    },
  }
}

// Cache management for performance
let productCache: SheetProduct[] = []
let lastFetch = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getCachedProducts(): Promise<SheetProduct[]> {
  const now = Date.now()

  if (productCache.length === 0 || now - lastFetch > CACHE_DURATION) {
    productCache = await fetchProductsFromSheet()
    lastFetch = now
  }

  return productCache
}

// Webhook handler for real-time updates
export async function handleSheetWebhook(payload: any) {
  console.log('Sheet updated, refreshing product cache...')
  productCache = await fetchProductsFromSheet()
  lastFetch = Date.now()
}

// Product filtering and search functions
export function filterProductsByCategory(
  products: SheetProduct[],
  category: string
): SheetProduct[] {
  if (category === 'all') return products
  return products.filter(product => product.category === category)
}
