'use client'
import { Coffee, Shirt, Wrench, Sparkles, ArrowDown } from 'lucide-react'

const categories = [
  {
    name: 'Coffee',
    icon: Coffee,
    description: 'Premium roasted beans',
    gradient: 'from-[#4B2E2E] to-[#6E6658]',
    count: '12+ blends',
  },
  {
    name: 'Fashion',
    icon: Shirt,
    description: 'Sustainable apparel',
    gradient: 'from-[#9E7C83] to-[#6E6658]',
    count: '8+ items',
  },
  {
    name: 'Equipment',
    icon: Wrench,
    description: 'Brewing essentials',
    gradient: 'from-[#D5BFA3] to-[#9E7C83]',
    count: '6+ tools',
  },
]

export default function ShopHero() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-[#D5BFA3]/20 to-[#9E7C83]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-[#4B2E2E]/10 to-[#6E6658]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 shadow-lg mb-6">
            <Sparkles className="w-4 h-4 text-[#D5BFA3]" />
            <span className="text-[#4B2E2E] text-sm font-semibold tracking-wide">
              PREMIUM COLLECTION
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#4B2E2E] mb-6 tracking-tight">
            Shop Morning
            <span className="block bg-gradient-to-r from-[#9E7C83] to-[#6E6658] bg-clip-text text-transparent">
              Voyage
            </span>
          </h1>

          <p className="text-xl text-[#6E6658] max-w-3xl mx-auto font-light leading-relaxed mb-12">
            Discover our curated collection of freshly roasted coffee, sustainable fashion, and
            premium brewing equipment. Every product is crafted with intention and delivered with
            care.
          </p>

          {/* Category Quick Links */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {categories.map((category, index) => (
              <div
                key={category.name}
                className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.gradient} rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>

                <div className="relative z-10 text-center">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-2xl mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                  >
                    <category.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-[#4B2E2E] mb-2 group-hover:text-[#6E6658] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-[#6E6658] text-sm mb-2 font-light">{category.description}</p>
                  <span className="text-xs text-[#9E7C83] font-semibold uppercase tracking-wide">
                    {category.count}
                  </span>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#D5BFA3]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center">
          <div className="animate-bounce">
            <ArrowDown className="w-6 h-6 text-[#6E6658]" />
          </div>
        </div>
      </div>
    </section>
  )
}
