import { notFound, redirect } from "next/navigation"
 
import Footer from "@/components/layout/footer"
import ProductDetail from "@/components/product/product-detail"
import ProductRecommendations from "@/components/product/product-recommendations"
import PageTransition from "@/components/ui/page-transition"
import { getGroupedProducts } from "@/lib/csv-data"
import { devLog, buildLog, prodError } from "@/lib/logger"

 // STATIC ISR: Build-safe static generation with 1-hour revalidation
export const dynamic = 'force-static'
export const revalidate = 60
export const dynamicParams = false // prebuild all slugs

interface ProductPageProps {
  params: {
    slug: string
  }
}

// Helper function to generate slug from product name
function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

// Helper function to find product by slug
function findProductBySlug(products: any[], slug: string) {
  return products.find(product => {
    // Try baseSku-based slug first (legacy)
    const baseSkuSlug = product.baseSku?.toLowerCase().replace(/[^a-z0-9]/g, "-")
    if (baseSkuSlug === slug) return true
    
    // Try productName-based slug  
    const nameSlug = generateSlug(product.productName || "")
    if (nameSlug === slug) return true
    
    return false
  })
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    devLog(`🔍 ProductPage: Loading product for slug: ${params.slug}`)
    
    // Check for old SKU-based URLs and redirect to family URLs
    if (params.slug.match(/-wb$|-gr$/i)) {
      const familySlug = params.slug.replace(/-wb$|-gr$/i, '')
      devLog(`🔄 Redirecting old SKU slug ${params.slug} to family slug ${familySlug}`)
      redirect(`/product/${familySlug}`)
    }
    
    // SINGLE-SHOT: Use getGroupedProducts() directly
    const groupedProducts = await getGroupedProducts()

    devLog(`📊 ProductPage: ${groupedProducts.length} grouped products available`)

    if (!groupedProducts || groupedProducts.length === 0) {
      prodError('❌ ProductPage: No grouped products available')
      return (
        <PageTransition>
          <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
          
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold text-[#4B2E2E] mb-4">Product Not Found</h1>
              <p className="text-[#6E6658] mb-8">Unable to load product data. Please try again later.</p>
            </div>
            <Footer />
          </div>
        </PageTransition>
      )
    }

    // Find product by slug
    const product = findProductBySlug(groupedProducts, params.slug)

    if (!product) {
      devLog(`❌ Product not found for slug: ${params.slug}`)
      devLog('Available products:', groupedProducts.map(p => ({
        baseSku: p.baseSku,
        productName: p.productName,
        slug: generateSlug(p.productName || "")
      })))
      notFound()
    }

    buildLog(`✅ Found product: ${product.productName}`)

    // Get related products (same category, different product)
    const relatedProducts = groupedProducts
      .filter(p => p.baseSku !== product.baseSku && p.category === product.category)
      .slice(0, 4)

    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
            

          <main className="relative overflow-hidden pt-24">
            <ProductDetail product={product} />
            {relatedProducts.length > 0 && <ProductRecommendations products={relatedProducts} />}
          </main>

          <Footer />
        </div>
      </PageTransition>
    )
  } catch (error) {
    prodError('❌ ProductPage: Error loading product:', error)
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
          
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Error Loading Product</h1>
            <p className="text-[#6E6658] mb-8">There was an error loading this product. Please try again later.</p>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-sm text-gray-500 mt-4">
                Error: {error instanceof Error ? error.message : 'Unknown error'}
              </div>
            )}
          </div>
          <Footer />
        </div>
      </PageTransition>
    )
  }
}

// SINGLE-SHOT: Generate static params using same cached data
export async function generateStaticParams() {
  try {
    buildLog('🏗️ generateStaticParams: Starting single-shot static generation...')
    
    // SINGLE-SHOT: Reuse the same cached grouped products
    const groupedProducts = await getGroupedProducts()
    
    buildLog('🏗️ generateStaticParams: Generated products:', groupedProducts?.length || 0)
    
    if (!groupedProducts || groupedProducts.length === 0) {
      buildLog('⚠️ generateStaticParams: No products found, returning empty array')
      return []
    }
    
    // Generate slugs from product names and baseSku
    const params = groupedProducts.map((product) => ({
      slug: generateSlug(product.productName || product.baseSku || ""),
    }))
    
    buildLog('🏗️ generateStaticParams: Generated params:', params.length)
    params.forEach((param, i) => {
      devLog(`  ${i + 1}. ${param.slug}`)
    })
    
    return params
    
  } catch (error) {
    prodError('❌ generateStaticParams: Error during static generation:', error)
    // CRITICAL: Always return empty array to prevent build failure
    return []
  }
}
