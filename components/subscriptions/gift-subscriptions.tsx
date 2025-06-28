'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Gift, Heart, Calendar, Star } from 'lucide-react'
import type { Product } from '@/lib/product-data'
import { formatPrice, calculateSavings } from '@/lib/utils'

interface GiftSubscriptionsProps {
  products: Product[]
}

export default function GiftSubscriptions({ products }: GiftSubscriptionsProps) {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 shadow-lg mb-6">
            <Gift className="w-4 h-4 text-[#D5BFA3]" />
            <span className="text-[#4B2E2E] text-sm font-semibold tracking-wide">
              GIFT SUBSCRIPTIONS
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-[#4B2E2E] mb-6 tracking-tight">
            Perfect Gifts for
            <span className="block bg-gradient-to-r from-[#9E7C83] to-[#6E6658] bg-clip-text text-transparent">
              Coffee Lovers
            </span>
          </h2>
          <p className="text-xl text-[#6E6658] max-w-3xl mx-auto font-light leading-relaxed">
            Give the gift of exceptional coffee. Our gift subscriptions are perfect for birthdays,
            holidays, or any special occasion.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product, index) => (
            <Card
              key={product.id}
              className={`group hover:shadow-2xl transition-all duration-500 border-0 bg-white/70 backdrop-blur-xl hover:-translate-y-2 overflow-hidden relative ${
                product.badge === 'Best Value' ? 'ring-2 ring-[#D5BFA3] ring-opacity-50' : ''
              }`}
            >
              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge
                    className={`font-bold shadow-lg ${
                      product.badge === 'Best Value'
                        ? 'bg-gradient-to-r from-[#D5BFA3] to-[#9E7C83] text-white'
                        : 'bg-white/90 backdrop-blur-sm text-[#4B2E2E]'
                    }`}
                  >
                    {product.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#9E7C83] to-[#D5BFA3] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#4B2E2E] mb-2">
                  {product.giftDuration}
                </CardTitle>
                <p className="text-[#6E6658] font-light">{product.description}</p>
              </CardHeader>

              <CardContent className="text-center">
                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-black text-[#4B2E2E]">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  {product.originalPrice && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg text-[#6E6658] line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className="text-sm text-[#9E7C83] font-semibold">
                        Save {calculateSavings(product.originalPrice, product.price)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-[#6E6658]">
                    <Calendar className="w-4 h-4 mr-3 text-[#D5BFA3]" />
                    <span>{product.giftDuration} of premium coffee</span>
                  </div>
                  <div className="flex items-center text-[#6E6658]">
                    <Heart className="w-4 h-4 mr-3 text-[#D5BFA3]" />
                    <span>Beautiful gift packaging</span>
                  </div>
                  <div className="flex items-center text-[#6E6658]">
                    <Star className="w-4 h-4 mr-3 text-[#D5BFA3]" />
                    <span>Personalized gift message</span>
                  </div>
                  <div className="flex items-center text-[#6E6658]">
                    <Gift className="w-4 h-4 mr-3 text-[#D5BFA3]" />
                    <span>Recipient controls delivery</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 ${
                    product.badge === 'Best Value'
                      ? 'bg-gradient-to-r from-[#D5BFA3] to-[#9E7C83] hover:from-[#9E7C83] hover:to-[#D5BFA3] text-white'
                      : 'bg-gradient-to-r from-[#9E7C83] to-[#6E6658] hover:from-[#6E6658] hover:to-[#9E7C83] text-white'
                  }`}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Give This Gift
                </Button>

                <p className="text-xs text-[#6E6658] mt-3 font-light">
                  Delivered via email instantly
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
