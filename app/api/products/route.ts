import { NextRequest, NextResponse } from "next/server"
import { getProducts } from "@/lib/csv-data"
import { groupProductVariants } from "@/lib/product-variants"
import { revalidatePath } from "next/cache"

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

    // Return grouped products if requested (for frontend)
    if (grouped) {
      try {
        console.log('🔍 Attempting to group products...');
        const groupedProducts = groupProductVariants(filteredProducts)
        const safeGroupedProducts = Array.isArray(groupedProducts) ? groupedProducts : []
        
        console.log(`✅ API: Grouped ${filteredProducts.length} raw into ${safeGroupedProducts.length} grouped products`);
        console.log('🔍 Grouped products sample:', safeGroupedProducts.slice(0, 2));
        
        const response = {
          products: safeGroupedProducts,
          count: safeGroupedProducts.length,
          rawCount: filteredProducts.length,
          grouped: true,
          category: category || 'all',
          debug: {
            totalRawProducts: safeRawProducts.length,
            filteredProducts: filteredProducts.length,
            groupedProducts: safeGroupedProducts.length,
            categoriesFound: uniqueCategories,
            requestedCategory: category
          },
          timestamp: new Date().toISOString()
        };
        
        console.log('🔍 Final API response:', {
          count: response.count,
          rawCount: response.rawCount,
          category: response.category,
          hasProducts: response.products.length > 0
        });
        
        return NextResponse.json(response);
      } catch (groupError) {
        console.error("❌ API Error grouping products:", groupError)
        // Fallback to raw products if grouping fails
        return NextResponse.json({
          products: filteredProducts,
          count: filteredProducts.length,
          grouped: false,
          category: category || 'all',
          message: "Grouping failed, returning raw products",
          error: groupError instanceof Error ? groupError.message : String(groupError),
          debug: {
            totalRawProducts: safeRawProducts.length,
            filteredProducts: filteredProducts.length,
            categoriesFound: uniqueCategories
          },
          timestamp: new Date().toISOString()
        })
      }
    }

    // Return raw products (for admin)
    console.log(`✅ API: Returning ${filteredProducts.length} raw products`);
    
    const response = {
      products: filteredProducts,
      count: filteredProducts.length,
      grouped: false,
      category: category || 'all',
      debug: {
        totalRawProducts: safeRawProducts.length,
        filteredProducts: filteredProducts.length,
        categoriesFound: uniqueCategories,
        requestedCategory: category
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('🔍 Final API response (raw):', {
      count: response.count,
      category: response.category,
      hasProducts: response.products.length > 0
    });
    
    return NextResponse.json(response);

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
