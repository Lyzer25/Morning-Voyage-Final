import { Button } from "@/components/ui/button"
import { useCart } from "../../app/context/cart-context"

export default function CartSummary() {
  const { cartItems, getCartTotal } = useCart()

  const subtotal = getCartTotal()
  const shipping = cartItems.length > 0 ? 5.99 : 0
  const tax = subtotal * 0.08 // 8% tax rate
  const total = subtotal + shipping + tax

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-serif text-lg font-medium text-coffee-dark">Order Summary</h2>

      <div className="mt-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">${shipping.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between">
            <span className="text-base font-medium text-coffee-dark">Total</span>
            <span className="text-base font-bold text-coffee-dark">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Button className="mt-6 w-full" size="lg" disabled={cartItems.length === 0}>
        Proceed to Checkout
      </Button>
    </div>
  )
}
