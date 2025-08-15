'use client';

import React from 'react';
import { ArrowLeft, Plus, Minus, X, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import Link from 'next/link';

export function CartPageContent() {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart,
    isLoading 
  } = useCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-8" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-xl text-gray-600 mb-8">Discover our premium coffee collection</p>
        <Link 
          href="/coffee"
          className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-coffee-primary hover:bg-coffee-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-primary focus:ring-offset-2"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        
        <Link 
          href="/coffee"
          className="inline-flex items-center px-6 py-3 border border-coffee-primary text-coffee-primary bg-white hover:bg-coffee-primary hover:text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-primary focus:ring-offset-2"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.product_id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-6">
                {/* Product Image Placeholder */}
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="h-8 w-8 text-gray-400" />
                </div>
                
                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{item.product_name}</h3>
                  <p className="text-gray-600">SKU: {item.product_id}</p>
                  <p className="text-lg font-medium text-coffee-primary mt-1">
                    ${item.base_price.toFixed(2)} each
                  </p>
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center space-x-4 flex-shrink-0">
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      disabled={isLoading}
                      className="p-2 hover:bg-gray-200 rounded-md disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-primary focus:ring-offset-1"
                    aria-label={`Decrease quantity of ${item.product_name}`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    
                    <span className="w-12 text-center font-medium text-lg" aria-label={`Quantity: ${item.quantity}`}>
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      disabled={isLoading}
                      className="p-2 hover:bg-gray-200 rounded-md disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-primary focus:ring-offset-1"
                    aria-label={`Increase quantity of ${item.product_name}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    disabled={isLoading}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-md disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                    aria-label={`Remove ${item.product_name} from cart`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Line Total */}
                <div className="text-right flex-shrink-0 min-w-0">
                  <p className="text-xl font-semibold text-gray-900">
                    ${item.line_total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${cart.totals.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-coffee-primary">${cart.totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              <Link 
                href="/checkout"
                className="w-full inline-flex justify-center items-center px-6 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-coffee-primary hover:bg-coffee-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-primary focus:ring-offset-2"
              >
                Proceed to Checkout
              </Link>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Free shipping on all orders • Secure checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
