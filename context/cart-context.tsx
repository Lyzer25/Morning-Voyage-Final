'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { ShoppingCart, CartItem, AddToCartRequest } from '@/lib/types';

interface CartState {
  cart: ShoppingCart | null;
  isLoading: boolean;
  error: string | null;
  isOpen: boolean; // for mini-cart visibility
}

interface CartContextType extends CartState {
  addToCart: (request: AddToCartRequest) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  refreshCart: () => Promise<void>;
}

type CartAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: ShoppingCart | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_OPEN'; payload: boolean }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload, isLoading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_OPEN':
      return { ...state, isOpen: action.payload };
    case 'CLEAR_CART':
      return { ...state, cart: null, isOpen: false };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: null,
    isLoading: false,
    error: null,
    isOpen: false
  });

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, []);

  // Close cart on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state.isOpen) {
        dispatch({ type: 'SET_OPEN', payload: false });
      }
    };

    if (state.isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [state.isOpen]);

  const refreshCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/cart', {
        cache: 'no-store',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_CART', payload: data.cart });
      } else {
        throw new Error('Failed to fetch cart');
      }
    } catch (error) {
      console.error('Cart fetch error:', error);
      dispatch({ type: 'SET_ERROR', payload: (error as any)?.message || 'Failed to load cart' });
    }
  };

  const addToCart = async (request: AddToCartRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_CART', payload: data.cart });
        dispatch({ type: 'SET_OPEN', payload: true }); // Show mini-cart after adding
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      dispatch({ type: 'SET_ERROR', payload: (error as any)?.message || 'Failed to add to cart' });
    }
  };

  const removeFromCart = async (productId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`/api/cart/items/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_CART', payload: data.cart });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove from cart');
      }
    } catch (error) {
      console.error('Remove from cart error:', error);
      dispatch({ type: 'SET_ERROR', payload: (error as any)?.message || 'Failed to remove from cart' });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_CART', payload: data.cart });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Update quantity error:', error);
      dispatch({ type: 'SET_ERROR', payload: (error as any)?.message || 'Failed to update quantity' });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'SET_OPEN', payload: true });
  };

  const closeCart = () => {
    dispatch({ type: 'SET_OPEN', payload: false });
  };

  const contextValue: CartContextType = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
