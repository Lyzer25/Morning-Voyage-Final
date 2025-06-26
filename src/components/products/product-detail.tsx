"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ShoppingCart, Heart, Share2 } from "lucide-react"
import type { Product } from "../../types/product"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "../../app/context/cart-context"
import { useToast } from "@/components/ui/use-toast"

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({})

  // Generate a placeholder image URL
  const placeholderImage = `/api/placeholder?text=${encodeURIComponent(product.name)}&width=600&height=600`

  // Use the first product image or a placeholder
  const [selectedImage, setSelectedImage] = useState(
    product.images && product.images.length > 0 ? product.images[0] : placeholderImage,
  )

  // Initialize selected options with first option of each variant
  useEffect(() => {
    if (product.variants) {
      const initialOptions: { [key: string]: string } = {}
      product.variants.forEach((variant) => {
        if (variant.options.length > 0) {
          initialOptions[variant.name] = variant.options[0]
        }
      })
      setSelectedOptions(initialOptions)
    }
  }, [product.variants])

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity)
    }
  }

  const handleOptionChange = (variantName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [variantName]: value,
    }))
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedOptions)
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} added to your cart`,
    })
  }

  // Ensure product images is an array
  const productImages = product.images && product.images.length > 0 ? product.images : [placeholderImage]

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Product images */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200">
          <Image
            src={selectedImage || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {productImages.map((image, index) => (
            <button
              key={index}
              className="relative aspect-square h-20 w-20 overflow-hidden rounded-md border"
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${product.name} - Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product info */}
      <div className="flex flex-col">
        <h1 className="font-serif text-3xl font-bold text-coffee-dark">{product.name}</h1>

        <div className="mt-4 flex items-center">
          <span className="text-2xl font-bold text-coffee-dark">${product.price.toFixed(2)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="ml-2 text-lg text-gray-500 line-through">${product.compareAtPrice.toFixed(2)}</span>
          )}
        </div>

        <div className="mt-6 space-y-6">
          {/* Product variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              {product.variants.map((variant) => (
                <div key={variant.id}>
                  <label className="mb-2 block text-sm font-medium">{variant.name}</label>
                  <Select
                    value={selectedOptions[variant.name] || ""}
                    onValueChange={(value) => handleOptionChange(variant.name, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select ${variant.name}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {variant.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}

          {/* Quantity selector */}
          <div>
            <label className="mb-2 block text-sm font-medium">Quantity</label>
            <div className="flex h-10 w-32 items-center rounded-md border">
              <button
                type="button"
                className="flex h-full w-10 items-center justify-center border-r text-lg font-medium"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                className="h-full w-12 border-none bg-transparent text-center focus:outline-none focus:ring-0"
                value={quantity}
                min={1}
                max={product.stock}
                onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value))}
              />
              <button
                type="button"
                className="flex h-full w-10 items-center justify-center border-l text-lg font-medium"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart button */}
          <div className="flex space-x-4">
            <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.stock <= 0}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
            <Button variant="outline" size="icon" className="h-11 w-11">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="h-11 w-11">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Product description */}
          <div className="prose prose-sm mt-6 max-w-none text-gray-600">
            <p>{product.description}</p>
          </div>

          {/* Product tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
