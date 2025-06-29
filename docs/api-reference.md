# API Reference

This document provides comprehensive API documentation for Morning Voyage's e-commerce platform endpoints.

## Base URL

```
Development: http://localhost:3000
Production: [your-domain.com]
```

## Authentication

Currently, the API does not require authentication for product endpoints. Admin endpoints should be protected in production.

## Response Format

All API responses follow this standard format:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: any
  }
  timestamp: string
  requestId?: string
}
```

## Product Endpoints

### Get Products

Retrieve products with optional filtering and pagination.

```http
GET /api/products
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `category` | string | Filter by category | - |
| `format` | string | Filter by format | - |
| `search` | string | Text search | - |
| `featured` | boolean | Featured products only | - |
| `page` | number | Page number (1-based) | 1 |
| `limit` | number | Products per page | 20 |
| `sort` | string | Sort field | `name` |
| `order` | string | Sort order (`asc`, `desc`) | `asc` |

**Example Request:**

```bash
GET /api/products?category=coffee&format=whole-bean&limit=10
```

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "productName": "Colombia Single Origin",
        "category": "coffee",
        "subcategory": "single-origin",
        "slug": "colombia-single-origin-coffee-single-origin",
        "description": "A great single origin that is mellow and simple...",
        "roastLevel": "medium",
        "origin": "Colombia",
        "weight": "12 oz",
        "tastingNotes": ["Chocolate", "Nuts"],
        "featured": false,
        "variants": [
          {
            "sku": "COFFEE-COLOMBIA-SINGLE-ORIGIN-12OZ-WB",
            "format": "whole-bean",
            "price": 21.6,
            "status": "active"
          },
          {
            "sku": "COFFEE-COLOMBIA-SINGLE-ORIGIN-12OZ-GR",
            "format": "ground",
            "price": 21.6,
            "status": "active"
          }
        ],
        "availableFormats": ["whole-bean", "ground"],
        "priceRange": {
          "min": 21.6,
          "max": 21.6
        },
        "images": {
          "thumbnail": "/placeholder.jpg",
          "gallery": ["/placeholder.jpg"]
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 14,
      "pages": 2
    },
    "filters": {
      "category": "coffee",
      "format": "whole-bean"
    }
  },
  "timestamp": "2025-06-29T02:22:07.100Z",
  "requestId": "req_1751163727098_krbldxn2g"
}
```

**Error Responses:**

```json
{
  "success": false,
  "error": {
    "message": "Invalid category parameter",
    "code": "INVALID_PARAMETER"
  },
  "timestamp": "2025-06-29T02:22:07.100Z"
}
```

### Get Product by Slug

Retrieve a specific product by its slug.

```http
GET /api/products/{slug}
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Product slug |

**Example Request:**

```bash
GET /api/products/colombia-single-origin-coffee-single-origin
```

**Response:**

```json
{
  "success": true,
  "data": {
    "product": {
      "productName": "Colombia Single Origin",
      "category": "coffee",
      "subcategory": "single-origin",
      "slug": "colombia-single-origin-coffee-single-origin",
      "description": "A great single origin that is mellow and simple...",
      "roastLevel": "medium",
      "origin": "Colombia",
      "weight": "12 oz",
      "tastingNotes": ["Chocolate", "Nuts"],
      "featured": false,
      "variants": [...],
      "availableFormats": ["whole-bean", "ground"],
      "priceRange": {
        "min": 21.6,
        "max": 21.6
      },
      "images": {
        "thumbnail": "/placeholder.jpg",
        "gallery": ["/placeholder.jpg"]
      }
    }
  },
  "timestamp": "2025-06-29T02:22:07.100Z"
}
```

### Test Google Sheets Connection

Test the Google Sheets API connection and retrieve sample data.

```http
GET /api/products/test
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Google Sheets connection successful",
    "spreadsheetId": "1ae_meK3lm...",
    "range": "Sheet1!A1:E5",
    "sampleData": [
      ["SKU", "PRODUCT NAME", "CATEGORY", "PRICE", "DESCRIPTION"],
      ["COFFEE-COLOMBIA-SINGLE-ORIGIN-12OZ-WB", "Colombia Single Origin", "COFFEE", "21.60", "A great single origin..."]
    ]
  },
  "timestamp": "2025-06-29T02:22:07.100Z"
}
```

## Admin Endpoints

### Sync Products

Manually trigger a product sync from Google Sheets.

```http
POST /api/admin/sync
```

**Request Body:** None

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Successfully synced 30 products",
    "count": 30,
    "cache": {
      "rawProductCount": 30,
      "groupedProductCount": 14,
      "lastSync": "2025-06-29T02:22:05.000Z",
      "isStale": false,
      "isSyncing": false,
      "nextSyncIn": 299000
    }
  },
  "timestamp": "2025-06-29T02:22:05.000Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "message": "Google Sheets API error: Invalid API key",
    "code": "SHEETS_API_ERROR",
    "details": {
      "status": 400,
      "statusText": "Bad Request"
    }
  },
  "timestamp": "2025-06-29T02:22:05.000Z"
}
```

### Get Cache Status

Check the current cache status and health.

```http
GET /api/admin/cache/status
```

**Response:**

```json
{
  "success": true,
  "data": {
    "cache": {
      "rawProductCount": 30,
      "groupedProductCount": 14,
      "lastSync": "2025-06-29T02:22:05.000Z",
      "isStale": false,
      "isSyncing": false,
      "nextSyncIn": 299000
    },
    "performance": {
      "averageResponseTime": 15,
      "cacheHitRate": 0.95,
      "totalRequests": 1250,
      "errorRate": 0.002
    }
  },
  "timestamp": "2025-06-29T02:22:05.000Z"
}
```

## Webhook Endpoints

### Google Sheets Webhook

Receive notifications when Google Sheets data changes.

```http
POST /api/webhook/sheets
```

**Request Headers:**

```
Content-Type: application/json
X-Webhook-Secret: [your-webhook-secret]
```

**Request Body:**

```json
{
  "eventType": "sheet.updated",
  "spreadsheetId": "1ae_meK3lm...",
  "range": "Sheet1!A:L",
  "timestamp": "2025-06-29T02:22:05.000Z"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Webhook processed successfully",
    "syncTriggered": true
  },
  "timestamp": "2025-06-29T02:22:05.000Z"
}
```

## Error Codes

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_PARAMETER` | Invalid query parameter | 400 |
| `PRODUCT_NOT_FOUND` | Product not found | 404 |
| `SHEETS_API_ERROR` | Google Sheets API error | 500 |
| `CACHE_ERROR` | Cache operation failed | 500 |
| `SYNC_IN_PROGRESS` | Sync already in progress | 409 |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded | 429 |
| `INTERNAL_ERROR` | Internal server error | 500 |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {
      "field": "Additional error details",
      "value": "Invalid value provided"
    }
  },
  "timestamp": "2025-06-29T02:22:07.100Z",
  "requestId": "req_1751163727098_krbldxn2g"
}
```

## Rate Limiting

### Current Limits

- **Product API**: 100 requests per minute per IP
- **Admin API**: 10 requests per minute per IP
- **Webhook API**: 50 requests per minute per IP

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "message": "Rate limit exceeded",
    "code": "RATE_LIMIT_EXCEEDED",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetTime": "2025-06-29T02:23:00.000Z"
    }
  },
  "timestamp": "2025-06-29T02:22:07.100Z"
}
```

## Data Types

### Product Types

```typescript
interface SheetProduct {
  sku: string
  productName: string
  category: string
  subcategory?: string
  status: string
  price: number
  description?: string
  roastLevel?: string
  origin?: string
  weight?: string
  format: string
  tastingNotes?: string[]
  featured: boolean
}

interface GroupedProduct {
  productName: string
  category: string
  subcategory: string
  slug: string
  description: string
  roastLevel: string
  origin: string
  weight: string
  tastingNotes: string[]
  featured: boolean
  variants: SheetProduct[]
  availableFormats: string[]
  priceRange: {
    min: number
    max: number
  }
  images: {
    thumbnail: string
    gallery: string[]
  }
}
```

### Filter Types

```typescript
interface ProductFilters {
  category?: string
  format?: string
  search?: string
  featured?: boolean
  roastLevel?: string
  origin?: string
  priceMin?: number
  priceMax?: number
}

interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}
```

### Cache Types

```typescript
interface CacheStatus {
  rawProductCount: number
  groupedProductCount: number
  lastSync: string
  isStale: boolean
  isSyncing: boolean
  nextSyncIn: number
}

interface PerformanceMetrics {
  averageResponseTime: number
  cacheHitRate: number
  totalRequests: number
  errorRate: number
}
```

## SDKs and Examples

### JavaScript/TypeScript

```typescript
// Product API client
class MorningVoyageAPI {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async getProducts(filters: ProductFilters = {}): Promise<GroupedProduct[]> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value))
      }
    })

    const response = await fetch(`${this.baseUrl}/api/products?${params}`)
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error.message)
    }
    
    return result.data.products
  }

  async getProduct(slug: string): Promise<GroupedProduct> {
    const response = await fetch(`${this.baseUrl}/api/products/${slug}`)
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error.message)
    }
    
    return result.data.product
  }

  async syncProducts(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/admin/sync`, {
      method: 'POST'
    })
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error.message)
    }
  }
}

// Usage
const api = new MorningVoyageAPI('http://localhost:3000')

// Get all coffee products
const coffeeProducts = await api.getProducts({ category: 'coffee' })

// Get specific product
const product = await api.getProduct('colombia-single-origin-coffee-single-origin')

// Trigger sync
await api.syncProducts()
```

### cURL Examples

```bash
# Get all products
curl -X GET "http://localhost:3000/api/products"

# Get coffee products only
curl -X GET "http://localhost:3000/api/products?category=coffee"

# Search for products
curl -X GET "http://localhost:3000/api/products?search=colombia"

# Get specific product
curl -X GET "http://localhost:3000/api/products/colombia-single-origin-coffee-single-origin"

# Trigger product sync
curl -X POST "http://localhost:3000/api/admin/sync"

# Test Google Sheets connection
curl -X GET "http://localhost:3000/api/products/test"
```

### Python Example

```python
import requests
from typing import List, Dict, Optional

class MorningVoyageAPI:
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    def get_products(self, **filters) -> List[Dict]:
        """Get products with optional filters"""
        response = requests.get(
            f"{self.base_url}/api/products",
            params={k: v for k, v in filters.items() if v is not None}
        )
        response.raise_for_status()
        result = response.json()
        
        if not result['success']:
            raise Exception(result['error']['message'])
        
        return result['data']['products']
    
    def get_product(self, slug: str) -> Dict:
        """Get specific product by slug"""
        response = requests.get(f"{self.base_url}/api/products/{slug}")
        response.raise_for_status()
        result = response.json()
        
        if not result['success']:
            raise Exception(result['error']['message'])
        
        return result['data']['product']
    
    def sync_products(self) -> Dict:
        """Trigger product sync"""
        response = requests.post(f"{self.base_url}/api/admin/sync")
        response.raise_for_status()
        result = response.json()
        
        if not result['success']:
            raise Exception(result['error']['message'])
        
        return result['data']

# Usage
api = MorningVoyageAPI('http://localhost:3000')

# Get coffee products
products = api.get_products(category='coffee', format='whole-bean')

# Get specific product
product = api.get_product('colombia-single-origin-coffee-single-origin')

# Sync products
sync_result = api.sync_products()
print(f"Synced {sync_result['count']} products")
```

## Webhooks Integration

### Setting Up Webhooks

1. **Configure Webhook URL** in your Google Apps Script or external service
2. **Set Webhook Secret** for security verification
3. **Handle Webhook Events** in your application

### Webhook Security

```typescript
// Verify webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}
```

## Monitoring & Analytics

### Health Check Endpoint

```http
GET /api/health
```

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": 3600,
    "services": {
      "database": "healthy",
      "googleSheets": "healthy",
      "cache": "healthy"
    }
  },
  "timestamp": "2025-06-29T02:22:07.100Z"
}
```

### Metrics Endpoint

```http
GET /api/metrics
```

**Response:**

```json
{
  "success": true,
  "data": {
    "requests": {
      "total": 1250,
      "success": 1247,
      "errors": 3,
      "averageResponseTime": 15
    },
    "cache": {
      "hitRate": 0.95,
      "missRate": 0.05,
      "size": 14,
      "lastSync": "2025-06-29T02:22:05.000Z"
    },
    "products": {
      "total": 14,
      "byCategory": {
        "coffee": 14
      },
      "byFormat": {
        "whole-bean": 14,
        "ground": 13,
        "pods": 3,
        "instant": 1
      }
    }
  },
  "timestamp": "2025-06-29T02:22:07.100Z"
}
```

This comprehensive API reference provides all the information needed to integrate with the Morning Voyage e-commerce platform, including detailed examples, error handling, and security considerations.
