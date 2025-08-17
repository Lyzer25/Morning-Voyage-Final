import type { Product } from '@/lib/types';
import { devLog, prodError } from '@/lib/logger';

/**
 * Validates and normalizes product data from various possible API response formats
 * Handles: Product[], { products: Product[] }, { [key]: Product }, etc.
 */
export function validateProductsData(data: unknown): Product[] {
  if (!data) {
    throw new Error('Products data is null or undefined');
  }
  
  let products: unknown[];
  
  // Handle different possible API response structures
  if (Array.isArray(data)) {
    products = data;
    devLog('✅ Products data is array format:', { count: products.length });
  } else if (typeof data === 'object' && 'products' in data && Array.isArray((data as any).products)) {
    products = (data as any).products;
    devLog('✅ Products data is wrapped format:', { count: products.length });
  } else if (typeof data === 'object') {
    // Try to extract array from object values (handle keyed objects)
    const values = Object.values(data as Record<string, unknown>);
    products = values.filter(item => 
      item && typeof item === 'object' && 'sku' in item
    );
    devLog('✅ Products data is keyed object format:', { 
      originalKeys: Object.keys(data as object).length,
      extractedProducts: products.length 
    });
  } else {
    throw new Error(`Invalid products data type: ${typeof data}. Expected array, object with 'products' key, or keyed object.`);
  }
  
  if (!products || products.length === 0) {
    throw new Error('Products array is empty after normalization');
  }
  
  // Validate and normalize each product
  const validatedProducts: Product[] = [];
  
  for (let index = 0; index < products.length; index++) {
    const item = products[index];
    
    if (!item || typeof item !== 'object') {
      prodError(`Invalid product at index ${index}: not an object`, { item });
      continue; // Skip invalid items rather than failing completely
    }
    
    const product = item as Record<string, unknown>;
    
    // Validate required fields
    if (!product.sku || typeof product.sku !== 'string') {
      prodError(`Invalid product at index ${index}: missing or invalid SKU`, { product });
      continue;
    }
    
    // Handle both 'name' and 'productName' fields (normalize to productName)
    const productName = product.productName || product.name;
    if (!productName || typeof productName !== 'string') {
      prodError(`Invalid product at index ${index}: missing or invalid name/productName`, { 
        sku: product.sku,
        productName: product.productName,
        name: product.name
      });
      continue;
    }
    
    // Validate price
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    if (typeof price !== 'number' || isNaN(price) || price < 0) {
      prodError(`Invalid product at index ${index}: invalid price`, { 
        sku: product.sku,
        price: product.price
      });
      continue;
    }
    
    // Validate and normalize status
    const rawStatus = product.status as string;
    const validStatuses = ['active', 'draft', 'archived'] as const;
    const status = validStatuses.includes(rawStatus as any) ? rawStatus as 'active' | 'draft' | 'archived' : 'active';
    
    // Create normalized product object
    const normalizedProduct: Product = {
      id: product.id as string || crypto.randomUUID(),
      sku: product.sku,
      productName: productName,
      price: price,
      category: (product.category as string) || 'coffee',
      description: (product.description as string) || '',
      status: status,
      featured: Boolean(product.featured),
      inStock: product.inStock !== false, // Default to true unless explicitly false
      images: Array.isArray(product.images) ? product.images : [],
      createdAt: product.createdAt ? new Date(product.createdAt as string) : new Date(),
      updatedAt: product.updatedAt ? new Date(product.updatedAt as string) : new Date(),
      
      // Coffee-specific fields
      roastLevel: product.roastLevel as string,
      origin: product.origin as string | string[],
      format: product.format as string,
      weight: product.weight as string,
      tastingNotes: Array.isArray(product.tastingNotes) ? product.tastingNotes : [],
      
      // Optional fields that may or may not exist
      originalPrice: typeof product.originalPrice === 'number' ? product.originalPrice : undefined,
      shippingFirst: typeof product.shippingFirst === 'number' ? product.shippingFirst : undefined,
      shippingAdditional: typeof product.shippingAdditional === 'number' ? product.shippingAdditional : undefined,
      
      // NOTE: Removed roastify_sku since we cleaned it up in previous session
      // The system should now use the main SKU field for Roastify mapping
    };
    
    validatedProducts.push(normalizedProduct);
  }
  
  if (validatedProducts.length === 0) {
    throw new Error('No valid products found after validation');
  }
  
  devLog('✅ Product validation complete:', {
    input: products.length,
    valid: validatedProducts.length,
    skipped: products.length - validatedProducts.length
  });
  
  return validatedProducts;
}

/**
 * Quick validation helper for checkout - ensures we have products for SKU mapping
 */
export function validateProductsForCheckout(products: Product[], requiredSkus: string[]): void {
  const availableSkus = new Set(products.map(p => p.sku));
  const missingSkus = requiredSkus.filter(sku => !availableSkus.has(sku));
  
  if (missingSkus.length > 0) {
    throw new Error(`Products not found for SKUs: ${missingSkus.join(', ')}`);
  }
}
