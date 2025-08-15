'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/cart-context';

export function CartIcon() {
  const { cart, openCart } = useCart();
  
  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  return (
    <button
      onClick={openCart}
      className="relative p-2 text-gray-700 hover:text-coffee-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-coffee-primary focus:ring-offset-2"
      aria-label={`Cart with ${itemCount} items`}
      data-testid="cart-icon"
    >
      <ShoppingBag className="h-6 w-6" />
      {itemCount > 0 && (
        <span 
          className="absolute -top-1 -right-1 h-5 w-5 bg-coffee-primary text-white text-xs font-medium rounded-full flex items-center justify-center"
          aria-label={`${itemCount} items in cart`}
          data-testid="cart-icon-count"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
