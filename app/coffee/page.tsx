import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import PageTransition from "@/components/ui/page-transition"
import { getProducts } from "@/lib/csv-data"
import { groupProductFamilies, convertFamiliesToGroupedProducts } from "@/lib/family-grouping"
import CoffeePageClient from "@/components/coffee/coffee-page-client"

// STATIC ISR: Build-safe static generation with 1-hour revalidation
export const dynamic = 'force-static'
export const revalidate = 3600

// Add metadata for better SEO and caching
export async function generateMetadata() {
  const allProducts = await getProducts()
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
    console.log('☕ CoffeePage: Starting to load...');
    
    // CRITICAL FIX: Use CSV-only getProducts
    const allProducts = await getProducts()
    
    console.log('☕ Raw products received:', allProducts?.length || 0);
    console.log('☕ Products sample:', allProducts?.slice(0, 2) || 'No products');
    console.log('☕ Products type:', typeof allProducts);
    console.log('☕ Is array?', Array.isArray(allProducts));

    if (!allProducts || !Array.isArray(allProducts)) {
      console.error('❌ Coffee page: Products is not an array:', typeof allProducts);
      return (
        <PageTransition>
          <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
            <Header />
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold mb-8">Premium Coffee</h1>
              <div className="bg-red-100 p-4 rounded">
                <p className="text-red-600 font-bold">DEBUG: Products data issue</p>
                <p>Type: {typeof allProducts}</p>
                <p>Value: {JSON.stringify(allProducts)}</p>
              </div>
            </div>
            <Footer />
          </div>
        </PageTransition>
      );
    }
    
    // Handle empty product state
    if (allProducts.length === 0) {
      console.log('☕ Empty product state detected - showing appropriate empty state');
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

    // CRITICAL FIX: Filter for coffee products with correct property access
    const coffeeProducts = allProducts.filter(product => {
      const isCoffee = product.category?.toLowerCase() === 'coffee'
      console.log('☕ Coffee filter check:', {
        sku: product.sku, // Fixed: use sku not baseSku
        category: product.category,
        isMatch: isCoffee
      })
      return isCoffee
    })
    
    console.log('☕ COFFEE PAGE: Final coffee products:', {
      total: allProducts.length,
      coffeeCount: coffeeProducts.length,
      categories: [...new Set(allProducts.map(p => p.category))]
    })
    
    // Handle case where we have products but no coffee products
    if (coffeeProducts.length === 0 && allProducts.length > 0) {
      console.log('☕ No coffee products found, but other products exist');
      const uniqueCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
      return (
        <PageTransition>
          <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
            <Header />
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold text-[#4B2E2E] mb-4">Coffee Collection</h1>
              <div className="max-w-md mx-auto bg-orange-50 p-8 rounded-lg border">
                <div className="text-6xl mb-4">☕</div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No Coffee Products Found</h2>
                <p className="text-gray-600 mb-4">
                  We have {allProducts.length} products total, but no coffee products at the moment.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Available categories: {uniqueCategories.join(', ')}
                </p>
                <p className="text-sm text-gray-500">
                  Check our other collections or contact us about coffee availability.
                </p>
              </div>
            </div>
            <Footer />
          </div>
        </PageTransition>
      );
    }
    
    // CRITICAL FIX: Convert raw products to grouped families for WB/GR grouping
    const productFamilies = groupProductFamilies(coffeeProducts)
    const groupedCoffeeProducts = convertFamiliesToGroupedProducts(productFamilies)
    
    console.log('☕ COFFEE PAGE: Grouped coffee products:', {
      raw: coffeeProducts.length,
      families: productFamilies.length,
      converted: groupedCoffeeProducts.length,
      sampleGroup: productFamilies[0]?.base?.productName || 'None'
    })
    
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
