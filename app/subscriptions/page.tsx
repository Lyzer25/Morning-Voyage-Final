import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import SubscriptionHero from "@/components/subscriptions/subscription-hero"
import SubscriptionPlans from "@/components/subscriptions/subscription-plans"
import GiftSubscriptions from "@/components/subscriptions/gift-subscriptions"
import PageTransition from "@/components/ui/page-transition"
import { getCachedGroupedProducts } from "@/lib/product-cache"

export default function SubscriptionsPage() {
  const allProducts = getCachedGroupedProducts()
  const subscriptionProducts = allProducts.filter((p) => p.category === "subscription")
  const giftProducts = allProducts.filter((p) => p.category === "gift-set")

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
}
