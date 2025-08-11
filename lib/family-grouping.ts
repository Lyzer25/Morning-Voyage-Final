import type { Product } from "@/lib/types"

export interface ProductVariant extends Product {
  formatCode: string
}

export interface ProductFamily {
  familyKey: string
  base: Product
  variants: ProductVariant[]
}

// Extract format code from SKU suffix (-WB, -GR, -PODS, -INSTANT)
export function getFormatCodeFromSku(sku: string): string {
  return sku?.split("-").pop()?.toUpperCase() ?? ""
}

// Get family key - strip WB/GR suffixes, keep others intact
export function getFamilyKeyFromSku(sku: string): string {
  const code = getFormatCodeFromSku(sku)
  return (code === "WB" || code === "GR") ? sku.replace(/-(WB|GR)$/i, "") : sku
}

// Group products into families, collapsing WB/GR into single families
export function groupProductFamilies(products: Product[]): ProductFamily[] {
  console.log(`🔄 Grouping ${products.length} products into families (WB/GR collapse)...`)
  
  const map = new Map<string, ProductVariant[]>()
  
  for (const p of products) {
    const v: ProductVariant = { ...p, formatCode: getFormatCodeFromSku(p.sku) }
    const k = getFamilyKeyFromSku(p.sku)
    const existing = map.get(k) ?? []
    existing.push(v)
    map.set(k, existing)
    
    console.log(`📦 Product: ${p.sku} → family: ${k} (format: ${v.formatCode})`)
  }
  
  const families: ProductFamily[] = []
  
  for (const [familyKey, variants] of map.entries()) {
    // Prefer WB as base, else GR, else first variant
    const baseVariant = variants.find(v => v.formatCode === "WB") 
                     ?? variants.find(v => v.formatCode === "GR") 
                     ?? variants[0]
    
    // PHASE 2: Assign coffee-family category to family base
    const familyBase = { ...baseVariant, category: 'coffee-family' }
    
    families.push({ familyKey, base: familyBase, variants })
    
    console.log(`✅ Family: ${familyKey} → ${variants.length} variants (${variants.map(v => v.formatCode).join(', ')}) → base: ${familyBase.formatCode} → category: coffee-family`)
  }
  
  console.log(`🎯 Final result: ${products.length} products → ${families.length} families`)
  families.forEach((f, i) => {
    console.log(`   ${i + 1}. ${f.base.productName} (${f.variants.length} variants: ${f.variants.map(v => v.formatCode).join(', ')})`)
  })
  
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
