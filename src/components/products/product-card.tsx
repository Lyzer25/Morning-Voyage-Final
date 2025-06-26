"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import type { Product } from "../../types/product"
import { Button } from "@/components/ui/button"
import { useCart } from "../../app/context/cart-context"
import { cn } from "../../lib/utils"

interface ProductCardProps {
  product: Product
  className?: string
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(product, 1)
  }

  // Use a placeholder image if the product image is missing
  const productImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : `/api/placeholder?text=${encodeURIComponent(product.name)}&width=300&height=300`

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-md",
        className,
      )}
    >
      {/* Product badges */}
      <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
        {product.new && <span className="rounded bg-gold px-2 py-1 text-xs font-semibold text-coffee-dark">New</span>}
        {product.bestSeller && (
          <span className="rounded bg-coffee-dark px-2 py-1 text-xs font-semibold text-cream">Best Seller</span>
        )}
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">Sale</span>
        )}
      </div>

      {/* Product image */}
      <Link href={`/shop/${product.slug}`} className="aspect-square overflow-hidden">
        <Image
          src={productImage || "/placeholder.svg"}
          alt={product.name}
          width={300}
          height={300}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Product details */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/shop/${product.slug}`} className="mb-2">
          <h3 className="font-serif text-lg font-medium text-coffee-dark transition-colors hover:text-coffee-medium">
            {product.name}
          </h3>
        </Link>

        <div className="mb-4 flex items-center">
          <span className="font-medium text-coffee-dark">${product.price.toFixed(2)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="ml-2 text-sm text-gray-500 line-through">${product.compareAtPrice.toFixed(2)}</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
