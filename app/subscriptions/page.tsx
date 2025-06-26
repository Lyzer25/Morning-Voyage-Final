"use client"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import SubscriptionHero from "@/components/subscriptions/subscription-hero"
import SubscriptionPlans from "@/components/subscriptions/subscription-plans"
import GiftSubscriptions from "@/components/subscriptions/gift-subscriptions"
import { morningVoyageProducts } from "@/lib/product-data"

export default function SubscriptionsPage() {
  const subscriptionProducts = morningVoyageProducts.filter((product) => product.category === "subscription")
  const giftProducts = morningVoyageProducts.filter((product) => product.category === "gift-set")

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
      <Header />

      <main className="relative overflow-hidden pt-24">
        <SubscriptionHero />
        <SubscriptionPlans products={subscriptionProducts} />
        <GiftSubscriptions products={giftProducts} />
      </main>

      <Footer />
    </div>
  )
}
