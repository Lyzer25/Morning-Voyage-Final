import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import SubscriptionHero from "@/components/subscriptions/subscription-hero"
import SubscriptionPlans from "@/components/subscriptions/subscription-plans"
import GiftSubscriptions from "@/components/subscriptions/gift-subscriptions"
import PageTransition from "@/components/ui/page-transition"
import { getProductsByCategory } from "@/lib/csv-data"
import { groupProductVariants } from "@/lib/product-variants"

// STATIC ISR: Build-safe static generation with 1-hour revalidation
export const dynamic = 'force-static'
export const revalidate = 3600

// Add metadata for better SEO and caching
export async function generateMetadata() {
  try {
    const subscriptionProducts = await getProductsByCategory('subscription')
    
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

export default async function SubscriptionsPage() {
  try {
    console.log('🎯 SubscriptionsPage: Loading subscription products...')
    
    // SINGLE-SHOT: Use getProductsByCategory() for subscriptions
    const subscriptionProducts = await getProductsByCategory('subscription')
    const giftProducts = await getProductsByCategory('gift-set')
    
    console.log(`📊 SubscriptionsPage: Retrieved ${subscriptionProducts?.length || 0} subscription products, ${giftProducts?.length || 0} gift products`)

    // Handle empty subscription state
    if (!subscriptionProducts || subscriptionProducts.length === 0) {
      console.log('📦 Empty subscription state detected');
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
    
    console.log('🔄 SUBSCRIPTIONS PAGE: Products loaded:', {
      subscriptionCount: subscriptionProducts.length,
      giftCount: giftProducts.length
    })

    // Convert to grouped products for variant system
    const groupedSubscriptionProducts = groupProductVariants(subscriptionProducts)
    const groupedGiftProducts = groupProductVariants(giftProducts)
    
    console.log(`✅ SubscriptionsPage: Grouped ${subscriptionProducts.length} → ${groupedSubscriptionProducts.length} subscription products, ${giftProducts.length} → ${groupedGiftProducts.length} gift products`)
    
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
            <SubscriptionPlans products={groupedSubscriptionProducts} />
            <GiftSubscriptions products={groupedGiftProducts} />
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
