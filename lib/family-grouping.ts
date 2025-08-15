import type { Product } from "@/lib/types"
import { devLog, buildLog } from "@/lib/logger"

export interface ProductVariant extends Product {
  formatCode: string
}

export interface ProductFamily {
  familyKey: string
  base: Product
  variants: ProductVariant[]
}

// Map product format field to format codes for UI display
export function getFormatCodeFromProduct(product: Product): string {
  const format = product.format?.toLowerCase() || 'whole-bean'
  
  // Map CSV format values to display codes
  switch (format) {
    case 'whole-bean':
    case 'whole bean':
    case 'wholebBean':
      return 'WB'
    case 'ground':
    case 'pre-ground':
    case 'preground':
      return 'GR'
    case 'pods':
    case 'coffee-pods':
    case 'k-cups':
    case 'kcups':
      return 'PODS'
    case 'instant':
      return 'INSTANT'
    default:
      return format.toUpperCase()
  }
}

// LEGACY: Extract format code from SKU suffix (kept for backward compatibility)
export function getFormatCodeFromSku(sku: string): string {
  return sku?.split("-").pop()?.toUpperCase() ?? ""
}

// ✅ NEW: Extract core product name for name-based grouping
export function extractCoreProductName(productName: string): string {
  return productName
    // Remove format specifications
    .replace(/\s*-\s*(Whole Bean|Ground|Pods|Instant)\s*$/i, '')
    // Remove roast level specifications  
    .replace(/\s*-\s*(Light|Medium|Medium-Dark|Dark)(\s+Roast)?\s*$/i, '')
    // Remove origin specifications if at end
    .replace(/\s*-\s*[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s*$/i, '')
    // Remove size/weight specifications
    .replace(/\s*-\s*(12oz|1lb|\d+\s*(oz|lb|count|ct|pack))\s*$/i, '')
    // Remove parenthetical info
    .replace(/\s*\([^)]*\)\s*$/g, '')
    // Clean up extra spaces and dashes
    .replace(/\s*-\s*$/, '')
    .trim()
}

// LEGACY: Get family key - strip WB/GR/PODS suffixes, keep others intact (kept for compatibility)
export function getFamilyKeyFromSku(sku: string): string {
  const code = getFormatCodeFromSku(sku)
  return (code === "WB" || code === "GR" || code === "PODS") 
    ? sku.replace(/-(WB|GR|PODS)$/i, "") 
    : sku
}

// ✅ ENHANCED: Group products into families using NAME-BASED grouping
export function groupProductFamilies(products: Product[]): ProductFamily[] {
  // Summary-level log for builds; detailed output goes to DEBUG_CSV.
  buildLog('🔄 Grouping products into families', { count: products.length });
  
  // Group by core product name, not SKU patterns
  const grouped = products.reduce((acc, product) => {
    const coreProductName = extractCoreProductName(product.productName)
    
    if (!acc[coreProductName]) {
      acc[coreProductName] = []
    }
    acc[coreProductName].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  // Build-time brief summary; include full nameGroups only when debugging.
  buildLog('🔍 Name-based grouping results', {
    totalProducts: products.length,
    uniqueNames: Object.keys(grouped).length
  })
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG_CSV) {
    devLog('🔍 Name-based grouping details:', {
      nameGroups: Object.entries(grouped).map(([name, prods]) => ({
        name,
        count: prods.length,
        skus: prods.map(p => p.sku)
      }))
    })
  }

  const families: ProductFamily[] = []
  
  // Convert groups to families (only for groups with 2+ variants)
  for (const [coreProductName, variants] of Object.entries(grouped)) {
    // ✅ CRITICAL FIX: Only create families with 2+ variants
    if (variants.length < 2) {
      if (process.env.NODE_ENV === 'development' && process.env.DEBUG_CSV) {
        devLog(`⚠️ Skipping single variant: ${coreProductName} → ${variants[0].sku} (will remain individual product)`)
      }
      continue
    }
    
    // Convert to ProductVariants with format codes based on CSV FORMAT field
    const productVariants: ProductVariant[] = variants.map(p => ({
      ...p,
      formatCode: getFormatCodeFromProduct(p) // Use FORMAT field instead of SKU parsing
    }))

    // Prefer WB as base, else GR, else first variant
    const baseVariant = productVariants.find(v => v.formatCode === "WB") 
                     ?? productVariants.find(v => v.formatCode === "GR") 
                     ?? productVariants[0]
    
    // Create family with coffee-family category
    const familyBase = { ...baseVariant, category: 'coffee-family' }
    
    families.push({ 
      familyKey: coreProductName, // Use core name as family key
      base: familyBase, 
      variants: productVariants 
    })
    
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_CSV) {
      devLog(`✅ Family: "${coreProductName}" → ${variants.length} variants (${productVariants.map(v => `${v.formatCode}:${v.roastLevel || 'N/A'}:${v.origin || 'N/A'}`).join(', ')}) → base: ${familyBase.formatCode} → category: coffee-family`)
    }
  }
  
  // Summary for build logs
  buildLog('🎯 Family grouping result', {
    inputProducts: products.length,
    families: families.length
  })
  
  // Detailed list only when debugging CSV processing
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG_CSV) {
    families.forEach((f, i) => {
      devLog(`   ${i + 1}. ${f.base.productName} (${f.variants.length} variants: ${f.variants.map(v => v.formatCode).join(', ')})`)
    })
  }
  
  return families
}

// Get price display for family (single or range)
export function getFamilyPriceDisplay(family: ProductFamily): string {
  const prices = family.variants.map(v => v.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  
  if (min === max) {
    return `$${min.toFixed(2)}`
  }
  return `$${min.toFixed(2)} - $${max.toFixed(2)}`
}

// Check if family has multiple format options
export function hasMultipleFormats(family: ProductFamily): boolean {
  return family.variants.length > 1
}

// Get variant by format code
export function getVariantByFormat(family: ProductFamily, formatCode: string): ProductVariant | null {
  return family.variants.find(v => v.formatCode === formatCode) || null
}

// Get available format codes for family
export function getAvailableFormats(family: ProductFamily): string[] {
  return family.variants.map(v => v.formatCode)
}

// Generate URL slug from family key
export function generateFamilySlug(familyKey: string): string {
  return familyKey.toLowerCase().replace(/[^a-z0-9]/g, "-")
}

// Find family by slug
export function findFamilyBySlug(families: ProductFamily[], slug: string): ProductFamily | null {
  return families.find(f => generateFamilySlug(f.familyKey) === slug) || null
}

// Format display names for UI
export const FORMAT_DISPLAY_NAMES: Record<string, string> = {
  "WB": "Whole Bean",
  "GR": "Ground", 
  "PODS": "Coffee Pods",
  "INSTANT": "Instant"
}

export function getFormatDisplayName(formatCode: string): string {
  return FORMAT_DISPLAY_NAMES[formatCode] || formatCode
}

// COMPATIBILITY: Convert ProductFamily to GroupedProduct for existing UI components
export function convertFamilyToGroupedProduct(family: ProductFamily): any {
  const variants = family.variants.map(v => ({
    sku: v.sku,
    format: v.format || "whole-bean",
    weight: v.weight,
    packSize: v.packSize,
    price: v.price,
    originalPrice: v.originalPrice,
    inStock: v.status === "active"
  }))

  const prices = family.variants.map(v => v.price)
  const priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices)
  }

  const defaultVariant = variants.find(v => v.sku === family.base.sku) || variants[0]
  
  // Convert tastingNotes to array for compatibility (handle both string and array cases)
  let tastingNotesArray: string[] = []
  if (family.base.tastingNotes) {
    if (Array.isArray(family.base.tastingNotes)) {
      tastingNotesArray = family.base.tastingNotes
    } else {
      // Handle legacy string format
      tastingNotesArray = String(family.base.tastingNotes).split(',').map((note: string) => note.trim()).filter(Boolean)
    }
  }

  return {
    baseSku: family.familyKey,
    productName: family.base.productName,
    category: family.base.category,
    subcategory: family.base.category, // Use category as subcategory fallback
    description: family.base.description,
    longDescription: family.base.description,
    roastLevel: family.base.roastLevel,
    origin: family.base.origin,
    processingMethod: family.base.processingMethod,
    tastingNotes: tastingNotesArray,
    featured: family.base.featured,
    badge: family.base.badge,
    status: family.base.status,
    notification: family.base.notification,
    variants,
    defaultVariant,
    availableFormats: family.variants.map(v => v.formatCode.toLowerCase().replace(/^(wb|gr)$/, m => m === 'wb' ? 'whole-bean' : 'ground')),
    priceRange
  }
}

// Convert array of ProductFamily to GroupedProduct for UI compatibility  
export function convertFamiliesToGroupedProducts(families: ProductFamily[]): any[] {
  return families.map(convertFamilyToGroupedProduct)
}
