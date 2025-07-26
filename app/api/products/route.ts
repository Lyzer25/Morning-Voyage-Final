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
    
    console.log("🔄 API: Fetching products from Vercel Blob...")
    
    // Get raw products from Vercel Blob
    const rawProducts = await getProducts()
    
    if (rawProducts.length === 0) {
      console.log("⚠️ API: No products found in Vercel Blob")
      return NextResponse.json({ 
        products: [], 
        message: "No products found",
        timestamp: new Date().toISOString()
      })
    }

    // Filter by category if specified
    let filteredProducts = rawProducts
    if (category) {
      filteredProducts = rawProducts.filter(p => p.category === category)
    }

    // Return grouped products if requested (for frontend)
    if (grouped) {
      const groupedProducts = groupProductVariants(filteredProducts)
      console.log(`✅ API: Returning ${groupedProducts.length} grouped products`)
      
      return NextResponse.json({
        products: groupedProducts,
        count: groupedProducts.length,
        rawCount: filteredProducts.length,
        timestamp: new Date().toISOString()
      })
    }

    // Return raw products (for admin)
    console.log(`✅ API: Returning ${filteredProducts.length} raw products`)
    
    return NextResponse.json({
      products: filteredProducts,
      count: filteredProducts.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("❌ API Error fetching products:", error)
    
    return NextResponse.json(
      { 
        error: "Failed to fetch products",
        message: error instanceof Error ? error.message : "Unknown error",
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
