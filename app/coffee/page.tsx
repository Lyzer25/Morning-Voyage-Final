"use client"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import PageTransition from "@/components/ui/page-transition"
import { getCachedGroupedProducts } from "@/lib/product-cache"
import CoffeePageClient from "@/components/coffee/coffee-page-client"

type Product = {
  id: string
  productName: string
  description?: string
  tastingNotes?: string[]
  origin?: string
  subcategory?: string
  roastLevel?: string
  availableFormats?: string[]
  defaultVariant?: { price: number }
  priceRange?: { min: number }
  featured?: boolean
}

export default function CoffeePage() {
  const allProducts = getCachedGroupedProducts()
  const coffeeProducts = allProducts.filter((p) => p.category === "coffee")

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
        <Header />
        <CoffeePageClient initialProducts={coffeeProducts} />
        <Footer />
      </div>
    </PageTransition>
  )
}
