import type { Product } from "@/lib/types"
import Papa from "papaparse"
import { devLog, buildLog, prodError } from "@/lib/logger"

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
  
  // Blend composition fields
  "blend composition": "BLEND COMPOSITION",
  "blendcomposition": "BLEND COMPOSITION", 
  "composition": "BLEND COMPOSITION",
  "blend": "BLEND COMPOSITION",
  
  // Enhanced Subscription fields
  "billing interval": "BILLING INTERVAL",
  "billinginterval": "BILLING INTERVAL",
  "subscription interval": "BILLING INTERVAL",
  "interval": "BILLING INTERVAL",
  "delivery frequency": "DELIVERY FREQUENCY",
  "deliveryfrequency": "DELIVERY FREQUENCY",
  "frequency": "DELIVERY FREQUENCY",
  "trial period": "TRIAL PERIOD DAYS",
  "trial period days": "TRIAL PERIOD DAYS",
  "trialperioddays": "TRIAL PERIOD DAYS",
  "trial days": "TRIAL PERIOD DAYS",
  "trialdays": "TRIAL PERIOD DAYS",
  "max deliveries": "MAX DELIVERIES",
  "maxdeliveries": "MAX DELIVERIES",
  "maximum deliveries": "MAX DELIVERIES",
  "notification banner": "ENABLE NOTIFICATION BANNER",
  "enable notification banner": "ENABLE NOTIFICATION BANNER",
  "enablenotificationbanner": "ENABLE NOTIFICATION BANNER",
  "notification enabled": "ENABLE NOTIFICATION BANNER",
  "notification message": "NOTIFICATION MESSAGE",
  "notificationmessage": "NOTIFICATION MESSAGE",
  "notification_message": "NOTIFICATION MESSAGE",
  "NOTIFICATION_MESSAGE": "NOTIFICATION MESSAGE",
  "banner message": "NOTIFICATION MESSAGE",
  "promo message": "NOTIFICATION MESSAGE",
  // underscore / promotional variants
  "notification_enabled": "ENABLE NOTIFICATION BANNER",
  "notificationenabled": "ENABLE NOTIFICATION BANNER",
  "promotional_notification_enabled": "ENABLE NOTIFICATION BANNER",
  "promotional notification enabled": "ENABLE NOTIFICATION BANNER",
  "promotional_notification": "ENABLE NOTIFICATION BANNER",
  "promotionalnotification": "ENABLE NOTIFICATION BANNER",
  "enable_notification_banner": "ENABLE NOTIFICATION BANNER",
  "ENABLED_NOTIFICATION_BANNER": "ENABLE NOTIFICATION BANNER",
  "in stock": "IN STOCK",
  "instock": "IN STOCK",
  "stock": "IN STOCK",
  "available": "IN STOCK",
  
  // Gift Bundle fields
  "bundle type": "BUNDLE TYPE",
  "bundletype": "BUNDLE TYPE",
  "type": "BUNDLE TYPE",
  "bundle contents": "BUNDLE CONTENTS",
  "bundlecontents": "BUNDLE CONTENTS",
  "contents": "BUNDLE CONTENTS",
  "items": "BUNDLE CONTENTS",
  "bundle description": "BUNDLE DESCRIPTION",
  "bundledescription": "BUNDLE DESCRIPTION",
  "bundle desc": "BUNDLE DESCRIPTION",
  "gift message": "GIFT MESSAGE",
  "giftmessage": "GIFT MESSAGE",
  "message": "GIFT MESSAGE",
  "packaging type": "PACKAGING TYPE",
  "packagingtype": "PACKAGING TYPE",
  "packaging": "PACKAGING TYPE",
  "box type": "PACKAGING TYPE",
  "seasonal availability": "SEASONAL AVAILABILITY",
  "seasonalavailability": "SEASONAL AVAILABILITY",
  "seasonal": "SEASONAL AVAILABILITY",
  "availability": "SEASONAL AVAILABILITY",
  
  // Pricing fields
  "original price": "ORIGINAL PRICE",
  "originalprice": "ORIGINAL PRICE",
  "msrp": "ORIGINAL PRICE",
  
  // Shipping fields (handle exact CSV quirks with spacing)
  "shipping( first item)": "SHIPPINGFIRST",
  "shipping(first item)": "SHIPPINGFIRST", 
  "shipping first item": "SHIPPINGFIRST",
  "shipping first": "SHIPPINGFIRST",
  "shippingfirst": "SHIPPINGFIRST",
  "first item shipping": "SHIPPINGFIRST",
  "shipping(additional item)": "SHIPPINGADDITIONAL",
  "shipping( additional item)": "SHIPPINGADDITIONAL",
  "shipping additional item": "SHIPPINGADDITIONAL",
  "shipping additional": "SHIPPINGADDITIONAL",
  "shippingadditional": "SHIPPINGADDITIONAL",
  "additional shipping": "SHIPPINGADDITIONAL",
  "additional item shipping": "SHIPPINGADDITIONAL",
  
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
  // Mushroom coffee variants
  if (["mushroom coffee", "mushroom", "functional coffee", "functional", "medicinal coffee", "adapto genic coffee", "nootropic coffee"].includes(s)) return "mushroom-coffee"
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
  // Detailed debug logs are gated behind DEBUG_CSV to avoid noisy build output.
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG_CSV) {
    devLog('🔧 FEATURED DEBUG: normalizeBool input:', {
      value: v,
      type: typeof v,
      stringValue: v?.toString(),
      originalInput: v
    })
  }
  
  if (typeof v === 'boolean') {
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_CSV) {
      devLog('✅ FEATURED DEBUG: Already boolean:', v)
    }
    return v
  }
  
  const s = v?.toString().toLowerCase().trim()
  const result = s === "true" || s === "yes" || s === "1" || s === "on"
  
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG_CSV) {
    devLog('🔧 FEATURED DEBUG: normalizeBool result:', {
      normalizedString: s,
      finalResult: result,
      matchedValues: {
        isTrue: s === "true",
        isYes: s === "yes", 
        isOne: s === "1",
        isOn: s === "on"
      }
    })
  }
  
  return result
}

export function normalizeMoney(v: any): number {
  if (v == null) return 0
  const n = Number(String(v).replace(/[^0-9.\-]/g, ""))
  return isNaN(n) ? 0 : Number(n.toFixed(2))
}

export function normalizeTastingNotes(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map(String).map(s => s.trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split(/[;,]/)
      .map(s => s.trim())
      .filter(Boolean);
  }
  if (input == null) return [];
  return [String(input).trim()].filter(Boolean);
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

// NEW: Process multiple origins (handle comma-separated values)
export function processMultipleOrigins(originValue?: string): string | string[] | undefined {
  if (!originValue) return undefined;
  
  const trimmed = originValue.toString().trim();
  if (!trimmed) return undefined;
  
  // Check if comma-separated
  if (trimmed.includes(',')) {
    const origins = trimmed
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean);
    
    // Return as array if multiple, string if only one after processing
    return origins.length > 1 ? origins : origins[0];
  }
  
  return trimmed;
}

// NEW: Helper functions for subscription and gift bundle processing
export function parseIntSafe(value: any): number | undefined {
  if (value == null || value === '') return undefined;
  const parsed = parseInt(value);
  return isNaN(parsed) ? undefined : parsed;
}

export function parseBooleanSafe(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'on';
  }
  return false;
}

export function parseBundleContents(value: string): any[] {
  if (!value || typeof value !== 'string') return [];
  
  try {
    // Expected format: "SKU1:QTY1:PRICE1,SKU2:QTY2:PRICE2"
    return value.split(',').map(item => {
      const [sku, quantity, unitPrice] = item.trim().split(':');
      if (!sku?.trim()) return null;
      
      return {
        sku: sku.trim(),
        productName: '', // Will be populated from SKU lookup if needed
        quantity: parseInt(quantity) || 1,
        unitPrice: parseFloat(unitPrice) || 0,
        notes: ''
      };
    }).filter(Boolean); // Remove null entries
  } catch (error) {
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_CSV) {
      devLog('Failed to parse bundle contents:', { value, error });
    }
    return [];
  }
}

// Enhanced transformHeader using new normalization system
export const transformHeader = (header: string): string => {
  const normalized = norm(header)
  const result = HEADER_ALIASES[normalized] || header.trim().toUpperCase()
  
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG_CSV) {
    devLog('🔧 Header transformation:', `"${header}" → norm:"${normalized}" → canonical:"${result}"`)
  }
  
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

// ENHANCED: Complete CSV export with ALL business fields
export function exportProductsToCSV(products: Product[]): string {
  // Use buildLog for brief generation summaries; avoid per-product logs here.
  buildLog('🔍 CSV GENERATION: Processing products', { count: products.length })
  
  const csvData = products.map(product => ({
    // Core required fields
    'SKU': product.sku || '',
    'PRODUCTNAME': product.productName || '',
    'CATEGORY': product.category || '',
    'PRICE': product.price || 0,
    'ORIGINAL PRICE': product.originalPrice || '',
    'DESCRIPTION': product.description || '',
    'FEATURED': product.featured ? 'TRUE' : 'FALSE',
    'STATUS': product.status || 'active',
    
    // Coffee-specific fields
    'ROAST LEVEL': product.roastLevel || '',
    'ORIGIN': Array.isArray(product.origin) ? product.origin.join(', ') : (product.origin || ''),
    'BLEND COMPOSITION': product.blendComposition || '', // FIXED: Now included
    'FORMAT': product.format || '',
    'WEIGHT': product.weight || '',
    'TASTING NOTES': Array.isArray(product.tastingNotes) 
      ? product.tastingNotes.join(', ') 
      : (product.tastingNotes || ''),
    
    // Shipping fields (with exact header matching)
    'SHIPPINGFIRST': product.shippingFirst || '',
    'SHIPPINGADDITIONAL': product.shippingAdditional || '',
    
    // Enhanced subscription fields
    'BILLING INTERVAL': product.billingInterval || '',
    'DELIVERY FREQUENCY': product.deliveryFrequency || '',
    'TRIAL PERIOD DAYS': product.trialPeriodDays || '',
    'MAX DELIVERIES': product.maxDeliveries || '',
    'ENABLE NOTIFICATION BANNER': product.enableNotificationBanner ? 'TRUE' : 'FALSE',
    'NOTIFICATION MESSAGE': product.notificationMessage || '',
    
    // Gift bundle fields  
    'BUNDLE TYPE': product.bundleType || '',
    'BUNDLE CONTENTS': product.bundleContents ? 
      product.bundleContents.map(item => `${item.sku}:${item.quantity}:${item.unitPrice}`).join(',') : '',
    'BUNDLE DESCRIPTION': product.bundleDescription || '',
    'GIFT MESSAGE': product.giftMessage || '',
    'PACKAGING TYPE': product.packagingType || '',
    'SEASONAL AVAILABILITY': product.seasonalAvailability || '',
    
    // Status fields
    'IN STOCK': product.inStock ? 'TRUE' : 'FALSE'
  }))
  
  const csv = Papa.unparse(csvData, { 
    header: true,
    skipEmptyLines: false 
  })
  
  buildLog('✅ CSV GENERATION: Complete', {
    outputLength: csv.length,
    headerLine: csv.split('\n')[0],
    totalLines: csv.split('\n').length,
    includesBlendComposition: csv.includes('BLEND COMPOSITION')
  })
  
  return csv
}
