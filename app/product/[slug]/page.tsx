import { notFound } from 'next/navigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import ProductDetail from '@/components/product/product-detail'
import ProductRecommendations from '@/components/product/product-recommendations'
import PageTransition from '@/components/ui/page-transition'
import { getCachedGroupedProducts } from '@/lib/product-cache'

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  // Get grouped products from cache
  const products = getCachedGroupedProducts()

  console.log(`🔍 Looking for product with slug: ${params.slug}`)
  console.log(`📊 Available products: ${products.length}`)

  // Find product by slug (match against baseSku or productName)
  const product = products.find(p => {
    const baseSkuSlug = p.baseSku.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const nameSlug = p.productName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')

    console.log(
      `   Checking: ${p.productName} -> baseSkuSlug: ${baseSkuSlug}, nameSlug: ${nameSlug}`
    )

    return baseSkuSlug === params.slug || nameSlug === params.slug
  })

  if (!product) {
    console.log(`❌ Product not found for slug: ${params.slug}`)
    notFound()
  }

  console.log(`✅ Found product: ${product.productName} with ${product.variants.length} variants`)

  // Get related products
  const relatedProducts = products
    .filter(p => p.category === product.category && p.baseSku !== product.baseSku)
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
}

// Generate static params for better performance
export async function generateStaticParams() {
  const products = getCachedGroupedProducts()

  return products.map(product => ({
    slug: product.baseSku.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  }))
}
