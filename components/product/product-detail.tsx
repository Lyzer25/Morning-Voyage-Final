"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  Heart,
  ShoppingCart,
  Share2,
  Coffee,
  MapPin,
  Scale,
  Package,
  Award,
  Leaf,
  ArrowLeft,
  Plus,
  Minus,
  Check,
} from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { useRouter } from "next/navigation"
import type { GroupedProduct } from "@/lib/product-variants"
import {
  getVariantByFormat,
  getFormatDisplayName,
  getFormatDescription,
  hasMultipleFormats,
} from "@/lib/product-variants"

interface ProductDetailProps {
  product: GroupedProduct
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedFormat, setSelectedFormat] = useState(product.defaultVariant.format)
  const [isFavorite, setIsFavorite] = useState(false)

  // Get current variant based on selected format
  const currentVariant = getVariantByFormat(product, selectedFormat) || product.defaultVariant

  const handleQuantityChange = (change: number) => {
    setQuantity(Math.max(1, quantity + change))
  }

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log("Added to cart:", {
      baseSku: product.baseSku,
      variantSku: currentVariant.sku,
      productName: product.productName,
      format: selectedFormat,
      quantity,
      price: currentVariant.price,
      totalPrice: currentVariant.price * quantity,
    })

    // You can integrate with your cart system here
    alert(`Added ${quantity}x ${product.productName} (${getFormatDisplayName(selectedFormat)}) to cart!`)
  }

  const roastColors = {
    light: "from-[#D5BFA3] to-[#E7CFC7]",
    medium: "from-[#9E7C83] to-[#D5BFA3]",
    "medium-dark": "from-[#6E6658] to-[#9E7C83]",
    dark: "from-[#4B2E2E] to-[#6E6658]",
  }

  const gradient = roastColors[product.roastLevel as keyof typeof roastColors] || roastColors.medium

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8 text-[#6E6658] hover:text-[#4B2E2E] hover:bg-white/60 rounded-xl transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Coffee
        </Button>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Product Image */}
          <div className="relative">
            <Card className="overflow-hidden border-0 shadow-2xl bg-white/70 backdrop-blur-xl">
              <CardContent className="p-0">
                <div
                  className={`aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0">
                    <div className="absolute top-8 left-8 w-32 h-32 bg-white/5 rounded-full"></div>
                    <div className="absolute bottom-8 right-8 w-24 h-24 bg-white/5 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full"></div>
                  </div>

                  <div className="text-center text-white relative z-10">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
                      <Coffee className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{product.productName}</h3>
                    <p className="text-lg opacity-90 font-light capitalize">{product.roastLevel} Roast</p>
                    <p className="text-sm opacity-75 mt-2">{getFormatDisplayName(selectedFormat)}</p>
                  </div>

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-white/90 backdrop-blur-sm text-[#4B2E2E] font-bold shadow-lg text-sm px-4 py-2">
                        {product.badge}
                      </Badge>
                    </div>
                  )}

                  {/* Format Indicator */}
                  {hasMultipleFormats(product) && (
                    <div className="absolute bottom-6 left-6">
                      <Badge className="bg-[#D5BFA3] text-white font-bold shadow-lg">
                        {product.availableFormats.length} formats available
                      </Badge>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute top-6 right-6 flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg"
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-[#6E6658]"}`} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg"
                    >
                      <Share2 className="w-5 h-5 text-[#6E6658]" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="border-[#D5BFA3] text-[#6E6658] capitalize">
                  {product.category}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-[#D5BFA3] text-[#D5BFA3]" />
                  <span className="text-sm font-semibold text-[#4B2E2E]">4.8</span>
                  <span className="text-xs text-[#6E6658]">(124 reviews)</span>
                </div>
              </div>

              <h1 className="text-4xl font-black text-[#4B2E2E] mb-4 leading-tight">{product.productName}</h1>

              <p className="text-xl text-[#6E6658] leading-relaxed font-light">{product.description}</p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-[#4B2E2E]">{formatPrice(currentVariant.price)}</span>
              {currentVariant.originalPrice && currentVariant.originalPrice > currentVariant.price && (
                <span className="text-xl text-[#6E6658] line-through">{formatPrice(currentVariant.originalPrice)}</span>
              )}
              <Badge className="bg-[#D5BFA3] text-white">Fresh Roasted</Badge>
            </div>

            {/* Format Selection - Show when multiple formats available */}
            {hasMultipleFormats(product) && (
              <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-[#4B2E2E] mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Choose Format
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {product.availableFormats.map((format) => {
                      const variant = getVariantByFormat(product, format)
                      if (!variant) return null

                      const isSelected = selectedFormat === format
                      const priceDifference =
                        variant.price !== product.defaultVariant.price
                          ? variant.price - product.defaultVariant.price
                          : 0

                      return (
                        <Button
                          key={format}
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => setSelectedFormat(format)}
                          className={`p-4 h-auto rounded-xl transition-all duration-300 relative ${
                            isSelected
                              ? "bg-[#4B2E2E] text-white shadow-lg ring-2 ring-[#D5BFA3]"
                              : "border-2 border-[#D5BFA3] text-[#6E6658] hover:bg-[#F6F1EB] hover:border-[#4B2E2E]"
                          }`}
                        >
                          <div className="text-left w-full">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{getFormatDisplayName(format)}</span>
                                  {isSelected && <Check className="w-4 h-4" />}
                                </div>
                                <div className="text-xs opacity-75 mt-1">{getFormatDescription(format)}</div>
                                {variant.weight && (
                                  <div className="text-xs opacity-75 mt-1">Weight: {variant.weight}</div>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <div className="font-bold">{formatPrice(variant.price)}</div>
                                {priceDifference !== 0 && (
                                  <div className="text-xs opacity-75">
                                    {priceDifference > 0 ? "+" : ""}
                                    {formatPrice(priceDifference)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                  <div className="mt-4 text-sm text-[#6E6658] bg-[#F6F1EB] rounded-lg p-3">
                    <strong>Current Selection:</strong> {getFormatDisplayName(selectedFormat)} -{" "}
                    {getFormatDescription(selectedFormat)}
                    <br />
                    <strong>SKU:</strong> {currentVariant.sku}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Coffee Details */}
            <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#4B2E2E] mb-4">Coffee Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {product.origin && (
                    <div className="flex items-center text-[#6E6658]">
                      <MapPin className="w-4 h-4 mr-3 text-[#D5BFA3]" />
                      <div>
                        <div className="text-xs text-[#9E7C83] uppercase tracking-wide">Origin</div>
                        <div className="font-semibold">{product.origin}</div>
                      </div>
                    </div>
                  )}

                  {product.roastLevel && (
                    <div className="flex items-center text-[#6E6658]">
                      <Scale className="w-4 h-4 mr-3 text-[#D5BFA3]" />
                      <div>
                        <div className="text-xs text-[#9E7C83] uppercase tracking-wide">Roast Level</div>
                        <div className="font-semibold capitalize">{product.roastLevel}</div>
                      </div>
                    </div>
                  )}

                  {currentVariant.weight && (
                    <div className="flex items-center text-[#6E6658]">
                      <Package className="w-4 h-4 mr-3 text-[#D5BFA3]" />
                      <div>
                        <div className="text-xs text-[#9E7C83] uppercase tracking-wide">Weight</div>
                        <div className="font-semibold">{currentVariant.weight}</div>
                      </div>
                    </div>
                  )}

                  {product.processingMethod && (
                    <div className="flex items-center text-[#6E6658]">
                      <Leaf className="w-4 h-4 mr-3 text-[#D5BFA3]" />
                      <div>
                        <div className="text-xs text-[#9E7C83] uppercase tracking-wide">Processing</div>
                        <div className="font-semibold capitalize">{product.processingMethod}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tasting Notes */}
            {product.tastingNotes && product.tastingNotes.length > 0 && (
              <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-[#4B2E2E] mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-[#D5BFA3]" />
                    Tasting Notes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tastingNotes.map((note) => (
                      <Badge key={note} variant="secondary" className="bg-[#F6F1EB] text-[#6E6658] px-3 py-1">
                        {note}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quantity & Add to Cart */}
            <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#4B2E2E]">Quantity</h3>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-full border-2 border-[#D5BFA3]"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-xl font-bold text-[#4B2E2E] min-w-[3rem] text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      className="w-10 h-10 rounded-full border-2 border-[#D5BFA3]"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] hover:from-[#6E6658] hover:to-[#4B2E2E] text-white py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group font-bold text-lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                  Add {quantity} to Cart - {formatPrice(currentVariant.price * quantity)}
                </Button>

                <div className="mt-4 text-center text-sm text-[#6E6658]">
                  ✨ Roasted fresh after you order • Free shipping on orders $35+
                </div>

                {/* Current Selection Summary */}
                <div className="mt-4 p-3 bg-[#F6F1EB] rounded-lg text-sm">
                  <div className="font-semibold text-[#4B2E2E] mb-1">Your Selection:</div>
                  <div className="text-[#6E6658]">
                    {product.productName} - {getFormatDisplayName(selectedFormat)}
                    <br />
                    SKU: {currentVariant.sku} • {currentVariant.weight || "Standard size"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
