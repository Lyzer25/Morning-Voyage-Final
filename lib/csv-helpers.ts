import type { Product } from "@/lib/types"
import Papa from "papaparse"

// Enhanced mapping to handle your exact CSV format and variations
// Supports both your UPPERCASE format and standard lowercase variations
const headerMapping: { [key: string]: string } = {
  // Standard lowercase mappings (existing)
  sku: "sku",
  "product name": "productName",
  productname: "productName",
  category: "category",
  subcategory: "subcategory",
  status: "status",
  format: "format",
  weight: "weight",
  packsize: "packSize",
  price: "price",
  "original price": "originalPrice",
  description: "description",
  "long description": "longDescription",
  "roast level": "roastLevel",
  origin: "origin",
  "processing method": "processingMethod",
  "tasting notes": "tastingNotes",
  featured: "featured",
  badge: "badge",

  // YOUR EXACT CSV FORMAT MAPPINGS (UPPERCASE)
  "productName": "productName",     // Already correct camelCase
  "CATEGORY": "category",           // UPPERCASE → lowercase
  "PRICE": "price",                 // UPPERCASE → lowercase  
  "DESCRIPTION": "description",     // UPPERCASE → lowercase
  "FEATURED": "featured",           // UPPERCASE → lowercase
  "ROAST LEVEL": "roastLevel",      // UPPERCASE with space → camelCase
  "ORIGIN": "origin",               // UPPERCASE → lowercase
  "FORMAT": "format",               // UPPERCASE → lowercase
  "WEIGHT": "weight",               // UPPERCASE → lowercase
  "TASTING NOTES": "tastingNotes",  // UPPERCASE with space → camelCase

  // NEW: Shipping column mappings (handle exact format from CSV)
  "Shipping( First Item) ": "shippingFirst",      // Note the trailing space
  "Shipping(Additional Item)": "shippingAdditional",
  "SHIPPING( FIRST ITEM) ": "shippingFirst",      // Uppercase variant
  "SHIPPING(ADDITIONAL ITEM)": "shippingAdditional", // Uppercase variant

  // NEW: Notification column mappings  
  "NOTIFICATION": "notification",                  // UPPERCASE
  "Notification": "notification",                  // Title Case
  "notification": "notification",                  // lowercase

  // ENHANCED: Subscription-specific field mappings
  "SUBSCRIPTION INTERVAL": "subscriptionInterval",
  "Subscription Interval": "subscriptionInterval", 
  "subscription interval": "subscriptionInterval",
  "SUBSCRIPTION PRICE": "subscriptionPrice",
  "Subscription Price": "subscriptionPrice",
  "subscription price": "subscriptionPrice",
  "DELIVERY FREQUENCY": "deliveryFrequency",
  "Delivery Frequency": "deliveryFrequency",
  "delivery frequency": "deliveryFrequency",
  "NOTIFICATION ENABLED": "notificationEnabled",
  "Notification Enabled": "notificationEnabled",
  "notification enabled": "notificationEnabled",

  // Additional variations for flexibility
  "Roast Level": "roastLevel",      // Title Case
  "Tasting Notes": "tastingNotes",  // Title Case
  "Product Name": "productName",    // Title Case
}

export const transformHeader = (header: string): string => {
  const trimmed = header.trim()
  
  console.log('🔧 Header mapping:', `"${trimmed}" →`, headerMapping[trimmed] || `"${trimmed.toLowerCase()}" →`, headerMapping[trimmed.toLowerCase()] || 'unmapped');
  
  // First try exact match (handles your UPPERCASE format)
  if (headerMapping[trimmed]) {
    return headerMapping[trimmed] as string
  }
  
  // Then try lowercase match (handles variations)  
  const lowerHeader = trimmed.toLowerCase()
  return headerMapping[lowerHeader] || lowerHeader
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
