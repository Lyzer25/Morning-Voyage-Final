'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Coffee, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import type { SheetProduct } from '@/lib/google-sheets-integration'

interface ProductRecommendationsProps {
  products: SheetProduct[]
}

export default function ProductRecommendations({ products }: ProductRecommendationsProps) {
  const router = useRouter()

  if (products.length === 0) return null

  const handleProductClick = (product: SheetProduct) => {
    const slug = product.sku.toLowerCase().replace(/[^a-z0-9]/g, '-')
    router.push(`/product/${slug}`)
  }

  const roastColors = {
    light: 'from-[#D5BFA3] to-[#E7CFC7]',
    medium: 'from-[#9E7C83] to-[#D5BFA3]',
    dark: 'from-[#4B2E2E] to-[#6E6658]',
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white via-[#F6F1EB]/20 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 shadow-lg mb-6">
            <Coffee className="w-4 h-4 text-[#D5BFA3]" />
            <span className="text-[#4B2E2E] text-sm font-semibold tracking-wide">
              YOU MIGHT ALSO LIKE
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-[#4B2E2E] mb-6 tracking-tight">
            Related Products
          </h2>
          <p className="text-xl text-[#6E6658] max-w-2xl mx-auto font-light leading-relaxed">
            Discover more exceptional coffee from our curated collection
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(product => {
            const gradient =
              roastColors[product.roastLevel as keyof typeof roastColors] || roastColors.medium

            return (
              <Card
                key={product.sku}
                className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/70 backdrop-blur-xl hover:-translate-y-2 overflow-hidden cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                <CardContent className="p-0 relative">
                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-white/90 backdrop-blur-sm text-[#4B2E2E] font-bold shadow-lg">
                        {product.badge}
                      </Badge>
                    </div>
                  )}

                  {/* Product Image */}
                  <div
                    className={`aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
                    <div className="text-center text-white relative z-10">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <Coffee className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm opacity-90 font-medium capitalize">
                        {product.roastLevel} Roast
                      </p>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Button
                          size="sm"
                          className="bg-white text-[#4B2E2E] hover:bg-white/90 rounded-full shadow-xl"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Rating */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-[#D5BFA3] text-[#D5BFA3]" />
                        <span className="text-sm font-semibold text-[#4B2E2E]">4.8</span>
                        <span className="text-xs text-[#6E6658]">(124)</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-[#D5BFA3] text-[#6E6658] capitalize text-xs"
                      >
                        {product.category}
                      </Badge>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-lg font-bold text-[#4B2E2E] mb-2 group-hover:text-[#6E6658] transition-colors">
                      {product.productName}
                    </h3>

                    {/* Tasting Notes */}
                    {product.tastingNotes && product.tastingNotes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {product.tastingNotes.slice(0, 2).map(note => (
                          <Badge
                            key={note}
                            variant="secondary"
                            className="text-xs bg-[#F6F1EB] text-[#6E6658]"
                          >
                            {note}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-[#4B2E2E]">
                        {formatPrice(product.price)}
                      </span>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] hover:from-[#6E6658] hover:to-[#4B2E2E] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
