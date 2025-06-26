import { Suspense } from "react"
import { notFound } from "next/navigation"
import MainLayout from "../../../components/layout/main-layout"
import ProductDetail from "../../../components/products/product-detail"
import ProductGrid from "../../../components/products/product-grid"
import { getProductBySlug, getBestSellerProducts } from "../../../lib/product-service"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return {
      title: "Product Not Found | Morning Voyage",
      description: "The requested product could not be found.",
    }
  }

  return {
    title: `${product.name} | Morning Voyage`,
    description: product.description,
    openGraph: {
      images: [{ url: product.images[0] }],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getBestSellerProducts(4)

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetail product={product} />
        </Suspense>

        <div className="mt-24">
          <h2 className="mb-8 font-serif text-2xl font-bold text-coffee-dark">You May Also Like</h2>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid products={relatedProducts} columns={4} />
          </Suspense>
        </div>
      </div>
    </MainLayout>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="flex space-x-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-20 rounded-md" />
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="mb-4 h-10 w-3/4" />
        <Skeleton className="mb-6 h-8 w-1/4" />
        <Skeleton className="mb-8 h-32 w-full" />
        <Skeleton className="mb-4 h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
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
