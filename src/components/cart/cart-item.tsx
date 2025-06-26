"use client"

import Image from "next/image"
import { X, Minus, Plus } from "lucide-react"
import type { CartItem } from "../../app/context/cart-context"
import { Button } from "@/components/ui/button"

interface CartItemProps {
  item: CartItem
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
}

export default function CartItemComponent({ item, updateQuantity, removeItem }: CartItemProps) {
  const handleQuantityChange = (amount: number) => {
    const newQuantity = item.quantity + amount
    if (newQuantity >= 1) {
      updateQuantity(item.id, newQuantity)
    }
  }

  // Generate a placeholder image URL
  const placeholderImage = `/api/placeholder?text=${encodeURIComponent(item.name)}&width=80&height=80`

  // Use the first product image or a placeholder
  const productImage = item.images && item.images.length > 0 ? item.images[0] : placeholderImage

  return (
    <div className="flex items-start space-x-4 py-4">
      {/* Product image */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <Image src={productImage || "/placeholder.svg"} alt={item.name} fill className="object-cover" sizes="80px" />
      </div>

      {/* Product details */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <h3 className="text-sm font-medium text-coffee-dark">{item.name}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-gray-500"
            onClick={() => removeItem(item.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Product options */}
        {item.options && Object.keys(item.options).length > 0 && (
          <div className="mt-1 text-xs text-gray-500">
            {Object.entries(item.options).map(([key, value]) => (
              <div key={key}>
                {key}: {value}
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center border rounded">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => handleQuantityChange(-1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => handleQuantityChange(1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-sm font-medium text-coffee-dark">${(item.price * item.quantity).toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}
