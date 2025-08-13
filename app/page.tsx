import Hero from "@/components/sections/hero"
import Features from "@/components/sections/features"
import ProductShowcase from "@/components/sections/product-showcase"
import BrandStory from "@/components/sections/brand-story"
import Testimonials from "@/components/sections/testimonials"
import Newsletter from "@/components/sections/newsletter"
import Header from "@/components/layout/header.server"
import Footer from "@/components/layout/footer"
import { getGroupedProducts } from "@/lib/csv-data"

// ISR Configuration for Vercel
export const revalidate = 60 // Revalidate every 60 seconds
export const dynamic = 'force-static' // Enable ISR

// Add metadata for better SEO
export async function generateMetadata() {
  const allProducts = await getGroupedProducts()
  const featuredProducts = allProducts.filter((p: any) => p.featured) 
  
  return {
    title: `Morning Voyage - Premium Coffee & Artisan Blends | ${allProducts.length} Products`,
    description: `Discover premium coffee with Morning Voyage. Shop ${allProducts.length} carefully curated coffee blends, featuring ${featuredProducts.length} signature selections.`,
    openGraph: {
      title: 'Morning Voyage - Premium Coffee & Artisan Blends',
      description: `Discover premium coffee with Morning Voyage. Shop ${allProducts.length} carefully curated coffee blends.`,
    }
  }
}

export default async function HomePage() {
  try {
    // SINGLE-SHOT: Use unified getGroupedProducts() with tastingNotes normalization
    const allProducts = await getGroupedProducts()
    
    console.log(`🏠 Homepage: Found ${allProducts.length} products`)
    
    // Add performance logging for Vercel
    if (process.env.VERCEL) {
      console.log(`🔍 Vercel ISR: Homepage generated at ${new Date().toISOString()}`)
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
        <Header />
        <main className="relative overflow-hidden">
          <Hero />
          <Features />
          <ProductShowcase products={allProducts} />
          <BrandStory />
          <Testimonials />
          <Newsletter />
        </main>
        <Footer />
      </div>
    )
  } catch (error) {
    console.error("❌ Error loading homepage:", error)
    
    // Fallback UI for production reliability
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
        <Header />
        <main className="relative overflow-hidden">
          <Hero />
          <Features />
          <ProductShowcase products={[]} />
          <BrandStory />
          <Testimonials />
          <Newsletter />
        </main>
        <Footer />
      </div>
    )
  }
}
