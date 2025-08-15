'use client';

import { CartProvider } from '@/context/cart-context';
import { MiniCart } from '@/components/cart/mini-cart';

interface CartRootClientProps {
  children: React.ReactNode;
}

export function CartRootClient({ children }: CartRootClientProps) {
  return (
    <CartProvider>
      {children}
      <MiniCart />
    </CartProvider>
  );
}
