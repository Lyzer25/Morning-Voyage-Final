'use client';

import React, { useRef, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import Link from 'next/link';

export function MiniCart() {
  const { 
    cart, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart,
    isLoading 
  } = useCart();
  
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap implementation
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the panel
      if (panelRef.current) {
        panelRef.current.focus();
      }
    } else {
      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Focus trap handler
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen || !panelRef.current) return;

    if (event.key === 'Tab') {
      const focusableElements = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab (backward)
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab (forward)
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={closeCart}
        aria-hidden="true"
      />
      
      {/* Slide-out Panel */}
      <div 
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 focus:outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        data-testid="mini-cart"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{background: 'linear-gradient(135deg, #F6F1EB 0%, #E7CFC7 100%)'}}>
            <h2 id="cart-title" className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-primary focus:ring-offset-2"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto">
            {!cart || cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center" data-testid="empty-cart-message">
                <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some coffee to get started!</p>
                <Link 
                  href="/coffee"
                  onClick={closeCart}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-coffee-primary hover:bg-coffee-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-primary focus:ring-offset-2"
                >
                  Shop Coffee
                </Link>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {cart.items.map((item) => (
                  <div key={item.product_id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg" data-testid="cart-item">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.product_name}</h4>
                      <p className="text-sm text-gray-500">SKU: {item.product_id}</p>
                      <p className="text-sm font-medium text-coffee-primary">
                        ${item.base_price.toFixed(2)} each
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        disabled={isLoading}
                        className="p-1 hover:bg-gray-200 rounded-full disabled:opacity-50 transition-colors focus:outline-none focus:ring-1 focus:ring-coffee-primary"
                        aria-label={`Decrease quantity of ${item.product_name}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      
                      <span className="w-8 text-center font-medium" aria-label={`Quantity: ${item.quantity}`}>
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={isLoading}
                        className="p-1 hover:bg-gray-200 rounded-full disabled:opacity-50 transition-colors focus:outline-none focus:ring-1 focus:ring-coffee-primary"
                        aria-label={`Increase quantity of ${item.product_name}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        disabled={isLoading}
                        className="p-1 hover:bg-red-100 text-red-600 rounded-full disabled:opacity-50 ml-2 transition-colors focus:outline-none focus:ring-1 focus:ring-red-500"
                        aria-label={`Remove ${item.product_name} from cart`}
                        data-testid="remove-item-button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="text-right min-w-0">
                      <p className="font-medium text-gray-900">
                        ${item.line_total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Totals */}
          {cart && cart.items.length > 0 && (
            <div className="border-t p-4 space-y-4" style={{background: 'linear-gradient(135deg, #F6F1EB 0%, #E7CFC7 100%)'}}>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-semibold text-coffee-primary">
                  ${cart.totals.total.toFixed(2)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Link 
                  href="/cart"
                  onClick={closeCart}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-coffee-primary text-coffee-primary bg-white hover:bg-coffee-primary hover:text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-primary focus:ring-offset-2"
                >
                  View Cart
                </Link>
                
                <Link 
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-white bg-coffee-primary hover:bg-coffee-secondary font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-primary focus:ring-offset-2"
                >
                  Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
