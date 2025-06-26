import { Suspense } from "react"
import MainLayout from "../../components/layout/main-layout"
import ProductGrid from "../../components/products/product-grid"
import { getAllProducts } from "../../lib/product-service"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Shop | Morning Voyage",
  description: "Browse our selection of premium coffee products and merchandise.",
}

export default async function ShopPage() {
  const products = await getAllProducts()

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 font-serif text-3xl font-bold text-coffee-dark">Shop All Products</h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Filters sidebar */}
          <div className="md:col-span-1">
            <div className="sticky top-24 rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 font-serif text-xl font-semibold text-coffee-dark">Categories</h2>
              <ul className="space-y-2">
                <li>
                  <a href="/shop/coffee" className="text-coffee-medium hover:text-coffee-dark">
                    Coffee Beans
                  </a>
                </li>
                <li>
                  <a href="/shop/equipment" className="text-coffee-medium hover:text-coffee-dark">
                    Equipment
                  </a>
                </li>
                <li>
                  <a href="/shop/merchandise" className="text-coffee-medium hover:text-coffee-dark">
                    Merchandise
                  </a>
                </li>
                <li>
                  <a href="/shop/gift-cards" className="text-coffee-medium hover:text-coffee-dark">
                    Gift Cards
                  </a>
                </li>
              </ul>

              <h2 className="mb-4 mt-8 font-serif text-xl font-semibold text-coffee-dark">Price Range</h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="price-1"
                    className="h-4 w-4 rounded border-gray-300 text-coffee-dark focus:ring-coffee-dark"
                  />
                  <label htmlFor="price-1" className="ml-2 text-sm text-gray-600">
                    Under $25
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="price-2"
                    className="h-4 w-4 rounded border-gray-300 text-coffee-dark focus:ring-coffee-dark"
                  />
                  <label htmlFor="price-2" className="ml-2 text-sm text-gray-600">
                    $25 - $50
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="price-3"
                    className="h-4 w-4 rounded border-gray-300 text-coffee-dark focus:ring-coffee-dark"
                  />
                  <label htmlFor="price-3" className="ml-2 text-sm text-gray-600">
                    $50 - $100
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="price-4"
                    className="h-4 w-4 rounded border-gray-300 text-coffee-dark focus:ring-coffee-dark"
                  />
                  <label htmlFor="price-4" className="ml-2 text-sm text-gray-600">
                    Over $100
                  </label>
                </div>
              </div>

              <h2 className="mb-4 mt-8 font-serif text-xl font-semibold text-coffee-dark">Roast Level</h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="roast-1"
                    className="h-4 w-4 rounded border-gray-300 text-coffee-dark focus:ring-coffee-dark"
                  />
                  <label htmlFor="roast-1" className="ml-2 text-sm text-gray-600">
                    Light
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="roast-2"
                    className="h-4 w-4 rounded border-gray-300 text-coffee-dark focus:ring-coffee-dark"
                  />
                  <label htmlFor="roast-2" className="ml-2 text-sm text-gray-600">
                    Medium
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="roast-3"
                    className="h-4 w-4 rounded border-gray-300 text-coffee-dark focus:ring-coffee-dark"
                  />
                  <label htmlFor="roast-3" className="ml-2 text-sm text-gray-600">
                    Dark
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Products grid */}
          <div className="md:col-span-3">
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid products={products} columns={3} />
            </Suspense>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
          <Skeleton className="aspect-square w-full" />
          <div className="p-4">
            <Skeleton className="mb-2 h-6 w-3/4" />
            <Skeleton className="mb-4 h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
