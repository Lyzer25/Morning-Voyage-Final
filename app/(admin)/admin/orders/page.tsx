import React from 'react';
import { OrderManagerContent } from '@/components/admin/order-manager';

export default function OrderManagerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrderManagerContent />
      </div>
    </div>
  );
}
