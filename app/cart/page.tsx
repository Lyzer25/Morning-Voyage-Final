import React from 'react';
import { CartPageContent } from '@/components/cart/cart-page';

export default function CartPage() {
  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #F6F1EB 0%, #E7CFC7 100%)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CartPageContent />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Shopping Cart | Morning Voyage',
  description: 'Review your selected coffee products and proceed to checkout.',
};
