import { notFound } from 'next/navigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import ProductDetail from '@/components/product/product-detail'
import ProductRecommendations from '@/components/product/product-recommendations'
import PageTransition from '@/components/ui/page-transition'
import { getCachedGroupedProducts } from '@/lib/product-cache'
import { generateProductSlug } from '@/lib/product-variants'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Await params to fix Next.js dynamic route warning
  const { slug } = await params
  
  // Get grouped products from persistent cache
  const products = getCachedGroupedProducts()

  console.log(`🔍 Looking for product with slug: ${slug}`)
  console.log(`📊 Available products: ${products.length}`)

  // Find product by slug using consistent slug generation
  const product = products.find(p => {
    const productSlug = generateProductSlug(p.baseSku)
    
    console.log(`   Checking: ${p.productName} -> slug: ${productSlug}`)
    
    return productSlug === slug
  })

  if (!product) {
    console.log(`❌ Product not found for slug: ${slug}`)
    console.log(`📋 Available slugs: ${products.map(p => generateProductSlug(p.baseSku)).join(', ')}`)
    notFound()
  }

  console.log(`✅ Found product: ${product.productName} with ${product.variants.length} variants`)

  // Get related products
  const relatedProducts = products
    .filter(p => p.category === product.category && p.baseSku !== product.baseSku)
    .slice(0, 4)

  return (
    <PageTransition>
      <div 
        className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]"
        style={{
          contain: 'layout style paint',
          willChange: 'scroll-position'
        }}
      >
        <Header />

        <main 
          className="relative overflow-hidden pt-24"
          style={{ contain: 'layout style paint' }}
        >
          <ProductDetail product={product} />
          {relatedProducts.length > 0 && <ProductRecommendations products={relatedProducts} />}
        </main>

        <Footer />
      </div>
    </PageTransition>
  )
}

// Generate static params using consistent slug generation
export async function generateStaticParams() {
  const products = getCachedGroupedProducts()

  return products.map(product => ({
    slug: generateProductSlug(product.baseSku),
  }))
}
