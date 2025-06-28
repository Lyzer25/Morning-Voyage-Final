'use client'

import { Coffee, Award, Leaf, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

const coffeeStats = [
  {
    icon: Coffee,
    title: '12+ Blends',
    description: 'Signature & Single Origins',
    gradient: 'from-[#4B2E2E] to-[#6E6658]',
  },
  {
    icon: Award,
    title: '85+ Cup Score',
    description: 'Specialty Grade Coffee',
    gradient: 'from-[#6E6658] to-[#9E7C83]',
  },
  {
    icon: Leaf,
    title: 'Direct Trade',
    description: 'Ethically Sourced',
    gradient: 'from-[#9E7C83] to-[#D5BFA3]',
  },
]

const roastLevels = [
  { name: 'Light', color: '#D5BFA3', description: 'Bright & Fruity' },
  { name: 'Medium', color: '#9E7C83', description: 'Balanced & Sweet' },
  { name: 'Dark', color: '#6E6658', description: 'Bold & Rich' },
]

export default function CoffeeHero() {
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
            <Coffee className="w-4 h-4 text-[#D5BFA3]" />
            <span className="text-[#4B2E2E] text-sm font-semibold tracking-wide">
              FRESHLY ROASTED DAILY
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#4B2E2E] mb-6 tracking-tight">
            Premium Coffee
            <span className="block bg-gradient-to-r from-[#9E7C83] to-[#6E6658] bg-clip-text text-transparent">
              Collection
            </span>
          </h1>

          <p className="text-xl text-[#6E6658] max-w-3xl mx-auto font-light leading-relaxed mb-12">
            Discover our carefully curated selection of specialty coffee beans, roasted to
            perfection and delivered fresh to your door. From bright single origins to rich
            signature blends, find your perfect cup.
          </p>

          {/* Coffee Stats */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {coffeeStats.map((stat, index) => (
              <div
                key={stat.title}
                className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>

                <div className="relative z-10 text-center">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                  >
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-[#4B2E2E] mb-2 group-hover:text-[#6E6658] transition-colors">
                    {stat.title}
                  </h3>
                  <p className="text-[#6E6658] text-sm font-light">{stat.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Roast Level Guide */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-lg max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-bold text-[#4B2E2E] mb-6">Roast Level Guide</h3>
            <div className="grid grid-cols-3 gap-6">
              {roastLevels.map((roast, index) => (
                <div key={roast.name} className="text-center group">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: roast.color }}
                  ></div>
                  <h4 className="font-bold text-[#4B2E2E] mb-1">{roast.name}</h4>
                  <p className="text-sm text-[#6E6658] font-light">{roast.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] hover:from-[#6E6658] hover:to-[#4B2E2E] text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group font-semibold"
            >
              <Coffee className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
              Shop All Coffee
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-[#4B2E2E] text-[#4B2E2E] hover:bg-[#4B2E2E] hover:text-white px-8 py-4 rounded-2xl backdrop-blur-sm bg-white/50 shadow-lg hover:shadow-xl transition-all duration-300 group font-semibold"
            >
              <Clock className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              Subscribe & Save
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
