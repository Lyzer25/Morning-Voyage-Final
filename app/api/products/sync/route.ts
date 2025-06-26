import { NextResponse } from "next/server"
import { getCachedProducts } from "@/lib/google-sheets-integration"

export async function GET() {
  try {
    const products = await getCachedProducts()

    return NextResponse.json({
      success: true,
      count: products.length,
      products: products,
      lastSync: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error syncing products:", error)
    return NextResponse.json({ success: false, error: "Failed to sync products" }, { status: 500 })
  }
}
