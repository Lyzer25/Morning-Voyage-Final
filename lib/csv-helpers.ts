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

// Enhanced CSV data processing for your specific format
export const processCSVData = (rawData: any[]): Product[] => {
  return rawData.map((row: any, index: number) => {
    // Log first few rows for debugging
    if (index < 3) {
      console.log(`🔧 Processing row ${index + 1}:`, row);
    }

    const processed = {
      ...row,
      // CRITICAL: Convert your specific data formats
      price: typeof row.price === 'string' ? parseFloat(row.price) || 0 : (row.price || 0),
      originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : undefined,
      
      // Handle boolean conversion for FEATURED field
      featured: row.featured === 'TRUE' || row.featured === true || row.featured === 'true' || row.featured === 1,
      
      // Ensure status is set
      status: row.status || 'active',
      
      // Handle tasting notes (split if comma-separated string)
      tastingNotes: typeof row.tastingNotes === 'string' 
        ? row.tastingNotes.split(',').map((note: string) => note.trim()).filter(Boolean)
        : (Array.isArray(row.tastingNotes) ? row.tastingNotes : []),

      // Initialize empty images array for new products
      images: row.images || []
    };

    // Log processed result for first few rows
    if (index < 3) {
      console.log(`✅ Processed row ${index + 1}:`, {
        sku: processed.sku,
        productName: processed.productName,
        category: processed.category,
        price: processed.price,
        featured: processed.featured,
        tastingNotes: processed.tastingNotes
      });
    }

    return processed;
  });
}
