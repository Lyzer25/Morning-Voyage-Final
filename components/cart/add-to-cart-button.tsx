'use client';

import React, { useState } from 'react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useCart } from '@/context/cart-context';

interface AddToCartButtonProps {
  productId: string;
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isSubscription?: boolean;
  subscriptionInterval?: string;
  disabled?: boolean;
}

export function AddToCartButton({
  productId,
  className = '',
  children,
  variant = 'primary',
  size = 'md',
  isSubscription = false,
  subscriptionInterval,
  disabled = false
}: AddToCartButtonProps) {
  const { addToCart, isLoading } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async () => {
    if (disabled || isLoading) return;
    
    try {
      await addToCart({
        product_id: productId,
        quantity: 1,
        is_subscription: isSubscription,
        subscription_interval: subscriptionInterval
      });
      
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Error is handled in context, so we don't need to show it here
    }
  };

  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };
  
  const variantClasses = {
    primary: "bg-coffee-primary text-white hover:bg-coffee-secondary focus:ring-coffee-primary disabled:hover:bg-coffee-primary",
    secondary: "bg-white text-coffee-primary border border-coffee-primary hover:bg-coffee-primary hover:text-white focus:ring-coffee-primary disabled:hover:bg-white disabled:hover:text-coffee-primary"
  };

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  const isDisabled = disabled || isLoading;

  if (justAdded) {
    return (
      <button className={`${classes} bg-green-600 hover:bg-green-600 focus:ring-green-500`} disabled>
        <Check className="h-4 w-4 mr-2" />
        Added to Cart!
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={classes}
      aria-label={`Add ${productId} to cart`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <ShoppingCart className="h-4 w-4 mr-2" />
      )}
      {children || (isLoading ? 'Adding...' : 'Add to Cart')}
    </button>
  );
}
