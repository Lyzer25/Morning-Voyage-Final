import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import MainLayout from "../components/layout/main-layout"
import ProductGrid from "../components/products/product-grid"
import { getFeaturedProducts, getBestSellerProducts } from "../lib/product-service"

export default async function Home() {
  const featuredProducts = await getFeaturedProducts(4)
  const bestSellerProducts = await getBestSellerProducts(4)

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] items-center bg-coffee-dark">
        <div className="absolute inset-0 z-0">
          <Image src="/images/hero-bg.jpg" alt="Fresh coffee beans" fill className="object-cover opacity-40" priority />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h1 className="font-serif text-4xl font-bold text-cream sm:text-5xl md:text-6xl">
              Discover the Perfect Morning Ritual
            </h1>
            <p className="mt-6 text-xl text-cream/90">
              Premium coffee delivered to your doorstep. Freshly roasted and ethically sourced for the perfect cup every
              morning.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-gold text-coffee-dark hover:bg-gold/90">
                <Link href="/shop">Shop Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-cream text-cream hover:bg-cream/10">
                <Link href="/subscriptions">Explore Subscriptions</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-cream py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="font-serif text-3xl font-bold text-coffee-dark">Featured Products</h2>
            <Link href="/shop" className="flex items-center text-coffee-medium hover:text-coffee-dark">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <ProductGrid products={featuredProducts} columns={4} />
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image src="/images/about-coffee.jpg" alt="Coffee brewing process" fill className="object-cover" />
            </div>
            <div>
              <h2 className="font-serif text-3xl font-bold text-coffee-dark">Crafted with Passion</h2>
              <p className="mt-4 text-lg text-gray-600">
                At Morning Voyage, we believe that great coffee is a journey. Our beans are ethically sourced from
                sustainable farms around the world and roasted in small batches to ensure the perfect flavor profile.
              </p>
              <p className="mt-4 text-lg text-gray-600">
                Every cup tells a story of dedication, craftsmanship, and the pursuit of excellence. Join us on this
                voyage of taste and discovery.
              </p>
              <Button asChild className="mt-8">
                <Link href="/about">Our Story</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-cream py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="font-serif text-3xl font-bold text-coffee-dark">Best Sellers</h2>
            <Link href="/shop" className="flex items-center text-coffee-medium hover:text-coffee-dark">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <ProductGrid products={bestSellerProducts} columns={4} />
        </div>
      </section>

      {/* Subscription CTA */}
      <section className="bg-coffee-medium py-16 text-cream">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">Never Run Out of Coffee Again</h2>
            <p className="mt-4 text-lg text-cream/90">
              Subscribe to your favorite blends and save. Customize your delivery schedule and enjoy fresh coffee at
              your doorstep.
            </p>
            <Button asChild size="lg" className="mt-8 bg-gold text-coffee-dark hover:bg-gold/90">
              <Link href="/subscriptions">Start Your Subscription</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center font-serif text-3xl font-bold text-coffee-dark">What Our Customers Say</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image src={`/images/avatar-${i}.jpg`} alt="Customer" fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-medium text-coffee-dark">
                      {["Sarah Johnson", "Michael Chen", "Emma Davis"][i - 1]}
                    </h3>
                    <div className="flex text-gold">
                      {[...Array(5)].map((_, j) => (
                        <span key={j}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">
                  {
                    [
                      "The Ethiopian Yirgacheffe is absolutely divine! The floral notes and bright acidity make it the perfect morning cup. I've been a subscriber for 6 months and the quality is consistently excellent.",
                      "Morning Voyage's subscription service has changed my coffee routine for the better. The beans are always fresh, and I love being able to adjust my delivery schedule when needed.",
                      "I'm impressed with the attention to detail in every order. The packaging is beautiful, the coffee is exceptional, and the customer service is top-notch. Highly recommend!",
                    ][i - 1]
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      <section className="bg-cream py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center font-serif text-3xl font-bold text-coffee-dark">Follow Us on Instagram</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <a
                key={i}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden"
              >
                <Image
                  src={`/images/instagram-${i + 1}.jpg`}
                  alt="Instagram post"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-coffee-dark/0 opacity-0 transition-all duration-300 group-hover:bg-coffee-dark/60 group-hover:opacity-100">
                  <span className="text-cream">@morningvoyage</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-coffee-dark py-16 text-cream">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold">Join Our Newsletter</h2>
            <p className="mt-4 text-cream/80">
              Subscribe to receive updates, exclusive offers, and coffee brewing tips.
            </p>
            <form className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 rounded-md border-gray-300 bg-white/10 px-4 py-3 text-cream placeholder:text-cream/50 focus:border-gold focus:ring-gold"
                required
              />
              <Button type="submit" className="bg-gold text-coffee-dark hover:bg-gold/90">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
