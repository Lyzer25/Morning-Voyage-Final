import { getProducts } from "@/lib/csv-data"
import ProductManager from "@/components/admin/product-manager"

export default async function AdminPage() {
  const initialProducts = await getProducts()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        <p className="mt-1 text-gray-600">
          Manage your entire product catalog. Changes will be reflected across the site after a short delay.
        </p>
      </div>
      <ProductManager initialProducts={initialProducts} />
    </div>
  )
}
