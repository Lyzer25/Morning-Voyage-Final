import { notFound } from "next/navigation"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import ProductDetail from "@/components/product/product-detail"
import ProductRecommendations from "@/components/product/product-recommendations"
import PageTransition from "@/components/ui/page-transition"
import { getCachedGroupedProducts } from "@/lib/product-cache"

interface ProductPageProps {
  params: {
    slug: string
  }
}

// FIXED: Convert to async server component
export default async function ProductPage({ params }: ProductPageProps) {
  try {
    console.log(`🔍 ProductPage: Loading product for slug: ${params.slug}`)
    
    // CRITICAL FIX: Properly await the async function
    const products = await getCachedGroupedProducts()

    console.log(`📊 ProductPage: Available products: ${products?.length || 0}`)

    // Add null checks before using the data
    if (!products || !Array.isArray(products)) {
      console.error('❌ ProductPage: No products available or products is not an array')
      return (
        <PageTransition>
          <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
            <Header />
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold text-[#4B2E2E] mb-4">Product Not Found</h1>
              <p className="text-[#6E6658] mb-8">Unable to load product data. Please try again later.</p>
            </div>
            <Footer />
          </div>
        </PageTransition>
      )
    }

    // Find product by slug (match against baseSku or productName)
    const product = products.find((p) => {
      if (!p || !p.baseSku || !p.productName) return false
      
      const baseSkuSlug = p.baseSku.toLowerCase().replace(/[^a-z0-9]/g, "-")
      const nameSlug = p.productName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")

      console.log(`   Checking: ${p.productName} -> baseSkuSlug: ${baseSkuSlug}, nameSlug: ${nameSlug}`)

      return baseSkuSlug === params.slug || nameSlug === params.slug
    })

    if (!product) {
      console.log(`❌ Product not found for slug: ${params.slug}`)
      notFound()
    }

    console.log(`✅ Found product: ${product.productName} with ${product.variants?.length || 0} variants`)

    // Get related products with null safety
    const relatedProducts = products
      .filter((p) => p && p.category === product.category && p.baseSku !== product.baseSku)
      .slice(0, 4)

    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
          <Header />

          <main className="relative overflow-hidden pt-24">
            <ProductDetail product={product} />
            {relatedProducts.length > 0 && <ProductRecommendations products={relatedProducts} />}
          </main>

          <Footer />
        </div>
      </PageTransition>
    )
  } catch (error) {
    console.error('❌ ProductPage: Error loading product:', error)
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
          <Header />
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

// CRITICAL FIX: Properly await async function in generateStaticParams
export async function generateStaticParams() {
  try {
    console.log('🏗️ generateStaticParams: Starting static generation...')
    
    // CRITICAL: Properly await the async function
    const products = await getCachedGroupedProducts()
    
    console.log('🏗️ generateStaticParams: Retrieved products:', products?.length || 0)
    
    // Add comprehensive null checks
    if (!products || !Array.isArray(products)) {
      console.warn('⚠️ generateStaticParams: Products is not an array, returning empty array')
      return []
    }
    
    // Filter only products that have valid data for slug generation
    const validProducts = products.filter(product => 
      product && 
      product.baseSku && 
      typeof product.baseSku === 'string'
    )
    
    console.log('🏗️ generateStaticParams: Valid products with baseSku:', validProducts.length)
    
    const params = validProducts.map((product) => ({
      slug: product.baseSku.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    }))
    
    console.log('🏗️ generateStaticParams: Generated params:', params.length)
    return params
    
  } catch (error) {
    console.error('❌ generateStaticParams: Error during static generation:', error)
    // CRITICAL: Always return empty array to prevent build failure
    return []
  }
}
