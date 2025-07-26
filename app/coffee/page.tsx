import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import PageTransition from "@/components/ui/page-transition"
import { getCachedGroupedProducts } from "@/lib/product-cache"
import CoffeePageClient from "@/components/coffee/coffee-page-client"

// CRITICAL FIX: ISR Configuration for Vercel build consistency
export const revalidate = 3600 // Revalidate every hour instead of 60 seconds for build stability
export const dynamic = 'force-static' // Enable ISR
export const dynamicParams = true

// Add metadata for better SEO and caching
export async function generateMetadata() {
  const allProducts = await getCachedGroupedProducts()
  const coffeeProducts = allProducts.filter((p) => p.category === "coffee")
  
  return {
    title: `Coffee Collection - ${coffeeProducts.length} Premium Blends | Morning Voyage`,
    description: `Discover our curated collection of ${coffeeProducts.length} premium coffee blends. From light roasts to dark, single origins to signature blends.`,
    openGraph: {
      title: `Coffee Collection - ${coffeeProducts.length} Premium Blends`,
      description: `Discover our curated collection of ${coffeeProducts.length} premium coffee blends.`,
    }
  }
}

export default async function CoffeePage() {
  try {
    // Fetch products from API via cache with error handling
    const allProducts = await getCachedGroupedProducts()
    const coffeeProducts = allProducts.filter((p) => p.category === "coffee")

    console.log(`☕ Coffee page: Found ${coffeeProducts.length} coffee products out of ${allProducts.length} total`)
    
    // Add performance logging for Vercel
    if (process.env.VERCEL) {
      console.log(`🔍 Vercel ISR: Coffee page generated at ${new Date().toISOString()}`)
    }

    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
          <Header />
          <CoffeePageClient initialProducts={coffeeProducts} />
          <Footer />
        </div>
      </PageTransition>
    )
  } catch (error) {
    console.error("❌ Error loading coffee page:", error)
    
    // Fallback UI for production reliability
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
          <Header />
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold text-[#4B2E2E] mb-4">Coffee Collection</h1>
            <p className="text-[#6E6658] mb-8">We're updating our coffee selection. Please check back shortly.</p>
            <div className="text-sm text-[#6E6658]">
              {process.env.NODE_ENV === 'development' && (
                <>Error: {error instanceof Error ? error.message : 'Unknown error'}</>
              )}
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    )
  }
}
