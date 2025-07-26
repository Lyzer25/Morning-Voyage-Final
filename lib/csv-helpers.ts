import type { Product } from "@/lib/types"

// This mapping helps standardize CSV headers to our internal Product type properties.
// It converts headers to lowercase and maps them to camelCase keys.
const headerMapping: { [key: string]: keyof Product | string } = {
  sku: "sku",
  "product name": "productName",
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
}

export const transformHeader = (header: string): string => {
  const lowerHeader = header.toLowerCase().trim()
  return headerMapping[lowerHeader] || lowerHeader
}
