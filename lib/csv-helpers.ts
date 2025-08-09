import type { Product } from "@/lib/types"
import Papa from "papaparse"

// COMPREHENSIVE CSV NORMALIZATION SYSTEM
// Normalize headers: case/space/paren tolerant, trimmed
export function norm(h: string): string {
  return h?.toLowerCase()
    .replace(/\u00A0/g, " ")        // Replace non-breaking spaces FIRST
    .trim()
    .replace(/\s+/g, " ")           // Collapse multiple spaces
    .replace(/\s*\(\s*/g, "(")      // Normalize parens spacing
    .replace(/\s*\)\s*/g, ")")
}

// Map MANY possible incoming headers → our canonical UPPERCASE CSV columns
export const HEADER_ALIASES: Record<string, string> = {
  // Core product fields
  "sku": "SKU",
  "productname": "PRODUCTNAME", 
  "product name": "PRODUCTNAME",
  "name": "PRODUCTNAME",
  "category": "CATEGORY",
  "price": "PRICE",
  "current price": "PRICE",
  "description": "DESCRIPTION",
  "featured": "FEATURED",
  
  // Coffee-specific fields
  "roast level": "ROAST LEVEL",
  "roastlevel": "ROAST LEVEL",
  "roast": "ROAST LEVEL",
  "origin": "ORIGIN",
  "format": "FORMAT",
  "weight": "WEIGHT",
  "size": "WEIGHT",
  "tasting notes": "TASTING NOTES",
  "tastingnotes": "TASTING NOTES",
  "notes": "TASTING NOTES",
  
  // Pricing fields
  "original price": "ORIGINAL PRICE",
  "originalprice": "ORIGINAL PRICE",
  "msrp": "ORIGINAL PRICE",
  
  // Shipping fields (handle exact CSV quirks)
  "shipping( first item)": "SHIPPINGFIRST",
  "shipping(first item)": "SHIPPINGFIRST", 
  "shipping first item": "SHIPPINGFIRST",
  "shipping first": "SHIPPINGFIRST",
  "shippingfirst": "SHIPPINGFIRST",
  "shipping(additional item)": "SHIPPINGADDITIONAL",
  "shipping( additional item)": "SHIPPINGADDITIONAL",
  "shipping additional item": "SHIPPINGADDITIONAL",
  "shipping additional": "SHIPPINGADDITIONAL",
  "shippingadditional": "SHIPPINGADDITIONAL",
  
  // Status fields
  "status": "STATUS",
  "active": "STATUS",
  "published": "STATUS"
}

// Canonical CSV column order
export const PRODUCTS_HEADERS = [
  "SKU", "PRODUCTNAME", "CATEGORY", "PRICE", "ORIGINAL PRICE", "DESCRIPTION", 
  "FEATURED", "ROAST LEVEL", "ORIGIN", "FORMAT", "WEIGHT", "TASTING NOTES",
  "SHIPPINGFIRST", "SHIPPINGADDITIONAL", "STATUS"
]

// VALUE NORMALIZERS
export function normalizeCategory(v?: string): string {
  const s = v?.toString().toLowerCase().trim()
  if (!s) return "coffee"
  if (["coffee", "coffees"].includes(s)) return "coffee"
  if (["subscription", "subscriptions"].includes(s)) return "subscription"
  if (["gift set", "gift-set", "giftset", "gift"].includes(s)) return "gift-set"
  if (["equipment", "gear"].includes(s)) return "equipment"
  return "coffee" // Default fallback
}

export function normalizeFormat(v?: string): string {
  const s = v?.toString().toLowerCase().trim()
  if (!s) return ""
  if (s.includes("whole")) return "whole-bean"
  if (s.includes("ground")) return "ground"
  if (s.includes("pod")) return "pods"
  if (s.includes("instant")) return "instant"
  return s // Keep original if no match
}

export function normalizeWeight(v?: string): string {
  if (!v) return ""
  const s = v.toString().toLowerCase().replace(/\s+/g, "")
  return s.replace(/oz/g, "oz").replace(/lb/g, "lb") // Normalize units
}

export function normalizeBool(v: any): boolean {
  const s = v?.toString().toLowerCase().trim()
  return s === "true" || s === "yes" || s === "1" || s === "on"
}

export function normalizeMoney(v: any): number {
  if (v == null) return 0
  const n = Number(String(v).replace(/[^0-9.\-]/g, ""))
  return isNaN(n) ? 0 : Number(n.toFixed(2))
}

export function normalizeTastingNotes(v?: string): string {
  if (!v) return ""
  // Accept comma or semicolon; collapse spaces; preserve quoted commas
  return v.split(/[;,]/)
    .map(s => s.trim())
    .filter(Boolean)
    .join(", ")
}

export function normalizeRoastLevel(v?: string): string {
  const s = v?.toString().toLowerCase().trim()
  if (!s) return "medium"
  if (s.includes("light")) return "light"
  if (s.includes("medium-dark") || s.includes("medium dark")) return "medium-dark"
  if (s.includes("dark")) return "dark"
  if (s.includes("medium")) return "medium"
  return s // Keep original if no standard match
}

// Enhanced transformHeader using new normalization system
export const transformHeader = (header: string): string => {
  const normalized = norm(header)
  const result = HEADER_ALIASES[normalized] || header.trim().toUpperCase()
  
  console.log('🔧 Header transformation:', `"${header}" → norm:"${normalized}" → canonical:"${result}"`)
  
  return result
}

// Enhance the processCSVData function:
export function processCSVData(data: any[]): Product[] {
  return data.map((row: any) => {
    const category = row.category?.toLowerCase() || 'coffee'
    
    // Base product data
    const baseProduct: Product = {
      id: crypto.randomUUID(),
      sku: row.sku || '',
      productName: row.productName || '',
      description: row.description || '',
      category: category,
      price: parseFloat(row.price) || 0,
      originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : undefined,
      featured: row.featured === 'TRUE' || row.featured === true,
      status: row.status || 'active',
      inStock: row.inStock !== false,
      images: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Shipping fields
      shippingFirst: row.shippingFirst ? parseFloat(row.shippingFirst) : undefined,
      shippingAdditional: row.shippingAdditional ? parseFloat(row.shippingAdditional) : undefined
    }
    
    // Category-specific field processing
    if (category === 'coffee') {
      return {
        ...baseProduct,
        roastLevel: row.roastLevel?.toLowerCase() || 'medium',
        origin: row.origin || '',
        format: row.format?.toLowerCase().replace(' ', '-') || 'whole-bean',
        weight: row.weight || '12oz',
        tastingNotes: typeof row.tastingNotes === 'string' 
          ? row.tastingNotes.split(',').map((note: string) => note.trim()).filter((note: string) => note.length > 0)
          : []
      }
    }
    
    if (category === 'subscription') {
      return {
        ...baseProduct,
        notification: row.notification || '',
        subscriptionInterval: row.subscriptionInterval?.toLowerCase() || 'monthly',
        deliveryFrequency: row.deliveryFrequency?.toLowerCase() || 'monthly',
        notificationEnabled: row.notificationEnabled === 'TRUE' || row.notificationEnabled === true,
        maxDeliveries: row.maxDeliveries ? parseInt(row.maxDeliveries) : undefined,
        trialDays: row.trialDays ? parseInt(row.trialDays) : 0
      }
    }
    
    // Default processing for other categories
    return baseProduct
  })
}

// Add category-specific CSV export:
export function exportProductsToCSV(products: Product[]): string {
  const csvData = products.map(product => {
    const baseData = {
      sku: product.sku,
      productName: product.productName,
      CATEGORY: product.category?.toUpperCase(),
      PRICE: product.price,
      DESCRIPTION: product.description,
      FEATURED: product.featured ? 'TRUE' : 'FALSE',
      STATUS: product.status,
      'Shipping(First Item)': product.shippingFirst || '',
      'Shipping(Additional Item)': product.shippingAdditional || ''
    }
    
    // Add category-specific fields
    if (product.category === 'coffee') {
      return {
        ...baseData,
        'ROAST LEVEL': product.roastLevel || '',
        ORIGIN: product.origin || '',
        FORMAT: product.format || '',
        WEIGHT: product.weight || '',
        'TASTING NOTES': Array.isArray(product.tastingNotes) 
          ? product.tastingNotes.join(', ')
          : product.tastingNotes || ''
      }
    }
    
    if (product.category === 'subscription') {
      return {
        ...baseData,
        NOTIFICATION: product.notification || '',
        'SUBSCRIPTION INTERVAL': product.subscriptionInterval || '',
        'DELIVERY FREQUENCY': product.deliveryFrequency || '',
        'NOTIFICATION ENABLED': product.notificationEnabled ? 'TRUE' : 'FALSE',
        'MAX DELIVERIES': product.maxDeliveries || '',
        'TRIAL DAYS': product.trialDays || 0
      }
    }
    
    return baseData
  })
  
  return Papa.unparse(csvData, { header: true })
}
