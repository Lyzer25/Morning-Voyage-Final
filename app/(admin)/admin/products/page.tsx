import { getServerSession } from "@/lib/auth";
import { getProducts } from "@/lib/csv-data";
import { redirect } from "next/navigation";
import ProductManager from "@/components/admin/product-manager";
import type { Product } from "@/lib/types";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    redirect('/account/login');
  }

  let products: Product[] = [];
  try {
    products = await getProducts({ forceRefresh: false });
  } catch (err) {
    console.error('Failed to load products for admin products page', err);
    products = [];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header with back button */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <a 
              href="/admin" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </a>
            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          </div>
        </div>
      </div>
      
      {/* Original Product Manager Component */}
      <div className="container mx-auto px-4 py-8">
        <ProductManager initialProducts={products} />
      </div>
    </div>
  );
}
