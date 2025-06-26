import { NextResponse } from "next/server"
import { fetchProductsFromSheet } from "@/lib/google-sheets-integration"
import { updateProductCache, setSyncingStatus, getCacheStatus } from "@/lib/product-cache"

// Admin-only endpoint for syncing with Google Sheets
export async function POST(request: Request) {
  try {
    // Verify this is an admin request (you can add authentication here)
    const authHeader = request.headers.get("authorization")
    // For now, we'll allow any request, but you can add admin auth here

    console.log("🔄 Admin sync started...")
    setSyncingStatus(true)

    // Fetch products from Google Sheets
    const products = await fetchProductsFromSheet()
    console.log(`📊 Fetched ${products.length} products from Google Sheets`)

    // Update the cache (this will also create grouped products)
    updateProductCache(products)

    setSyncingStatus(false)

    const cacheStatus = getCacheStatus()
    console.log(`✅ Sync completed - Raw: ${cacheStatus.rawProductCount}, Grouped: ${cacheStatus.groupedProductCount}`)

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${products.length} products`,
      count: products.length,
      cache: cacheStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Admin sync error:", error)
    setSyncingStatus(false)
    return NextResponse.json(
      {
        success: false,
        error: "Sync failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Get sync status
export async function GET() {
  try {
    const cacheStatus = getCacheStatus()
    return NextResponse.json({
      success: true,
      cache: cacheStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error getting sync status:", error)
    return NextResponse.json({ success: false, error: "Failed to get status" }, { status: 500 })
  }
}
