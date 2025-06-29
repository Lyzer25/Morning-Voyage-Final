# Product Management System

This document covers the comprehensive product management system for Morning Voyage, including product data structures, variant management, and cache operations.

## Overview

Morning Voyage's product management system is designed to handle complex coffee product variants while maintaining performance and data consistency. The system supports automatic variant grouping, intelligent caching, and real-time synchronization with Google Sheets.

## Product Data Structure

### Raw Product (`SheetProduct`)

Raw products are individual entries from Google Sheets before variant grouping:

```typescript
interface SheetProduct {
  sku: string                    // Unique identifier: "COFFEE-COLOMBIA-SINGLE-ORIGIN-12OZ-WB"
  productName: string           // Display name: "Colombia Single Origin"
  category: string              // Product category: "coffee"
  subcategory?: string          // Derived from name/origin
  status: string                // "active" | "inactive"
  price: number                 // Price in USD: 21.60
  description?: string          // Product description
  roastLevel?: string           // "light" | "medium" | "dark"
  origin?: string               // Coffee origin: "Colombia"
  weight?: string               // Package weight: "12 oz"
  format: string                // "whole-bean" | "ground" | "pods" | "instant"
  tastingNotes?: string[]       // ["Chocolate", "Caramel", "Nuts"]
  featured: boolean             // Featured product flag
}
```

### Grouped Product (`GroupedProduct`)

Grouped products combine variants of the same coffee:

```typescript
interface GroupedProduct {
  productName: string           // Base product name
  category: string              // Product category
  subcategory: string           // Derived subcategory
  slug: string                  // URL-friendly identifier
  description: string           // Product description
  roastLevel: string            // Primary roast level
  origin: string                // Coffee origin
  weight: string                // Package weight
  tastingNotes: string[]        // Flavor notes
  featured: boolean             // Featured status
  variants: SheetProduct[]      // All format variants
  availableFormats: string[]    // Available formats
  priceRange: {                 // Price range across variants
    min: number
    max: number
  }
  images: {                     // Product images
    thumbnail: string
    gallery: string[]
  }
}
```

## Variant Management

### Format Types

The system supports these coffee formats:

1. **Whole Bean** (`whole-bean`)
   - SKU Pattern: `*-WB`
   - Description: Whole coffee beans for grinding at home
   - Typical Weight: 12 oz, 1 lb, 2 lb

2. **Ground** (`ground`)
   - SKU Pattern: `*-GR`
   - Description: Pre-ground coffee ready for brewing
   - Typical Weight: 12 oz, 1 lb

3. **Pods** (`pods`)
   - SKU Pattern: `*-PODS`
   - Description: Coffee pods for single-serve machines
   - Typical Weight: 12-pack, 24-pack

4. **Instant** (`instant`)
   - SKU Pattern: `*-INST`
   - Description: Instant coffee for quick preparation
   - Typical Weight: 6-pack, individual packets

### Grouping Algorithm

Products are grouped by matching product names:

```typescript
function groupProductVariants(products: SheetProduct[]): GroupedProduct[] {
  const groupMap = new Map<string, GroupedProduct>()
  
  products.forEach(product => {
    // Create unique key from product name and category
    const baseKey = createProductKey(product.productName, product.category)
    
    if (groupMap.has(baseKey)) {
      // Add variant to existing group
      addVariantToGroup(groupMap.get(baseKey)!, product)
    } else {
      // Create new product group
      groupMap.set(baseKey, createProductGroup(product))
    }
  })
  
  return Array.from(groupMap.values())
}
```

### Key Generation

Product keys ensure consistent grouping:

```typescript
function createProductKey(productName: string, category: string): string {
  const cleanName = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
  
  return `${cleanName}-${category.toLowerCase()}`
}
```

### Example Grouping

**Input Products:**
```
1. Colombia Single Origin (whole-bean) - $21.60
2. Colombia Single Origin (ground) - $21.60
3. High Lakes (whole-bean) - $21.60
4. High Lakes (ground) - $21.60
5. High Lakes (pods) - $21.60
```

**Output Groups:**
```
Group 1: Colombia Single Origin
  - Variants: 2 (whole-bean, ground)
  - Price Range: $21.60 - $21.60

Group 2: High Lakes
  - Variants: 3 (whole-bean, ground, pods)
  - Price Range: $21.60 - $21.60
```

## Product Categories

### Coffee Products

- **Single Origin**: Single-farm or single-region coffees
- **Blends**: Custom blends of multiple origins
- **Decaf**: Decaffeinated coffee options
- **Seasonal**: Limited-time seasonal offerings
- **Specialty**: Unique processing methods or rare varieties

### Subcategory Generation

Subcategories are automatically derived from product characteristics:

```typescript
function deriveSubcategory(product: SheetProduct): string {
  const name = product.productName.toLowerCase()
  
  if (name.includes('single origin')) return 'single-origin'
  if (name.includes('blend')) return 'blend'
  if (name.includes('decaf')) return 'decaf'
  if (name.includes('seasonal')) return 'seasonal'
  if (product.roastLevel) return product.roastLevel + '-roast'
  
  return 'specialty'
}
```

## Cache Management

### Cache Architecture

```
Google Sheets → Raw Products → Variant Grouping → Grouped Cache → API Response
```

### Cache Operations

1. **Initialize**: Load sample data on first run
2. **Sync**: Replace with Google Sheets data
3. **Serve**: Return cached grouped products
4. **Refresh**: Automatic refresh based on TTL

### Cache Implementation

```typescript
// Cache storage
let productCache: SheetProduct[] = []
let groupedProductCache: GroupedProduct[] = []
let lastSyncTime = 0

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

// Update cache with new products
export function updateProductCache(products: SheetProduct[]): void {
  if (products.length > 0) {
    productCache = products
    groupedProductCache = groupProductVariants(products)
    lastSyncTime = Date.now()
  }
}

// Get products from cache
export function getCachedGroupedProducts(): GroupedProduct[] {
  return groupedProductCache
}

// Check if cache is stale
export function isCacheStale(): boolean {
  return Date.now() - lastSyncTime > CACHE_DURATION
}
```

### Cache Status Monitoring

Track cache health with these metrics:

```typescript
interface CacheStatus {
  rawProductCount: number      // Number of raw products
  groupedProductCount: number  // Number of grouped products
  lastSync: string            // Last sync timestamp
  isStale: boolean            // Whether cache needs refresh
  isSyncing: boolean          // Currently syncing
  nextSyncIn: number          // Milliseconds until auto-refresh
}
```

## Product Filtering & Search

### Filter Options

The API supports these filters:

```typescript
interface ProductFilters {
  category?: string           // Filter by category
  format?: string            // Filter by format
  search?: string            // Text search
  featured?: boolean         // Featured products only
  roastLevel?: string        // Filter by roast level
  origin?: string            // Filter by origin
  priceMin?: number          // Minimum price
  priceMax?: number          // Maximum price
}
```

### Search Implementation

```typescript
function filterProducts(
  products: GroupedProduct[],
  filters: ProductFilters
): GroupedProduct[] {
  return products.filter(product => {
    // Category filter
    if (filters.category && product.category !== filters.category) {
      return false
    }
    
    // Format filter
    if (filters.format && !product.availableFormats.includes(filters.format)) {
      return false
    }
    
    // Text search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const searchableText = [
        product.productName,
        product.description,
        product.origin,
        ...product.tastingNotes
      ].join(' ').toLowerCase()
      
      if (!searchableText.includes(searchTerm)) {
        return false
      }
    }
    
    // Featured filter
    if (filters.featured !== undefined && product.featured !== filters.featured) {
      return false
    }
    
    // Price range filter
    if (filters.priceMin && product.priceRange.max < filters.priceMin) {
      return false
    }
    if (filters.priceMax && product.priceRange.min > filters.priceMax) {
      return false
    }
    
    return true
  })
}
```

## Product URLs & Slugs

### Slug Generation

Product slugs are URL-friendly identifiers:

```typescript
function generateProductSlug(product: SheetProduct): string {
  const baseName = product.productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
  
  const category = product.category.toLowerCase()
  const subcategory = deriveSubcategory(product)
  
  return `${baseName}-${category}-${subcategory}`
}
```

### URL Structure

Product URLs follow this pattern:

```
/product/[slug]
```

Examples:
- `/product/colombia-single-origin-coffee-single-origin`
- `/product/high-lakes-coffee-specialty`
- `/product/cascades-blend-coffee-blend`

## Product Images

### Image Management

Currently using placeholder images with planned integration:

```typescript
interface ProductImages {
  thumbnail: string    // Main product image
  gallery: string[]    // Additional product images
}

// Default image structure
const defaultImages: ProductImages = {
  thumbnail: '/placeholder.jpg',
  gallery: ['/placeholder.jpg']
}
```

### Future Image Integration

Planned features:
1. **Google Drive Integration**: Store images in Google Drive
2. **CDN Delivery**: Optimize image delivery
3. **Multiple Formats**: Support WebP, AVIF formats
4. **Responsive Images**: Multiple sizes for different devices

## Product Analytics

### Tracking Metrics

Monitor these product-related metrics:

1. **Inventory Metrics**
   - Total products
   - Products by category
   - Variant distribution
   - Featured product ratio

2. **Performance Metrics**
   - Cache hit rate
   - Sync performance
   - Search response time
   - Filter usage

3. **Business Metrics**
   - Popular products
   - Search terms
   - Category performance
   - Price range analysis

### Sample Analytics Data

```typescript
interface ProductAnalytics {
  totalProducts: number
  totalVariants: number
  categoryBreakdown: Record<string, number>
  formatBreakdown: Record<string, number>
  averagePrice: number
  priceRange: { min: number; max: number }
  featuredCount: number
  cacheHitRate: number
  syncFrequency: number
}
```

## Error Handling

### Common Product Issues

1. **Missing Required Fields**
   ```typescript
   // Validation function
   function validateProduct(product: SheetProduct): string[] {
     const errors: string[] = []
     
     if (!product.sku) errors.push('SKU is required')
     if (!product.productName) errors.push('Product name is required')
     if (!product.category) errors.push('Category is required')
     if (!product.price || product.price <= 0) errors.push('Valid price is required')
     
     return errors
   }
   ```

2. **Duplicate SKUs**
   - System checks for duplicate SKUs during sync
   - Last occurrence takes precedence
   - Warning logged for duplicates

3. **Invalid Format Detection**
   - Falls back to 'whole-bean' if format cannot be determined
   - Logs warning for unrecognized SKU patterns

4. **Price Inconsistencies**
   - Validates price ranges within product groups
   - Logs warnings for significant price differences

## Best Practices

### Product Data Management

1. **Consistent Naming**: Use consistent product names for proper grouping
2. **SKU Patterns**: Follow established SKU naming conventions
3. **Complete Data**: Fill all relevant fields for better user experience
4. **Price Alignment**: Keep variant prices consistent or logically different
5. **Status Management**: Use status field to control product visibility

### Performance Optimization

1. **Cache Strategy**: Leverage caching for better performance
2. **Efficient Filtering**: Use indexed filtering where possible
3. **Batch Operations**: Process products in batches for better memory usage
4. **Lazy Loading**: Load product details on demand

### Data Quality

1. **Regular Audits**: Review product data regularly
2. **Automated Validation**: Use validation rules to catch errors
3. **Test Data**: Maintain test products for development
4. **Backup Strategy**: Keep backups of product data

## Integration Points

### Shopify Integration

Future integration with Shopify will include:

```typescript
interface ShopifyProduct {
  id: string
  title: string
  variants: ShopifyVariant[]
  images: ShopifyImage[]
  status: 'active' | 'draft' | 'archived'
}

// Sync function to Shopify
async function syncToShopify(products: GroupedProduct[]): Promise<void> {
  for (const product of products) {
    await createOrUpdateShopifyProduct(product)
  }
}
```

### Inventory Management

Integration with inventory systems:

```typescript
interface InventoryData {
  sku: string
  quantity: number
  lowStockThreshold: number
  lastUpdated: Date
}

// Check inventory levels
function checkInventoryLevels(products: SheetProduct[]): InventoryAlert[] {
  // Implementation for inventory monitoring
  return []
}
```

This comprehensive product management system provides the foundation for a scalable, maintainable e-commerce platform while supporting complex product variants and real-time data synchronization.
