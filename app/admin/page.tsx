import { getProducts } from "@/lib/csv-data"
import ProductManager from "@/components/admin/product-manager"

// CRITICAL FIX: Make admin route fully dynamic to prevent build errors
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPage() {
  try {
    // Admin should always get fresh data, never cached
    const initialProducts = await getProducts()
    
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="mt-1 text-gray-600">
            Manage your entire product catalog. Changes will be reflected across the site after deployment.
          </p>
        </div>
        <ProductManager initialProducts={initialProducts} />
      </div>
    )
  } catch (error) {
    console.error('❌ Admin page error:', error)
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h2 className="text-red-800 font-bold">Admin Loading Error</h2>
        <p className="text-red-600">Unable to load admin interface. Please refresh the page.</p>
        <p className="text-sm text-red-500 mt-2">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    )
  }
}
