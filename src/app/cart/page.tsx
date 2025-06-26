"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import MainLayout from "../../components/layout/main-layout"
import CartItemComponent from "../../components/cart/cart-item"
import CartSummary from "../../components/cart/cart-summary"
import { useCart } from "../context/cart-context"

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart()

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 font-serif text-3xl font-bold text-coffee-dark">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-12 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-400" />
            <h2 className="mt-4 font-serif text-2xl font-medium text-coffee-dark">Your cart is empty</h2>
            <p className="mt-2 text-gray-600">Looks like you haven't added any products to your cart yet.</p>
            <Button asChild className="mt-8">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white">
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <CartItemComponent
                      key={item.id}
                      item={item}
                      updateQuantity={updateQuantity}
                      removeItem={removeFromCart}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <CartSummary />
              <div className="mt-8 text-center">
                <Link href="/shop" className="text-sm text-coffee-medium hover:text-coffee-dark">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
