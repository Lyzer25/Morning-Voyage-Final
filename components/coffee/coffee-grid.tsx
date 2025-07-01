'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Heart, Eye, Coffee, MapPin } from 'lucide-react'
import { useState, memo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { GroupedProduct } from '@/lib/product-variants'
import { getPriceDisplay, hasMultipleFormats, getFormatDisplayName, generateProductSlug } from '@/lib/product-variants'

interface CoffeeGridProps {
  products: GroupedProduct[]
  viewMode: 'grid' | 'list'
}

const roastColors = {
  light: 'from-[#D5BFA3] to-[#E7CFC7]',
  medium: 'from-[#9E7C83] to-[#D5BFA3]',
  'medium-dark': 'from-[#6E6658] to-[#9E7C83]',
  dark: 'from-[#4B2E2E] to-[#6E6658]',
} as const

const CoffeeGrid = memo(function CoffeeGrid({ products, viewMode }: CoffeeGridProps) {
  const router = useRouter()
  const [favorites, setFavorites] = useState<string[]>([])

  // Memoized handlers for better performance
  const handleProductClick = useCallback((product: GroupedProduct) => {
    const slug = generateProductSlug(product.baseSku)
    router.push(`/product/${slug}`)
  }, [router])

  const toggleFavorite = useCallback((productSku: string) => {
    if (favorites.includes(productSku)) {
      setFavorites(favorites.filter(sku => sku !== productSku))
    } else {
      setFavorites([...favorites, productSku])
    }
  }, [favorites])

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-gradient-to-br from-[#4B2E2E] to-[#6E6658] rounded-3xl mx-auto mb-6 flex items-center justify-center">
          <Coffee className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-[#4B2E2E] mb-4">No coffee found</h3>
        <p className="text-[#6E6658] font-light">Try adjusting your filters or search terms</p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        {products.map(product => {
          const gradient =
            roastColors[product.roastLevel as keyof typeof roastColors] || roastColors.medium

          return (
          <Card
            key={product.baseSku}
            className="group hover:shadow-xl transition-transform duration-300 border-0 bg-white/95 hover:-translate-y-1 overflow-hidden cursor-pointer min-h-[200px]"
            onClick={() => handleProductClick(product)}
            style={{
              contentVisibility: 'auto',
              containIntrinsicSize: '200px',
              contain: 'layout style paint'
            }}
          >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Product Image */}
                  <div className="relative w-48 h-48 flex-shrink-0">
                    <div
                      className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}
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
                    </div>

                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-white/90 backdrop-blur-sm text-[#4B2E2E] font-bold shadow-lg">
                          {product.badge}
                        </Badge>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={e => {
                          e.stopPropagation()
                          toggleFavorite(product.baseSku)
                        }}
                        className="w-8 h-8 bg-white/95 hover:bg-white rounded-full shadow-lg transition-colors duration-200"
                      >
                        <Heart
                          className={`w-4 h-4 ${favorites.includes(product.baseSku) ? 'fill-red-500 text-red-500' : 'text-[#6E6658]'}`}
                        />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 bg-white/95 hover:bg-white rounded-full shadow-lg transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4 text-[#6E6658]" />
                      </Button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      {/* Header Info */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant="outline"
                          className="border-[#D5BFA3] text-[#6E6658] capitalize"
                        >
                          {product.category}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-[#D5BFA3] text-[#D5BFA3]" />
                          <span className="text-sm font-semibold text-[#4B2E2E]">4.8</span>
                          <span className="text-xs text-[#6E6658]">(124)</span>
                        </div>
                      </div>

                      {/* Product Name */}
                      <h3 className="text-xl font-bold text-[#4B2E2E] mb-2 group-hover:text-[#6E6658] transition-colors">
                        {product.productName}
                      </h3>

                      {/* Description */}
                      <p className="text-[#6E6658] mb-4 font-light leading-relaxed">
                        {product.description}
                      </p>

                      {/* Coffee Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        {product.origin && (
                          <div className="flex items-center text-[#6E6658]">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{product.origin}</span>
                          </div>
                        )}
                      </div>

                      {/* Tasting Notes */}
                      {product.tastingNotes && product.tastingNotes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {product.tastingNotes.slice(0, 3).map(note => (
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
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-[#4B2E2E]">
                          {getPriceDisplay(product)}
                        </span>
                        {hasMultipleFormats(product) && (
                          <span className="text-xs text-[#6E6658]">starting at</span>
                        )}
                      </div>
                      <Button
                        onClick={e => {
                          e.stopPropagation()
                          handleProductClick(product)
                        }}
                        className="bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] hover:from-[#6E6658] hover:to-[#4B2E2E] text-white rounded-2xl shadow-lg hover:shadow-xl transition-colors duration-200 group/btn"
                      >
                        <Eye className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                        {hasMultipleFormats(product) ? 'Choose Format' : 'View Details'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div 
      className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      style={{ 
        minHeight: `${Math.ceil(products.length / 4) * 520}px`,
        willChange: 'auto'
      }}
    >
      {products.map(product => {
        const gradient =
          roastColors[product.roastLevel as keyof typeof roastColors] || roastColors.medium

        return (
          <Card
            key={product.baseSku}
            className="group hover:shadow-xl transition-transform duration-300 border-0 bg-white/95 hover:-translate-y-1 overflow-hidden cursor-pointer min-h-[500px] flex flex-col"
            onClick={() => handleProductClick(product)}
            style={{
              contentVisibility: 'auto',
              containIntrinsicSize: '500px',
              contain: 'layout style paint',
              willChange: 'transform'
            }}
          >
            <CardContent className="p-0 relative flex flex-col h-full">
              {/* Badge - Always reserve space */}
              <div className="absolute top-4 left-4 z-10 min-h-[24px]">
                {product.badge && (
                  <Badge className="bg-white/95 text-[#4B2E2E] font-bold shadow-lg">
                    {product.badge}
                  </Badge>
                )}
              </div>

              {/* Heart Icon */}
              <div className="absolute top-4 right-4 z-10">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={e => {
                    e.stopPropagation()
                    toggleFavorite(product.baseSku)
                  }}
                  className="w-8 h-8 bg-white/95 hover:bg-white rounded-full shadow-lg transition-colors duration-200"
                >
                  <Heart
                    className={`w-4 h-4 ${favorites.includes(product.baseSku) ? 'fill-red-500 text-red-500' : 'text-[#6E6658]'}`}
                  />
                </Button>
              </div>

              {/* Product Image */}
              <div
                className={`aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
                <div className="text-center text-white relative z-10">
                  <div className="w-16 h-16 bg-white/25 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Coffee className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm opacity-90 font-medium capitalize">
                    {product.roastLevel} Roast
                  </p>
                </div>

                {/* Hover Overlay - Optimized */}
                <div 
                  className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                  style={{ willChange: 'opacity' }}
                >
                  <div className="flex gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                    <Button
                      size="sm"
                      className="bg-white text-[#4B2E2E] hover:bg-white/95 rounded-full shadow-lg transition-colors duration-200"
                      onClick={e => {
                        e.stopPropagation()
                        handleProductClick(product)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {hasMultipleFormats(product) ? 'Choose Format' : 'View Details'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Product Info - Increased padding and better spacing */}
              <div className="p-6 space-y-4">
                {/* Header Info */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-[#D5BFA3] text-[#6E6658] capitalize text-xs"
                  >
                    {product.category}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-[#D5BFA3] text-[#D5BFA3]" />
                    <span className="text-sm font-semibold text-[#4B2E2E]">4.8</span>
                    <span className="text-xs text-[#6E6658]">(124)</span>
                  </div>
                </div>

                {/* Product Name */}
                <h3 className="text-lg font-bold text-[#4B2E2E] group-hover:text-[#6E6658] transition-colors leading-tight">
                  {product.productName}
                </h3>

                {/* Origin */}
                {product.origin && (
                  <div className="flex items-center text-sm text-[#6E6658]">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{product.origin}</span>
                  </div>
                )}

                {/* Tasting Notes - Reserved space to prevent CLS */}
                <div className="min-h-[32px] flex flex-wrap gap-1">
                  {product.tastingNotes && product.tastingNotes.length > 0 && 
                    product.tastingNotes.slice(0, 2).map(note => (
                      <Badge
                        key={note}
                        variant="secondary"
                        className="text-xs bg-[#F6F1EB] text-[#6E6658] px-2 py-1"
                      >
                        {note}
                      </Badge>
                    ))
                  }
                </div>

                {/* Price & Action - Reserved space to prevent CLS */}
                <div className="min-h-[60px] flex items-end justify-between pt-2">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-[#4B2E2E]">
                      {getPriceDisplay(product)}
                    </span>
                    {hasMultipleFormats(product) && (
                      <span className="text-xs text-[#6E6658] leading-none">starting at</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={e => {
                      e.stopPropagation()
                      handleProductClick(product)
                    }}
                    className="bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] hover:from-[#6E6658] hover:to-[#4B2E2E] text-white rounded-full shadow-lg hover:shadow-xl transition-colors duration-200 group/btn px-4 py-2"
                  >
                    <Eye className="w-4 h-4 mr-1 group-hover/btn:scale-110 transition-transform duration-300" />
                    {hasMultipleFormats(product) ? 'Choose' : 'View'}
                  </Button>
                </div>

                {/* Format Badges - Moved to bottom with proper spacing */}
                {hasMultipleFormats(product) && (
                  <div className="pt-2 border-t border-[#F6F1EB]">
                    <div className="flex flex-wrap gap-1">
                      {product.availableFormats.map(format => (
                        <Badge
                          key={format}
                          variant="outline"
                          className="text-xs border-[#E7CFC7] text-[#6E6658] px-2 py-1"
                        >
                          {getFormatDisplayName(format)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
})

export default CoffeeGrid
