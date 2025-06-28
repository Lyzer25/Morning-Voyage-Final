import { NextResponse } from 'next/server'
import { getCachedGroupedProducts, getCacheStatus } from '@/lib/product-cache'
import {
  searchGroupedProducts,
  filterGroupedProductsByCategory,
  filterGroupedProductsByFormat,
} from '@/lib/product-variants'
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler'

// This endpoint serves cached grouped products to end users (no Google Sheets API calls)
export async function GET(request: Request) {
  const requestId = generateRequestId()
  const context = {
    operation: 'fetch_products',
    endpoint: '/api/products',
    requestId,
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const format = searchParams.get('format')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    console.log('🔍 API Request filters:', {
      category,
      format,
      search,
      featured,
      requestId,
    })

    // Get grouped products from cache (no API calls!)
    let products = getCachedGroupedProducts()
    console.log(`📊 Raw cache products: ${products.length}`)

    // Debug: Log first few products
    if (products.length > 0) {
      console.log(`📋 Sample products from cache:`)
      products.slice(0, 3).forEach((product, index) => {
        console.log(
          `   ${index + 1}. ${product.productName} (${product.variants.length} variants: ${product.availableFormats.join(', ')})`
        )
      })
    }

    // Apply filters with validation
    if (category && category !== 'all') {
      const beforeCount = products.length
      if (category === 'coffee') {
        // For coffee category, get all coffee products regardless of subcategory
        products = products.filter(product => product.category === 'coffee')
      } else {
        // For specific subcategories
        products = filterGroupedProductsByCategory(products, category)
      }
      console.log(`🏷️ Category filter (${category}): ${beforeCount} → ${products.length}`)
    }

    if (format && format !== 'all') {
      const beforeCount = products.length
      products = filterGroupedProductsByFormat(products, format)
      console.log(`📦 Format filter (${format}): ${beforeCount} → ${products.length}`)
    }

    if (search) {
      const beforeCount = products.length
      // Sanitize search input
      const sanitizedSearch = search.trim().slice(0, 100) // Limit search length
      if (sanitizedSearch.length > 0) {
        products = searchGroupedProducts(products, sanitizedSearch)
        console.log(`🔍 Search filter (${sanitizedSearch}): ${beforeCount} → ${products.length}`)
      }
    }

    if (featured === 'true') {
      const beforeCount = products.length
      products = products.filter(product => product.featured)
      console.log(`⭐ Featured filter: ${beforeCount} → ${products.length}`)
    }

    const cacheStatus = getCacheStatus()

    console.log(`✅ Returning ${products.length} grouped products`)

    // Use centralized success handler
    return ApiErrorHandler.handleSuccess(
      {
        count: products.length,
        products: products,
        cache: {
          lastSync: cacheStatus.lastSync,
          groupedProductCount: cacheStatus.groupedProductCount,
          rawProductCount: cacheStatus.rawProductCount,
          source: 'cache', // Always from cache for end users
        },
        filters: { category, format, search, featured },
      },
      context
    )
  } catch (error) {
    // Use centralized error handler
    return ApiErrorHandler.handleError(error, {
      ...context,
      additionalContext: {
        query: Object.fromEntries(new URL(request.url).searchParams),
        cacheStatus: getCacheStatus(),
      },
    })
  }
}
