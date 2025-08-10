import { NextRequest, NextResponse } from "next/server"
import { getProducts, getGroupedProducts, getProductsByCategory } from "@/lib/csv-data"
import { revalidatePath } from "next/cache"

export const dynamic = 'force-static'
export const revalidate = 3600

// GET /api/products - Fetch all products from Vercel Blob
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const grouped = searchParams.get('grouped') === 'true'
    const category = searchParams.get('category')
    
    console.log('🔍 API DEBUG: /api/products called');
    console.log('🔍 Request URL:', request.url);
    console.log('🔍 Query params:', { category, grouped });
    console.log('🔍 Environment:', { 
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
      BLOB_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN
    });
    
    // Get raw products from Vercel Blob
    const rawProducts = await getProducts()
    
    console.log('🔍 Raw products from CSV:', rawProducts?.length || 0);
    console.log('🔍 First product sample:', rawProducts?.[0] || 'No products');
    console.log('🔍 Raw products type:', typeof rawProducts);
    console.log('🔍 Is array?', Array.isArray(rawProducts));
    
    // Check if products is actually an array
    if (!Array.isArray(rawProducts)) {
      console.error('❌ Products is not an array:', typeof rawProducts, rawProducts);
      return NextResponse.json({
        products: [],
        count: 0,
        error: 'Products data is not an array',
        debug: { 
          type: typeof rawProducts, 
          value: rawProducts,
          blobToken: !!process.env.BLOB_READ_WRITE_TOKEN
        }
      });
    }
    
    const safeRawProducts = rawProducts
    console.log('🔍 Safe raw products count:', safeRawProducts.length);
    
    if (safeRawProducts.length === 0) {
      console.log("⚠️ API: No products found in Vercel Blob")
      return NextResponse.json({ 
        products: [], 
        count: 0,
        message: "No products found in Blob storage",
        debug: {
          blobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
          csvFetchAttempted: true
        },
        timestamp: new Date().toISOString()
      })
    }

    // Debug all categories present
    const allCategories = safeRawProducts.map(p => p.category).filter(Boolean);
    const uniqueCategories = [...new Set(allCategories)];
    console.log('🔍 All product categories found:', uniqueCategories);
    console.log('🔍 Sample products with categories:', safeRawProducts.slice(0, 3).map(p => ({
      name: p.productName || p.name,
      category: p.category,
      sku: p.sku
    })));

    // Filter by category if specified with null safety
    let filteredProducts = safeRawProducts
    if (category) {
      console.log('🔍 Filtering by category:', category);
      filteredProducts = safeRawProducts.filter(p => {
        const productCategory = p.category?.toLowerCase();
        const targetCategory = category.toLowerCase();
        console.log('🔍 Product category check:', {
          productName: p.productName || p.name,
          productCategory,
          targetCategory,
          matches: productCategory === targetCategory
        });
        return p && p.category && productCategory === targetCategory;
      });
      console.log('🔍 Filtered products count:', filteredProducts.length);
      console.log('🔍 Filtered products sample:', filteredProducts.slice(0, 2));
    }

    // SINGLE-SHOT: Use cached functions instead of manual processing
    let responseData;
    
    if (grouped) {
      // Use getGroupedProducts() - reuses same cached data as pages
      if (category) {
        // For category-specific grouped products, get raw then filter
        const categoryProducts = await getProductsByCategory(category)
        responseData = {
          products: categoryProducts, // These come pre-processed
          count: categoryProducts.length,
          grouped: true,
          category: category,
          timestamp: new Date().toISOString()
        };
      } else {
        // All grouped products
        const groupedProducts = await getGroupedProducts()
        responseData = {
          products: groupedProducts,
          count: groupedProducts.length,
          grouped: true,
          category: 'all',
          timestamp: new Date().toISOString()
        };
      }
    } else {
      // Raw products
      if (category) {
        const categoryProducts = await getProductsByCategory(category)
        responseData = {
          products: categoryProducts,
          count: categoryProducts.length,
          grouped: false,
          category: category,
          timestamp: new Date().toISOString()
        };
      } else {
        responseData = {
          products: rawProducts,
          count: rawProducts.length,
          grouped: false,
          category: 'all',
          timestamp: new Date().toISOString()
        };
      }
    }

    console.log('🔍 SINGLE-SHOT API response:', {
      count: responseData.count,
      grouped: responseData.grouped,
      category: responseData.category
    });
    
    return NextResponse.json(responseData, {
      headers: {
        // ISR-aligned caching headers
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400"
      },
    });

  } catch (error) {
    console.error("❌ API Error fetching products:", error)
    if (error instanceof Error) {
      console.error('❌ Error stack:', error.stack);
    }
    
    // CRITICAL: Always return valid structure even on error
    return NextResponse.json(
      { 
        products: [], // Always provide empty array
        count: 0,
        error: "Failed to fetch products",
        message: error instanceof Error ? error.message : String(error),
        debug: {
          errorType: error instanceof Error ? error.constructor?.name : typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
          blobToken: !!process.env.BLOB_READ_WRITE_TOKEN
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// POST /api/products/revalidate - Trigger revalidation of cached data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paths } = body

    const defaultPaths = [
      "/",
      "/coffee", 
      "/shop",
      "/admin"
    ]

    const pathsToRevalidate = paths || defaultPaths

    console.log("🔄 API: Revalidating paths:", pathsToRevalidate)

    // Revalidate all specified paths
    for (const path of pathsToRevalidate) {
      revalidatePath(path, "layout")
    }

    return NextResponse.json({
      message: "Cache revalidated successfully",
      revalidatedPaths: pathsToRevalidate,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("❌ API Error revalidating cache:", error)
    
    return NextResponse.json(
      { 
        error: "Failed to revalidate cache",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
