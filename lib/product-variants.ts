// Enhanced product variant management system
import type { SheetProduct } from './google-sheets-integration'

export interface ProductVariant {
  sku: string
  format: string
  weight?: string
  packSize?: number
  price: number
  originalPrice?: number
  inStock: boolean
}

export interface GroupedProduct {
  baseSku: string
  productName: string
  category: string
  subcategory: string
  description: string
  longDescription?: string
  roastLevel?: string
  origin?: string
  processingMethod?: string
  tastingNotes?: string[]
  featured: boolean
  badge?: string
  status: string
  variants: ProductVariant[]
  defaultVariant: ProductVariant
  availableFormats: string[]
  priceRange: {
    min: number
    max: number
  }
}

// Extract base SKU from full SKU (remove format/weight suffixes)
export function getBaseSku(sku: string): string {
  // More aggressive base SKU extraction
  return sku
    .replace(/-?(12|16|24|32)OZ$/i, '')
    .replace(/-?(WHOLE|GROUND|PODS?|INSTANT)$/i, '')
    .replace(/-?(BEAN|BEANS)$/i, '')
    .replace(/-?(WB|GR|PD)$/i, '') // Common abbreviations
    .replace(/-+$/, '') // Remove trailing dashes
    .trim()
}

// Generate consistent product slug for URLs
export function generateProductSlug(baseSku: string): string {
  return baseSku
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim()
}

// Generate slug from product name (fallback)
export function generateSlugFromName(productName: string): string {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim()
}

// Extract base product name (remove format indicators)
export function getBaseProductName(name: string): string {
  return name
    .replace(/\s*-\s*(Whole Bean|Ground|Pods?|Instant)$/i, '')
    .replace(/\s*$$(Whole Bean|Ground|Pods?|Instant)$$$/i, '')
    .trim()
}

// Group products by base name and format variants
export function groupProductVariants(products: SheetProduct[]): GroupedProduct[] {
  console.log(`🔄 Grouping ${products.length} raw products into variants...`)

  // First, let's see what we're working with
  products.forEach((product, index) => {
    console.log(`Raw product ${index + 1}:`, {
      sku: product.sku,
      name: product.productName,
      format: product.format,
      price: product.price,
      status: product.status,
    })
  })

  const grouped = new Map<string, GroupedProduct>()

  products.forEach((product, index) => {
    // Use product name as the primary grouping key, not SKU
    const baseName = getBaseProductName(product.productName)
    const baseKey = `${baseName}-${product.category}-${product.subcategory}`
      .toLowerCase()
      .replace(/\s+/g, '-')

    console.log(
      `Processing product ${index + 1}: "${product.productName}" -> base: "${baseName}" -> key: "${baseKey}" -> status: "${product.status}"`
    )

    const variant: ProductVariant = {
      sku: product.sku,
      format: product.format || 'whole-bean',
      weight: product.weight,
      packSize: product.packSize,
      price: product.price,
      originalPrice: product.originalPrice,
      inStock: product.status === 'active',
    }

    if (grouped.has(baseKey)) {
      // Add variant to existing product
      const existingProduct = grouped.get(baseKey)!

      // Check if this format already exists
      const existingVariant = existingProduct.variants.find(v => v.format === variant.format)
      if (existingVariant) {
        console.log(`  ⚠️ Duplicate format ${variant.format} for ${baseName}, skipping...`)
        return
      }

      existingProduct.variants.push(variant)

      // Update available formats
      if (!existingProduct.availableFormats.includes(variant.format)) {
        existingProduct.availableFormats.push(variant.format)
      }

      // Update price range
      existingProduct.priceRange.min = Math.min(existingProduct.priceRange.min, variant.price)
      existingProduct.priceRange.max = Math.max(existingProduct.priceRange.max, variant.price)

      // Update default variant if this one is featured or cheaper
      if (product.featured || variant.price < existingProduct.defaultVariant.price) {
        existingProduct.defaultVariant = variant
        existingProduct.featured = product.featured
      }

      // CRITICAL FIX: Update group status to active if ANY variant is active
      if (product.status === 'active') {
        existingProduct.status = 'active'
      }

      console.log(`  ✅ Added variant ${variant.format} to existing product: ${baseName} (group status: ${existingProduct.status})`)
    } else {
      // Create new grouped product
      const groupedProduct: GroupedProduct = {
        baseSku: getBaseSku(product.sku),
        productName: baseName, // Use the cleaned base name
        category: product.category,
        subcategory: product.subcategory,
        description: product.description,
        longDescription: product.longDescription,
        roastLevel: product.roastLevel,
        origin: product.origin,
        processingMethod: product.processingMethod,
        tastingNotes: product.tastingNotes,
        featured: product.featured,
        badge: product.badge,
        status: product.status, // Start with this variant's status
        variants: [variant],
        defaultVariant: variant,
        availableFormats: [variant.format],
        priceRange: {
          min: variant.price,
          max: variant.price,
        },
      }

      grouped.set(baseKey, groupedProduct)
      console.log(`  ✅ Created new grouped product: ${baseName} (${baseKey}) with status: ${product.status}`)
    }
  })

  // CRITICAL FIX: Filter by variants having active products, not group status
  const result = Array.from(grouped.values()).filter(
    product => product.variants.some(v => v.inStock)
  )

  console.log(`✅ Final grouping result:`)
  console.log(`   - Input: ${products.length} raw products`)
  console.log(`   - Grouped: ${grouped.size} total groups`)
  console.log(`   - Output: ${result.length} groups with active variants`)

  result.forEach((product, index) => {
    const activeVariants = product.variants.filter(v => v.inStock).length
    console.log(
      `   ${index + 1}. ${product.productName} (${product.variants.length} variants, ${activeVariants} active: ${product.availableFormats.join(', ')})`
    )
  })

  return result
}

// Get variant by format for a grouped product
export function getVariantByFormat(product: GroupedProduct, format: string): ProductVariant | null {
  return product.variants.find(v => v.format === format) || null
}

// Get available formats for display
export function getFormatDisplayName(format: string): string {
  const formatNames: Record<string, string> = {
    'whole-bean': 'Whole Bean',
    ground: 'Ground',
    pods: 'Coffee Pods',
    instant: 'Instant',
  }

  return formatNames[format] || format.charAt(0).toUpperCase() + format.slice(1).replace(/-/g, ' ')
}

// Get format description
export function getFormatDescription(format: string): string {
  const descriptions: Record<string, string> = {
    'whole-bean': 'Grind fresh at home for maximum flavor',
    ground: 'Ready to brew - perfect for drip coffee',
    pods: 'Compatible with single-serve machines',
    instant: 'Just add hot water',
  }

  return descriptions[format] || 'Premium coffee format'
}

// Check if product has multiple formats
export function hasMultipleFormats(product: GroupedProduct): boolean {
  return product.availableFormats.length > 1
}

// Get price display for grouped product
export function getPriceDisplay(product: GroupedProduct): string {
  if (product.priceRange.min === product.priceRange.max) {
    return `$${product.priceRange.min.toFixed(2)}`
  }
  return `$${product.priceRange.min.toFixed(2)} - $${product.priceRange.max.toFixed(2)}`
}

// Search and filter functions for grouped products
export function searchGroupedProducts(products: GroupedProduct[], query: string): GroupedProduct[] {
  const lowercaseQuery = query.toLowerCase()
  return products.filter(
    product =>
      product.productName.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.tastingNotes?.some(note => note.toLowerCase().includes(lowercaseQuery)) ||
      product.origin?.toLowerCase().includes(lowercaseQuery) ||
      product.availableFormats.some(format => format.toLowerCase().includes(lowercaseQuery))
  )
}

export function filterGroupedProductsByCategory(
  products: GroupedProduct[],
  category: string
): GroupedProduct[] {
  if (category === 'all') return products
  return products.filter(product => product.subcategory === category)
}

export function filterGroupedProductsByFormat(
  products: GroupedProduct[],
  format: string
): GroupedProduct[] {
  if (format === 'all') return products
  return products.filter(product => product.availableFormats.includes(format))
}
