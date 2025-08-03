import type { Product } from "@/lib/types"

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

// Normalize category values for dropdown compatibility
const normalizeCategory = (category: string): string => {
  if (!category) return 'coffee';
  
  const normalized = category.toLowerCase().trim();
  
  // Map your CSV values to dropdown values
  const categoryMap: { [key: string]: string } = {
    'coffee': 'coffee',
    'subscription': 'subscription',
    'gift-set': 'gift-set',
    'gift set': 'gift-set',
    'equipment': 'gift-set'  // Map old equipment to gift-set
  };
  
  return categoryMap[normalized] || 'coffee';
}

// Normalize format values for dropdown compatibility  
const normalizeFormat = (format: string): string => {
  if (!format) return 'whole-bean';
  
  const normalized = format.toLowerCase().trim();
  
  // Map your CSV values to dropdown values
  const formatMap: { [key: string]: string } = {
    'whole bean': 'whole-bean',
    'whole-bean': 'whole-bean',
    'ground': 'ground',
    'instant': 'instant',
    'pods': 'pods',
    'pod': 'pods',
    'k-cup': 'pods',
    'k-cups': 'pods'
  };
  
  return formatMap[normalized] || 'whole-bean';
}

// Normalize roast level values for dropdown compatibility
const normalizeRoastLevel = (roastLevel: string): string => {
  if (!roastLevel) return 'medium';
  
  const normalized = roastLevel.toLowerCase().trim();
  
  // Map variations to dropdown values
  const roastMap: { [key: string]: string } = {
    'light': 'light',
    'medium': 'medium',
    'medium-dark': 'medium-dark',
    'medium dark': 'medium-dark',
    'dark': 'dark'
  };
  
  return roastMap[normalized] || 'medium';
}

// Enhanced CSV data processing for your specific format
export const processCSVData = (rawData: any[]): Product[] => {
  return rawData.map((row: any, index: number) => {
    // Log first few rows for debugging
    if (index < 3) {
      console.log(`🔧 Processing row ${index + 1}:`, row);
    }

    const price = typeof row.price === 'string' ? parseFloat(row.price) || 0 : (row.price || 0);

    // NEW: Process shipping fields with dollar sign removal
    const shippingFirst = row.shippingFirst ? 
      parseFloat(row.shippingFirst.toString().replace('$', '')) : undefined;
    const shippingAdditional = row.shippingAdditional ? 
      parseFloat(row.shippingAdditional.toString().replace('$', '')) : undefined;

    const processed = {
      ...row,
      // CRITICAL: Convert your specific data formats
      price: price,
      
      // AUTO-POPULATE original price from CSV price (as requested)
      originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : price,
      
      // NORMALIZE dropdown values for form compatibility
      category: normalizeCategory(row.category),
      format: normalizeFormat(row.format),
      roastLevel: normalizeRoastLevel(row.roastLevel),
      
      // Handle boolean conversion for FEATURED field
      featured: row.featured === 'TRUE' || row.featured === true || row.featured === 'true' || row.featured === 1,
      
      // Ensure status is set
      status: row.status || 'active',
      
      // ENHANCED tasting notes processing
      tastingNotes: (() => {
        if (!row.tastingNotes) return [];
        
        if (typeof row.tastingNotes === 'string') {
          return row.tastingNotes
            .split(',')
            .map((note: string) => note.trim())
            .filter(Boolean);
        }
        
        return Array.isArray(row.tastingNotes) ? row.tastingNotes : [];
      })(),

      // Initialize empty images array for new products
      images: row.images || [],

      // NEW: Add processed shipping fields
      shippingFirst: (shippingFirst && !isNaN(shippingFirst)) ? shippingFirst : undefined,
      shippingAdditional: (shippingAdditional && !isNaN(shippingAdditional)) ? shippingAdditional : undefined,
    };

    // Log processed result for first few rows
    if (index < 3) {
      console.log(`✅ Processed row ${index + 1}:`, {
        sku: processed.sku,
        productName: processed.productName,
        category: `"${row.category}" → "${processed.category}"`,
        format: `"${row.format}" → "${processed.format}"`,
        roastLevel: `"${row.roastLevel}" → "${processed.roastLevel}"`,
        price: processed.price,
        originalPrice: processed.originalPrice,
        featured: processed.featured,
        tastingNotes: processed.tastingNotes
      });
      
      // Enhanced shipping fields debug logging
      console.log('🚢 Shipping data processed:', {
        raw: { 
          first: row.shippingFirst, 
          additional: row.shippingAdditional 
        },
        parsed: { 
          first: shippingFirst, 
          additional: shippingAdditional 
        },
        final: { 
          first: processed.shippingFirst, 
          additional: processed.shippingAdditional 
        }
      });
    }

    return processed;
  });
}
