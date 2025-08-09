import { notFound, redirect } from "next/navigation"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import ProductDetail from "@/components/product/product-detail"
import ProductRecommendations from "@/components/product/product-recommendations"
import PageTransition from "@/components/ui/page-transition"
import { getProducts } from "@/lib/csv-data"
import { groupProductFamilies, findFamilyBySlug, generateFamilySlug, convertFamilyToGroupedProduct } from "@/lib/family-grouping"

interface ProductPageProps {
  params: {
    slug: string
  }
}

// FIXED: Convert to async server component
export default async function ProductPage({ params }: ProductPageProps) {
  try {
    console.log(`🔍 ProductPage: Loading product for slug: ${params.slug}`)
    
    // Check for old SKU-based URLs and redirect to family URLs
    if (params.slug.match(/-wb$|-gr$/i)) {
      const familySlug = params.slug.replace(/-wb$|-gr$/i, '')
      console.log(`🔄 Redirecting old SKU slug ${params.slug} to family slug ${familySlug}`)
      redirect(`/product/${familySlug}`)
    }
    
    // Load all products and group into families
    const allProducts = await getProducts()
    const coffeeProducts = allProducts.filter(p => p.category?.toLowerCase() === 'coffee')
    const productFamilies = groupProductFamilies(coffeeProducts)

    console.log(`📊 ProductPage: ${productFamilies.length} families available`)

    if (!productFamilies || productFamilies.length === 0) {
      console.error('❌ ProductPage: No product families available')
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

    // Find family by slug
    const family = findFamilyBySlug(productFamilies, params.slug)

    if (!family) {
      console.log(`❌ Product family not found for slug: ${params.slug}`)
      notFound()
    }

    console.log(`✅ Found family: ${family.base.productName} with ${family.variants.length} variants`)

    // Convert to GroupedProduct for compatibility with existing ProductDetail component
    const product = convertFamilyToGroupedProduct(family)

    // Get related products from other families
    const relatedFamilies = productFamilies
      .filter(f => f.familyKey !== family.familyKey && f.base.category === family.base.category)
      .slice(0, 4)
      .map(convertFamilyToGroupedProduct)

    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
          <Header />

          <main className="relative overflow-hidden pt-24">
            <ProductDetail product={product} />
            {relatedFamilies.length > 0 && <ProductRecommendations products={relatedFamilies} />}
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

// CRITICAL FIX: Generate static params based on product families
export async function generateStaticParams() {
  try {
    console.log('🏗️ generateStaticParams: Starting family-based static generation...')
    
    // Load products and group into families
    const allProducts = await getProducts()
    const coffeeProducts = allProducts.filter(p => p.category?.toLowerCase() === 'coffee')
    const productFamilies = groupProductFamilies(coffeeProducts)
    
    console.log('🏗️ generateStaticParams: Generated families:', productFamilies?.length || 0)
    
    if (!productFamilies || productFamilies.length === 0) {
      console.warn('⚠️ generateStaticParams: No families found, returning empty array')
      return []
    }
    
    // Generate slugs from family keys
    const params = productFamilies.map((family) => ({
      slug: generateFamilySlug(family.familyKey),
    }))
    
    console.log('🏗️ generateStaticParams: Generated params:', params.length)
    params.forEach((param, i) => {
      console.log(`  ${i + 1}. ${param.slug}`)
    })
    
    return params
    
  } catch (error) {
    console.error('❌ generateStaticParams: Error during static generation:', error)
    // CRITICAL: Always return empty array to prevent build failure
    return []
  }
}
