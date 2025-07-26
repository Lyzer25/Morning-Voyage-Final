import { NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { invalidateCache } from "@/lib/product-cache"

export const dynamic = 'force-dynamic'

// POST /api/admin/sync - Manual sync trigger for emergency revalidation
export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Manual sync triggered from admin panel...")
    
    const body = await request.json().catch(() => ({}))
    const { force = false, paths = [] } = body
    
    // Default paths to revalidate
    const defaultPaths = [
      "/",
      "/coffee", 
      "/shop",
      "/admin"
    ]
    
    const pathsToRevalidate = paths.length > 0 ? paths : defaultPaths
    
    const results = {
      timestamp: new Date().toISOString(),
      revalidatedPaths: [] as string[],
      cacheCleared: false,
      errors: [] as string[],
      vercelEnvironment: !!process.env.VERCEL
    }
    
    // 1. Clear in-memory cache first
    try {
      invalidateCache()
      results.cacheCleared = true
      console.log("✅ In-memory cache cleared")
    } catch (error) {
      console.error("❌ Failed to clear in-memory cache:", error)
      results.errors.push(`Cache clearing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    // 2. Revalidate all specified paths with both page and layout
    for (const path of pathsToRevalidate) {
      try {
        // Revalidate page-level cache
        revalidatePath(path, "page")
        console.log(`✅ Revalidated page: ${path}`)
        
        // Also revalidate layout-level cache for critical paths
        if (["/", "/coffee"].includes(path)) {
          revalidatePath(path, "layout")
          console.log(`✅ Revalidated layout: ${path}`)
        }
        
        results.revalidatedPaths.push(path)
      } catch (error) {
        console.error(`❌ Failed to revalidate path ${path}:`, error)
        results.errors.push(`Path ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    // 3. Add comprehensive cache tags revalidation for Vercel
    try {
      revalidateTag('products')
      revalidateTag('coffee')
      revalidateTag('homepage')
      console.log("✅ Cache tags revalidated")
    } catch (error) {
      console.warn("⚠️ Cache tag revalidation failed:", error)
      // Not critical
    }
    
    // 4. Log success metrics
    const successMessage = `Manual sync completed: ${results.revalidatedPaths.length} paths revalidated, ${results.errors.length} errors`
    console.log(`✅ ${successMessage}`)
    
    const statusCode = results.errors.length > 0 ? 207 : 200 // 207 = Multi-Status
    
    return NextResponse.json({
      success: true,
      message: successMessage,
      results
    }, { status: statusCode })
    
  } catch (error) {
    console.error("❌ Manual sync failed completely:", error)
    
    return NextResponse.json({
      success: false,
      error: "Manual sync failed",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET /api/admin/sync - Get sync status and last sync info
export async function GET() {
  try {
    return NextResponse.json({
      available: true,
      environment: {
        vercel: !!process.env.VERCEL,
        nodeEnv: process.env.NODE_ENV,
        vercelUrl: process.env.VERCEL_URL
      },
      instructions: {
        manual: "POST to this endpoint to trigger manual sync",
        automatic: "Sync is triggered automatically after CSV uploads and product changes"
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: "Failed to get sync status",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
