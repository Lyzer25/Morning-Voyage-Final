# Google Sheets API Integration Guide

This document covers the comprehensive Google Sheets API integration for Morning Voyage's product management system.

## Overview

Morning Voyage uses Google Sheets as a centralized product management system, allowing non-technical team members to easily update product information, pricing, and inventory. The system automatically syncs this data to the e-commerce platform.

## Architecture

```
Google Sheets ←→ Google Sheets API ←→ Next.js API Routes ←→ Product Cache ←→ Frontend
```

### Key Components

1. **Google Sheets Spreadsheet**: Central product database
2. **Google Sheets API v4**: RESTful API for reading spreadsheet data
3. **Integration Layer** (`lib/google-sheets-integration.ts`): API wrapper and data transformation
4. **Admin Sync Endpoint** (`app/api/admin/sync/route.ts`): Triggers product sync
5. **Product Cache** (`lib/product-cache.ts`): In-memory caching for performance
6. **Variant Grouping** (`lib/product-variants.ts`): Groups products by format variants

## Google Sheets Setup

### Spreadsheet Structure

The Google Sheets spreadsheet must follow this exact column structure:

| Column | Field Name | Description | Required | Example |
|--------|------------|-------------|----------|---------|
| A | SKU | Unique product identifier | ✅ | `COFFEE-COLOMBIA-SINGLE-ORIGIN-12OZ-WB` |
| B | PRODUCT NAME | Display name for the product | ✅ | `Colombia Single Origin` |
| C | CATEGORY | Product category | ✅ | `COFFEE` |
| D | PRICE | Product price (USD) | ✅ | `21.60` |
| E | DESCRIPTION | Product description | ❌ | `A great single origin...` |
| F | STATUS | Product status | ❌ | `active`, `inactive` |
| G | FEATURED | Featured product flag | ❌ | `TRUE`, `FALSE` |
| H | ROAST LEVEL | Coffee roast level | ❌ | `medium`, `dark`, `light` |
| I | ORIGIN | Coffee origin/region | ❌ | `Colombia`, `Ethiopia` |
| J | FORMAT | Product format | ❌ | `whole-bean`, `ground`, `pods` |
| K | WEIGHT | Product weight | ❌ | `12 oz`, `1 lb` |
| L | TASTING NOTES | Flavor notes | ❌ | `Chocolate, Caramel, Nuts` |

### Sample Data Structure

```
Row 1 (Headers): SKU | PRODUCT NAME | CATEGORY | PRICE | DESCRIPTION | STATUS | FEATURED | ROAST LEVEL | ORIGIN | FORMAT | WEIGHT | TASTING NOTES
Row 2: COFFEE-COLOMBIA-SINGLE-ORIGIN-12OZ-WB | Colombia Single Origin | COFFEE | 21.60 | A great single origin... | active | FALSE | medium | Colombia | whole-bean | 12 oz | Chocolate, Nuts
Row 3: COFFEE-COLOMBIA-SINGLE-ORIGIN-12OZ-GR | Colombia Single Origin | COFFEE | 21.60 | A great single origin... | active | FALSE | medium | Colombia | ground | 12 oz | Chocolate, Nuts
```

### Format Variants

Products with the same name but different formats are automatically grouped:

- **Base Product**: `Colombia Single Origin`
- **Variants**: 
  - `COFFEE-COLOMBIA-SINGLE-ORIGIN-12OZ-WB` (whole-bean)
  - `COFFEE-COLOMBIA-SINGLE-ORIGIN-12OZ-GR` (ground)

## API Configuration

### Environment Variables

Set these in your `.env.local` file:

```bash
# Google Sheets Configuration
GOOGLE_SHEETS_API_KEY=AIzaSyD...your-api-key
GOOGLE_SHEETS_SPREADSHEET_ID=1ae_meK3lm...your-spreadsheet-id

# Optional: Custom range (defaults to all data)
GOOGLE_SHEETS_RANGE=Sheet1!A:L
```

### Getting API Credentials

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google Sheets API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

3. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
   - (Optional) Restrict the API key to Google Sheets API only

4. **Get Spreadsheet ID**
   - Open your Google Sheets document
   - Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

5. **Set Sharing Permissions**
   - Make the spreadsheet "Anyone with the link can view"
   - Or share with the service account email if using service account auth

## Integration Implementation

### Core Integration (`lib/google-sheets-integration.ts`)

```typescript
// Fetch products from Google Sheets
export async function fetchProductsFromSheets(): Promise<SheetProduct[]> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY!
  const range = process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A:L'
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
  
  const response = await fetch(url)
  const data = await response.json()
  
  return transformRawData(data.values)
}
```

### Data Transformation

Raw Google Sheets data is transformed into typed product objects:

```typescript
function transformRawData(rows: string[][]): SheetProduct[] {
  const [headers, ...dataRows] = rows
  
  return dataRows.map(row => ({
    sku: row[0],
    productName: row[1],
    category: row[2],
    price: parseFloat(row[3]) || 0,
    description: row[4] || '',
    status: row[5] || 'active',
    featured: row[6]?.toLowerCase() === 'true',
    roastLevel: row[7] || '',
    origin: row[8] || '',
    format: extractFormat(row[0]), // Extract from SKU
    weight: row[10] || '',
    tastingNotes: row[11]?.split(',').map(note => note.trim()) || []
  }))
}
```

### Format Detection

The system automatically detects product formats from SKU patterns:

```typescript
function extractFormat(sku: string): string {
  if (sku.includes('-WB')) return 'whole-bean'
  if (sku.includes('-GR')) return 'ground'
  if (sku.includes('-PODS')) return 'pods'
  if (sku.includes('-INST')) return 'instant'
  return 'whole-bean' // default
}
```

## Sync Process

### Manual Sync

Trigger sync from the admin dashboard:

1. Navigate to `/admin`
2. Click "Sync Products" button
3. Monitor sync status and results

### API Endpoint

```bash
POST /api/admin/sync
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully synced 30 products",
  "count": 30,
  "cache": {
    "rawProductCount": 30,
    "groupedProductCount": 14,
    "lastSync": "2025-06-29T02:22:05.000Z",
    "isStale": false,
    "isSyncing": false,
    "nextSyncIn": 299000
  },
  "timestamp": "2025-06-29T02:22:05.000Z"
}
```

### Sync Flow

1. **API Call**: `POST /api/admin/sync`
2. **Fetch Data**: Call Google Sheets API
3. **Transform**: Convert raw data to typed objects
4. **Filter**: Remove inactive products
5. **Group Variants**: Combine same products with different formats
6. **Cache Update**: Store in memory cache
7. **Response**: Return sync results

## Product Variant Grouping

### How It Works

Products with identical names are automatically grouped by format variants:

**Input (Raw Products):**
```
- High Lakes (whole-bean) - $21.60
- High Lakes (ground) - $21.60  
- High Lakes (pods) - $21.60
```

**Output (Grouped Product):**
```json
{
  "productName": "High Lakes",
  "category": "coffee",
  "slug": "high-lakes-coffee-coffee",
  "variants": [
    { "sku": "COFFEE-HIGH-LAKES-12OZ-WB", "format": "whole-bean", "price": 21.60 },
    { "sku": "COFFEE-HIGH-LAKES-12OZ-GR", "format": "ground", "price": 21.60 },
    { "sku": "COFFEE-HIGH-LAKES-12PK-PODS", "format": "pods", "price": 21.60 }
  ],
  "availableFormats": ["whole-bean", "ground", "pods"],
  "priceRange": { "min": 21.60, "max": 21.60 }
}
```

### Grouping Logic

```typescript
export function groupProductVariants(products: SheetProduct[]): GroupedProduct[] {
  const groupMap = new Map<string, GroupedProduct>()
  
  products.forEach(product => {
    const baseKey = createProductKey(product.productName, product.category)
    
    if (groupMap.has(baseKey)) {
      // Add variant to existing group
      const group = groupMap.get(baseKey)!
      group.variants.push(product)
      group.availableFormats.push(product.format)
    } else {
      // Create new group
      groupMap.set(baseKey, createNewGroup(product))
    }
  })
  
  return Array.from(groupMap.values())
}
```

## Caching System

### Cache Management

- **Storage**: In-memory cache for development, Redis recommended for production
- **Duration**: 5 minutes default TTL
- **Invalidation**: Manual sync or automatic refresh
- **Fallback**: Sample data if Google Sheets unavailable

### Cache Status

Monitor cache status via `/api/admin/sync` response:

```json
{
  "cache": {
    "rawProductCount": 30,
    "groupedProductCount": 14,
    "lastSync": "2025-06-29T02:22:05.000Z",
    "isStale": false,
    "isSyncing": false,
    "nextSyncIn": 299000
  }
}
```

## Error Handling

### Common Issues & Solutions

1. **API Key Invalid**
   ```
   Error: 400 Bad Request - API key not valid
   Solution: Check GOOGLE_SHEETS_API_KEY in .env.local
   ```

2. **Spreadsheet Not Found**
   ```
   Error: 404 Not Found - Requested entity was not found
   Solution: Verify GOOGLE_SHEETS_SPREADSHEET_ID and sharing permissions
   ```

3. **Rate Limiting**
   ```
   Error: 429 Too Many Requests
   Solution: Implement exponential backoff, currently handled automatically
   ```

4. **Invalid Data Format**
   ```
   Error: Product transformation failed
   Solution: Check spreadsheet column structure matches expected format
   ```

### Error Recovery

The system includes automatic error recovery:

- **Retry Logic**: 3 attempts with exponential backoff
- **Fallback Data**: Uses cached data if sync fails
- **Error Logging**: Detailed error logs for debugging
- **Graceful Degradation**: Site continues functioning with last known data

## Performance Considerations

### Optimization Strategies

1. **Caching**: Aggressive in-memory caching reduces API calls
2. **Batch Processing**: Single API call fetches all data
3. **Data Transformation**: Optimized parsing and grouping
4. **Error Handling**: Fast failure and recovery
5. **Background Sync**: Non-blocking sync operations

### Monitoring

Track these metrics:

- **Sync Duration**: Time to complete full sync
- **API Response Time**: Google Sheets API latency  
- **Cache Hit Rate**: Percentage of requests served from cache
- **Error Rate**: Failed sync attempts
- **Data Freshness**: Time since last successful sync

### Scaling Considerations

For high-traffic production:

1. **Redis Cache**: Replace in-memory cache with Redis
2. **Background Jobs**: Move sync to background queue
3. **CDN**: Cache API responses at edge locations
4. **Service Account**: Use service account for higher rate limits
5. **Webhooks**: Real-time updates via Google Apps Script

## Security Best Practices

1. **API Key Management**
   - Store in environment variables only
   - Use restricted API keys
   - Rotate keys regularly

2. **Access Control**
   - Limit spreadsheet access to necessary users
   - Use service accounts for production
   - Monitor access logs

3. **Data Validation**
   - Validate all incoming data
   - Sanitize user inputs
   - Type checking with TypeScript

4. **Error Information**
   - Don't expose API keys in error messages
   - Log errors securely
   - Sanitize error responses

## Testing

### Test Endpoints

```bash
# Test basic connection
GET /api/products/test

# Manual sync
POST /api/admin/sync

# Check cache status
GET /api/products?debug=true
```

### Sample Test Data

For development/testing, ensure your sheet has:

```
SKU,PRODUCT NAME,CATEGORY,PRICE,DESCRIPTION,STATUS,FEATURED,ROAST LEVEL,ORIGIN,FORMAT,WEIGHT,TASTING NOTES
COFFEE-TEST-001-WB,Test Coffee,COFFEE,19.99,Test description,active,FALSE,medium,Test Origin,whole-bean,12 oz,Test Notes
COFFEE-TEST-001-GR,Test Coffee,COFFEE,19.99,Test description,active,FALSE,medium,Test Origin,ground,12 oz,Test Notes
```

This will create a grouped product "Test Coffee" with 2 variants for testing the variant grouping system.
