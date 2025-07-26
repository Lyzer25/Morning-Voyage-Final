import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import CoffeeGrid from "@/components/coffee/coffee-grid"
import { getCachedGroupedProducts } from "@/lib/product-cache"
import Link from "next/link"

export default function ProductShowcase() {
  const allProducts = getCachedGroupedProducts()
  const featuredProducts = allProducts.filter((p) => p.featured)

  return (
    <section className="py-32 bg-gradient-to-b from-white via-[#F6F1EB]/30 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 shadow-lg mb-6">
            <div className="w-2 h-2 bg-[#D5BFA3] rounded-full animate-pulse"></div>
            <span className="text-[#4B2E2E] text-sm font-semibold tracking-wide">FEATURED PRODUCTS</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#4B2E2E] mb-6 tracking-tight">
            Curated for You
          </h2>
          <p className="text-xl text-[#6E6658] max-w-3xl mx-auto font-light leading-relaxed">
            Discover our most popular coffee blends, crafted with care and attention to detail.
          </p>
        </div>

        {featuredProducts.length > 0 ? (
          <>
            <div className="mb-16">
              <CoffeeGrid products={featuredProducts.slice(0, 4)} viewMode="grid" />
            </div>
            <div className="text-center">
              <Link href="/coffee">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] hover:from-[#6E6658] hover:to-[#4B2E2E] text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group font-semibold"
                >
                  View All Products
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center text-[#6E6658]">No featured products available at the moment.</div>
        )}
      </div>
    </section>
  )
}
