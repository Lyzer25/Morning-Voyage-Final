"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ArrowRight, Heart, ShoppingCart } from "lucide-react"
import { formatPrice } from "@/lib/utils"

const products = [
  {
    id: 1,
    name: "Morning Blend",
    category: "Coffee",
    price: "$24.99",
    originalPrice: "$29.99",
    rating: 4.9,
    reviews: 234,
    badge: "Bestseller",
    description: "A smooth, balanced blend perfect for starting your day",
    gradient: "from-[#4B2E2E] to-[#6E6658]",
  },
  {
    id: 2,
    name: "Dark Roast Supreme",
    category: "Coffee",
    price: "$26.99",
    originalPrice: "$31.99",
    rating: 4.8,
    reviews: 189,
    badge: "Premium",
    description: "Bold and intense flavor for the serious coffee lover",
    gradient: "from-[#6E6658] to-[#9E7C83]",
  },
  {
    id: 3,
    name: "Voyage Hoodie",
    category: "Fashion",
    price: "$49.99",
    originalPrice: "$69.99",
    rating: 4.7,
    reviews: 156,
    badge: "Limited",
    description: "Premium cotton hoodie with embroidered logo",
    gradient: "from-[#9E7C83] to-[#D5BFA3]",
  },
  {
    id: 4,
    name: "Coffee Tote Bag",
    category: "Fashion",
    price: "$19.99",
    originalPrice: "$24.99",
    rating: 4.9,
    reviews: 298,
    badge: "Eco-Friendly",
    description: "Sustainable canvas tote for the eco-conscious coffee lover",
    gradient: "from-[#D5BFA3] to-[#4B2E2E]",
  },
]

export default function ProductShowcase() {
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
            Discover our most popular coffee blends and fashion pieces, crafted with care and attention to detail.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {products.map((product, index) => (
            <Card
              key={product.id}
              className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/70 backdrop-blur-xl hover:-translate-y-2 overflow-hidden"
            >
              <CardContent className="p-0 relative">
                {/* Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-white/90 backdrop-blur-sm text-[#4B2E2E] text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {product.badge}
                  </span>
                </div>

                {/* Heart Icon */}
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg"
                  >
                    <Heart className="w-4 h-4 text-[#6E6658]" />
                  </Button>
                </div>

                {/* Product Image */}
                <div
                  className={`aspect-square bg-gradient-to-br ${product.gradient} flex items-center justify-center relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
                  <div className="text-center text-white relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {product.category === "Coffee" ? "☕" : "👕"}
                      </span>
                    </div>
                    <p className="text-sm opacity-90 font-medium">{product.category}</p>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      size="sm"
                      className="bg-white text-[#4B2E2E] hover:bg-white/90 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Quick Add
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Rating */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-[#D5BFA3] text-[#D5BFA3]" />
                      <span className="text-sm font-semibold text-[#4B2E2E]">{product.rating}</span>
                      <span className="text-xs text-[#6E6658]">({product.reviews})</span>
                    </div>
                    <span className="text-xs text-[#9E7C83] font-medium uppercase tracking-wide">
                      {product.category}
                    </span>
                  </div>

                  {/* Product Name */}
                  <h3 className="text-lg font-bold text-[#4B2E2E] mb-2 group-hover:text-[#6E6658] transition-colors">
                    {product.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#6E6658] mb-4 font-light leading-relaxed">{product.description}</p>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-[#4B2E2E]">{formatPrice(product.price)}</span>
                      <span className="text-sm text-[#6E6658] line-through">{formatPrice(product.originalPrice)}</span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] hover:from-[#6E6658] hover:to-[#4B2E2E] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] hover:from-[#6E6658] hover:to-[#4B2E2E] text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group font-semibold"
          >
            View All Products
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  )
}
