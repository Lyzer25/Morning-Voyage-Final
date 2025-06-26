"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coffee, Calendar, Truck, Star } from "lucide-react"
import type { Product } from "@/lib/product-data"
import { formatPrice } from "@/lib/utils"

interface SubscriptionPlansProps {
  products: Product[]
}

export default function SubscriptionPlans({ products }: SubscriptionPlansProps) {
  return (
    <section className="py-20 bg-gradient-to-b from-white via-[#F6F1EB]/20 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 shadow-lg mb-6">
            <Calendar className="w-4 h-4 text-[#D5BFA3]" />
            <span className="text-[#4B2E2E] text-sm font-semibold tracking-wide">SUBSCRIPTION PLANS</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-[#4B2E2E] mb-6 tracking-tight">Choose Your Plan</h2>
          <p className="text-xl text-[#6E6658] max-w-3xl mx-auto font-light leading-relaxed">
            Select the perfect subscription plan for your coffee needs. All plans include free shipping and the
            flexibility to modify or cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product, index) => (
            <Card
              key={product.id}
              className={`group hover:shadow-2xl transition-all duration-500 border-0 bg-white/70 backdrop-blur-xl hover:-translate-y-2 overflow-hidden relative ${
                product.badge === "Save 20%" ? "ring-2 ring-[#D5BFA3] ring-opacity-50" : ""
              }`}
            >
              {/* Popular Badge */}
              {product.badge === "Save 20%" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-[#D5BFA3] to-[#9E7C83] text-white font-bold px-4 py-1 shadow-lg">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4 pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#4B2E2E] to-[#6E6658] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Coffee className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#4B2E2E] mb-2">
                  {product.name.replace("Monthly Coffee Subscription - ", "")}
                </CardTitle>
                <p className="text-[#6E6658] font-light">{product.description}</p>
              </CardHeader>

              <CardContent className="text-center">
                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-black text-[#4B2E2E]">{formatPrice(product.price)}</span>
                    <span className="text-[#6E6658]">/month</span>
                  </div>
                  {product.originalPrice && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg text-[#6E6658] line-through">{formatPrice(product.originalPrice)}</span>
                      <Badge variant="secondary" className="bg-[#D5BFA3] text-white">
                        {product.badge}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-[#6E6658]">
                    <Coffee className="w-4 h-4 mr-3 text-[#D5BFA3]" />
                    <span>{product.servings} cups per month</span>
                  </div>
                  <div className="flex items-center text-[#6E6658]">
                    <Truck className="w-4 h-4 mr-3 text-[#D5BFA3]" />
                    <span>Free shipping</span>
                  </div>
                  <div className="flex items-center text-[#6E6658]">
                    <Calendar className="w-4 h-4 mr-3 text-[#D5BFA3]" />
                    <span>Skip, pause, or cancel anytime</span>
                  </div>
                  <div className="flex items-center text-[#6E6658]">
                    <Star className="w-4 h-4 mr-3 text-[#D5BFA3]" />
                    <span>Freshly roasted to order</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 ${
                    product.badge === "Save 20%"
                      ? "bg-gradient-to-r from-[#D5BFA3] to-[#9E7C83] hover:from-[#9E7C83] hover:to-[#D5BFA3] text-white"
                      : "bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] hover:from-[#6E6658] hover:to-[#4B2E2E] text-white"
                  }`}
                >
                  Start Subscription
                </Button>

                <p className="text-xs text-[#6E6658] mt-3 font-light">Cancel or modify anytime</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
