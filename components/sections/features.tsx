import { Truck, Award, Zap, Heart } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Roasted to Order",
    description: "Every bag is roasted fresh after you place your order, ensuring maximum flavor and aroma.",
    gradient: "from-[#4B2E2E] to-[#6E6658]",
  },
  {
    icon: Truck,
    title: "Lightning Fast Delivery",
    description: "Free shipping on orders over $35. Get your coffee delivered within 2-3 business days.",
    gradient: "from-[#9E7C83] to-[#6E6658]",
  },
  {
    icon: Heart,
    title: "Sustainable Sourcing",
    description: "We work directly with farmers to ensure fair trade and environmentally responsible practices.",
    gradient: "from-[#D5BFA3] to-[#9E7C83]",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Hand-selected beans from the world's finest coffee regions, curated by our expert roasters.",
    gradient: "from-[#6E6658] to-[#4B2E2E]",
  },
]

export default function Features() {
  return (
    <section className="py-32 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 shadow-lg mb-6">
            <div className="w-2 h-2 bg-[#D5BFA3] rounded-full animate-pulse"></div>
            <span className="text-[#4B2E2E] text-sm font-semibold tracking-wide">WHY CHOOSE US</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#4B2E2E] mb-6 tracking-tight">
            Why Morning Voyage?
          </h2>
          <p className="text-xl text-[#6E6658] max-w-3xl mx-auto font-light leading-relaxed">
            We're committed to delivering the finest coffee experience, from bean to cup, with uncompromising quality
            and care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Gradient Background on Hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              ></div>

              <div className="relative z-10">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-[#4B2E2E] mb-4 group-hover:text-[#6E6658] transition-colors">
                  {feature.title}
                </h3>

                <p className="text-[#6E6658] leading-relaxed font-light">{feature.description}</p>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#D5BFA3]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
