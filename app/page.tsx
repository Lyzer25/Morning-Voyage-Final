import Hero from '@/components/sections/hero'
import Features from '@/components/sections/features'
import ProductShowcase from '@/components/sections/product-showcase'
import BrandStory from '@/components/sections/brand-story'
import Testimonials from '@/components/sections/testimonials'
import Newsletter from '@/components/sections/newsletter'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

export default function HomePage() {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]"
      style={{
        contain: 'layout style paint',
        willChange: 'scroll-position'
      }}
    >
      <Header />
      <main 
        className="relative overflow-hidden"
        style={{ contain: 'layout style paint' }}
      >
        <Hero />
        <Features />
        <ProductShowcase />
        <BrandStory />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  )
}
