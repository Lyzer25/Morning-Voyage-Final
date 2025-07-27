import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import SubscriptionHero from "@/components/subscriptions/subscription-hero"
import SubscriptionPlans from "@/components/subscriptions/subscription-plans"
import GiftSubscriptions from "@/components/subscriptions/gift-subscriptions"
import PageTransition from "@/components/ui/page-transition"
import { getCachedGroupedProducts } from "@/lib/product-cache"

// CRITICAL FIX: Add ISR configuration for Vercel
export const revalidate = 3600 // Revalidate every hour instead of 0
export const dynamic = 'force-static' // Force static generation

// Add metadata for better SEO and caching
export async function generateMetadata() {
  try {
    const allProducts = await getCachedGroupedProducts()
    const subscriptionProducts = allProducts.filter((p) => p && p.category === "subscription")
    
    return {
      title: `Subscription Plans - ${subscriptionProducts.length} Options | Morning Voyage`,
      description: `Discover our ${subscriptionProducts.length} flexible coffee subscription plans. Fresh coffee delivered to your door.`,
      openGraph: {
        title: `Subscription Plans - ${subscriptionProducts.length} Options`,
        description: `Discover our ${subscriptionProducts.length} flexible coffee subscription plans.`,
      }
    }
  } catch (error) {
    return {
      title: 'Subscription Plans | Morning Voyage',
      description: 'Discover our flexible coffee subscription plans. Fresh coffee delivered to your door.',
    }
  }
}

// CRITICAL FIX: Convert to async server component and properly await
export default async function SubscriptionsPage() {
  try {
    console.log('🎯 SubscriptionsPage: Loading subscription products...')
    
    // CRITICAL FIX: Properly await the async function
    const allProducts = await getCachedGroupedProducts()
    
    console.log(`📊 SubscriptionsPage: Retrieved ${allProducts?.length || 0} total products`)

    // CRITICAL FIX: Add null checks before calling .filter()
    if (!allProducts || !Array.isArray(allProducts)) {
      console.warn('⚠️ SubscriptionsPage: No products array available')
      return (
        <PageTransition>
          <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
            <Header />
            <main className="relative overflow-hidden pt-24">
              <SubscriptionHero />
              <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-3xl font-bold text-[#4B2E2E] mb-4">Subscription Plans</h2>
                <p className="text-[#6E6658] mb-8">No subscription plans available at the moment.</p>
              </div>
            </main>
            <Footer />
          </div>
        </PageTransition>
      )
    }
    
    // Handle empty product state
    if (allProducts.length === 0) {
      console.log('📦 Empty product state detected on subscriptions page');
      return (
        <PageTransition>
          <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
            <Header />
            <main className="relative overflow-hidden pt-24">
              <SubscriptionHero />
              <div className="container mx-auto px-4 py-16 text-center">
                <div className="max-w-md mx-auto bg-blue-50 p-8 rounded-lg border">
                  <div className="text-6xl mb-4">📦</div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">No Subscription Plans Available</h2>
                  <p className="text-gray-600 mb-4">
                    Our subscription service is currently being updated. We're working on new subscription options!
                  </p>
                  <p className="text-sm text-gray-500">
                    Check back soon for our coffee subscription plans.
                  </p>
                </div>
              </div>
            </main>
            <Footer />
          </div>
        </PageTransition>
      )
    }
    
    // CRITICAL FIX: Safe filter operations with null checks
    const subscriptionProducts = allProducts.filter((p) => 
      p && p.category && p.category.toLowerCase().includes('subscription')
    )
    
    const giftProducts = allProducts.filter((p) => 
      p && p.category && (p.category.toLowerCase().includes('gift') || p.category.toLowerCase().includes('gift-set'))
    )

    console.log(`✅ SubscriptionsPage: Found ${subscriptionProducts.length} subscription products, ${giftProducts.length} gift products`)
    
    // Add performance logging for Vercel
    if (process.env.VERCEL) {
      console.log(`🔍 Vercel ISR: Subscriptions page generated at ${new Date().toISOString()}`)
    }

    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
          <Header />

          <main className="relative overflow-hidden pt-24">
            <SubscriptionHero />
            <SubscriptionPlans products={subscriptionProducts} />
            <GiftSubscriptions products={giftProducts} />
          </main>

          <Footer />
        </div>
      </PageTransition>
    )
  } catch (error) {
    console.error('❌ SubscriptionsPage: Error loading page:', error)
    
    // Fallback UI for production reliability
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
          <Header />
          <main className="relative overflow-hidden pt-24">
            <SubscriptionHero />
            <div className="container mx-auto px-4 py-16 text-center">
              <h2 className="text-3xl font-bold text-red-600 mb-4">Error Loading Subscriptions</h2>
              <p className="text-[#6E6658] mb-8">There was an error loading subscription plans. Please try again later.</p>
              {process.env.NODE_ENV === 'development' && (
                <div className="text-sm text-gray-500 mt-4">
                  Error: {error instanceof Error ? error.message : 'Unknown error'}
                </div>
              )}
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    )
  }
}
