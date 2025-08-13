import Header from "@/components/layout/header.server"
import Footer from "@/components/layout/footer"
import PageTransition from "@/components/ui/page-transition"
import { getGroupedProducts } from "@/lib/csv-data"
import CoffeePageClient from "@/components/coffee/coffee-page-client"

// STATIC ISR: Build-safe static generation with 1-hour revalidation
export const dynamic = 'force-static'
export const revalidate = 3600

// Add metadata for better SEO and caching
export async function generateMetadata() {
  const groupedProducts = await getGroupedProducts()
  
  return {
    title: `Coffee Collection - ${groupedProducts.length} Premium Blends | Morning Voyage`,
    description: `Discover our curated collection of ${groupedProducts.length} premium coffee blends. From light roasts to dark, single origins to signature blends.`,
    openGraph: {
      title: `Coffee Collection - ${groupedProducts.length} Premium Blends`,
      description: `Discover our curated collection of ${groupedProducts.length} premium coffee blends.`,
    }
  }
}

export default async function CoffeePage() {
  try {
    console.log('☕ CoffeePage: Starting to load...');
    
    // SINGLE-SHOT: Use new getGroupedProducts() directly (already filtered to coffee only)
    const groupedCoffeeProducts = await getGroupedProducts()
    
    console.log('☕ Grouped coffee products received:', groupedCoffeeProducts?.length || 0);
    console.log('☕ Products type:', typeof groupedCoffeeProducts);
    console.log('☕ Is array?', Array.isArray(groupedCoffeeProducts));

    if (!groupedCoffeeProducts || !Array.isArray(groupedCoffeeProducts)) {
      console.error('❌ Coffee page: Products is not an array:', typeof groupedCoffeeProducts);
      return (
        <PageTransition>
          <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
            <Header />
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold mb-8">Premium Coffee</h1>
              <div className="bg-red-100 p-4 rounded">
                <p className="text-red-600 font-bold">DEBUG: Products data issue</p>
                <p>Type: {typeof groupedCoffeeProducts}</p>
                <p>Value: {JSON.stringify(groupedCoffeeProducts)}</p>
              </div>
            </div>
            <Footer />
          </div>
        </PageTransition>
      );
    }
    
    // Handle empty product state
    if (groupedCoffeeProducts.length === 0) {
      console.log('☕ Empty coffee product state detected - showing appropriate empty state');
      return (
        <PageTransition>
          <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
            <Header />
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold text-[#4B2E2E] mb-4">Coffee Collection</h1>
              <div className="max-w-md mx-auto bg-blue-50 p-8 rounded-lg border">
                <div className="text-6xl mb-4">☕</div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No Coffee Products Available</h2>
                <p className="text-gray-600 mb-4">
                  Our coffee collection is currently empty. We're working on restocking our amazing blends!
                </p>
                <p className="text-sm text-gray-500">
                  Check back soon or contact us for updates on new arrivals.
                </p>
              </div>
            </div>
            <Footer />
          </div>
        </PageTransition>
      );
    }
    
    console.log('☕ COFFEE PAGE: Final grouped coffee products:', {
      count: groupedCoffeeProducts.length,
      sample: groupedCoffeeProducts[0]?.productName || 'None'
    });
    
    // Add performance logging for Vercel
    if (process.env.VERCEL) {
      console.log(`🔍 Vercel ISR: Coffee page generated at ${new Date().toISOString()}`)
    }

    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
          <Header />
          <CoffeePageClient initialProducts={groupedCoffeeProducts} />
          <Footer />
        </div>
      </PageTransition>
    )
  } catch (error) {
    console.error("❌ Error loading coffee page:", error)
    
    // Enhanced fallback UI with debug info
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
          <Header />
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold text-[#4B2E2E] mb-4">Coffee Collection</h1>
            <div className="bg-red-100 p-4 rounded max-w-md mx-auto">
              <p className="text-red-600 font-bold">Error loading coffee products</p>
              <p className="text-red-600 text-sm mt-2">
                {error instanceof Error ? error.message : String(error)}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-2 text-left">
                  <summary className="cursor-pointer text-red-700">Error Details</summary>
                  <pre className="text-xs mt-1 text-red-600">
                    {error instanceof Error ? error.stack : 'Unknown error'}
                  </pre>
                </details>
              )}
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    )
  }
}
