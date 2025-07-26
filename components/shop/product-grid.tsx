"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, ShoppingCart, Eye, Coffee, Shirt, Wrench } from "lucide-react"
import { useState } from "react"
import { formatPrice } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Product {
  sku: string
  productName: string
  category: string
  subcategory: string
  price: number
  originalPrice?: number
  rating?: number
  reviews?: number
  badge?: string
  description: string
  image?: string
  inStock: boolean
  featured: boolean
  [key: string]: any
}

interface ProductGridProps {
  products: Product[]
  viewMode: "grid" | "list"
}

const categoryIcons = {
  coffee: Coffee,
  fashion: Shirt,
  equipment: Wrench,
}

const categoryGradients = {
  coffee: "from-[#4B2E2E] to-[#6E6658]",
  fashion: "from-[#9E7C83] to-[#6E6658]",
  equipment: "from-[#D5BFA3] to-[#9E7C83]",
}

export default function ProductGrid({ products, viewMode }: ProductGridProps) {
  const router = useRouter()
  const [favorites, setFavorites] = useState<string[]>([])

  const handleProductClick = (product: Product) => {
    const slug = product.sku.toLowerCase().replace(/[^a-z0-9]/g, "-")
    router.push(`/product/${slug}`)
  }

  const toggleFavorite = (productSku: string) => {
    setFavorites((prev) =>
      prev.includes(productSku) ? prev.filter((sku) => sku !== productSku) : [...prev, productSku],
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-gradient-to-br from-[#D5BFA3] to-[#9E7C83] rounded-3xl mx-auto mb-6 flex items-center justify-center">
          <Coffee className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-[#4B2E2E] mb-4">No products found</h3>
        <p className="text-[#6E6658] font-light">Try adjusting your filters or search terms</p>
      </div>
    )
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-6">
        {products.map((product) => {
          const CategoryIcon = categoryIcons[product.category as keyof typeof categoryIcons]
          const gradient = categoryGradients[product.category as keyof typeof categoryGradients]

          return (
            <Card
              key={product.sku}
              className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/70 backdrop-blur-xl hover:-translate-y-1 overflow-hidden cursor-pointer"
              onClick={() => handleProductClick(product)}
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
                          <CategoryIcon className="w-8 h-8 text-white" />
                        </div>
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
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(product.sku)
                        }}
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg"
                      >
                        <Heart
                          className={`w-4 h-4 ${favorites.includes(product.sku) ? "fill-red-500 text-red-500" : "text-[#6E6658]"}`}
                        />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProductClick(product)
                        }}
                      >
                        <Eye className="w-4 h-4 text-[#6E6658]" />
                      </Button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      {/* Category & Rating */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="border-[#D5BFA3] text-[#6E6658] capitalize">
                          {product.category}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-[#D5BFA3] text-[#D5BFA3]" />
                          <span className="text-sm font-semibold text-[#4B2E2E]">{product.rating || 4.8}</span>
                          <span className="text-xs text-[#6E6658]">({product.reviews || 124})</span>
                        </div>
                      </div>

                      {/* Product Name */}
                      <h3 className="text-xl font-bold text-[#4B2E2E] mb-2 group-hover:text-[#6E6658] transition-colors">
                        {product.productName}
                      </h3>

                      {/* Description */}
                      <p className="text-[#6E6658] mb-4 font-light leading-relaxed">{product.description}</p>

                      {/* Additional Info */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.category === "coffee" && product.tastingNotes && (
                          <div className="flex flex-wrap gap-1">
                            {product.tastingNotes.slice(0, 3).map((note: string) => (
                              <Badge key={note} variant="secondary" className="text-xs bg-[#F6F1EB] text-[#6E6658]">
                                {note}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-[#4B2E2E]">{formatPrice(product.price)}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-[#6E6658] line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Add to cart logic
                        }}
                        className="bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] hover:from-[#6E6658] hover:to-[#4B2E2E] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                        Add to Cart
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
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product) => {
        const CategoryIcon = categoryIcons[product.category as keyof typeof categoryIcons]
        const gradient = categoryGradients[product.category as keyof typeof categoryGradients]

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

              {/* Heart Icon */}
              <div className="absolute top-4 right-4 z-10">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(product.sku)
                  }}
                  className="w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg"
                >
                  <Heart
                    className={`w-4 h-4 ${favorites.includes(product.sku) ? "fill-red-500 text-red-500" : "text-[#6E6658]"}`}
                  />
                </Button>
              </div>

              {/* Product Image */}
              <div
                className={`aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
                <div className="text-center text-white relative z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <CategoryIcon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm opacity-90 font-medium capitalize">{product.category}</p>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <Button
                      size="sm"
                      className="bg-white text-[#4B2E2E] hover:bg-white/90 rounded-full shadow-xl"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleProductClick(product)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Quick View
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Rating */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-[#D5BFA3] text-[#D5BFA3]" />
                    <span className="text-sm font-semibold text-[#4B2E2E]">{product.rating || 4.8}</span>
                    <span className="text-xs text-[#6E6658]">({product.reviews || 124})</span>
                  </div>
                  <Badge variant="outline" className="border-[#D5BFA3] text-[#6E6658] capitalize text-xs">
                    {product.category}
                  </Badge>
                </div>

                {/* Product Name */}
                <h3 className="text-lg font-bold text-[#4B2E2E] mb-2 group-hover:text-[#6E6658] transition-colors">
                  {product.productName}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#6E6658] mb-4 font-light leading-relaxed line-clamp-2">
                  {product.description}
                </p>

                {/* Additional Info */}
                {product.category === "coffee" && product.tastingNotes && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {product.tastingNotes.slice(0, 2).map((note: string) => (
                      <Badge key={note} variant="secondary" className="text-xs bg-[#F6F1EB] text-[#6E6658]">
                        {note}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-[#4B2E2E]">{formatPrice(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-[#6E6658] line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Add to cart logic
                    }}
                    className="bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] hover:from-[#6E6658] hover:to-[#4B2E2E] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1 group-hover/btn:scale-110 transition-transform duration-300" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
