import type { Product } from '@/lib/types';

export interface VariantFamily {
  id: string;
  name: string; // Base product name without size/format specifics
  products: Product[];
  sharedProperties: {
    origin?: string;
    roastLevel?: string;
    category: string;
    description?: string;
    tastingNotes?: string[]; // Updated to match Product type
    images?: any[];
  };
}

// Detect if products are variants of each other based on shared properties
export function areVariants(product1: Product, product2: Product): boolean {
  // Must be same category
  if (product1.category !== product2.category) return false;
  
  // For coffee products, check shared properties
  if (product1.category === 'coffee') {
    // Check if they share the same base name (excluding size/format indicators)
    const baseName1 = extractBaseName(product1.productName);
    const baseName2 = extractBaseName(product2.productName);
    
    if (baseName1 !== baseName2) return false;
    
    // Check shared coffee properties - handle both string and array tastingNotes
    const notes1 = Array.isArray(product1.tastingNotes) 
      ? product1.tastingNotes.join(', ')
      : product1.tastingNotes || '';
    const notes2 = Array.isArray(product2.tastingNotes)
      ? product2.tastingNotes.join(', ')
      : product2.tastingNotes || '';
    
    return (
      product1.origin === product2.origin &&
      product1.roastLevel === product2.roastLevel &&
      notes1 === notes2
    );
  }
  
  // For subscription products, group by base service
  if (product1.category === 'subscription') {
    const baseName1 = extractBaseName(product1.productName);
    const baseName2 = extractBaseName(product2.productName);
    return baseName1 === baseName2;
  }
  
  return false;
}

// Extract base product name by removing size/format indicators
function extractBaseName(productName: string): string {
  return productName
    .toLowerCase()
    .replace(/\b(12oz|1lb|2lb|5lb|whole\s*bean|ground|instant|pods?)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper to compare arrays
function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

// Helper to normalize tastingNotes to array
function normalizeTastingNotes(tastingNotes?: string | string[]): string[] {
  if (!tastingNotes) return [];
  if (Array.isArray(tastingNotes)) return tastingNotes;
  return tastingNotes.split(',').map((note: string) => note.trim()).filter(Boolean);
}

// Group products into variant families
export function groupProductsIntoFamilies(products: Product[]): VariantFamily[] {
  const families: VariantFamily[] = [];
  const processedProducts = new Set<string>();
  
  products.forEach(product => {
    if (processedProducts.has(product.id)) return;
    
    // Find all variants of this product
    const variants = products.filter(p => 
      !processedProducts.has(p.id) && areVariants(product, p)
    );
    
    if (variants.length > 1) {
      // Create variant family
      const family: VariantFamily = {
        id: crypto.randomUUID(),
        name: extractBaseName(product.productName),
        products: variants.sort((a, b) => {
          // Sort by size/weight first, then format
          const sizeOrder = ['12oz', '1lb', '2lb', '5lb'];
          const formatOrder = ['whole-bean', 'ground', 'instant', 'pods'];
          
          const aSize = sizeOrder.indexOf(a.weight || '');
          const bSize = sizeOrder.indexOf(b.weight || '');
          if (aSize !== -1 && bSize !== -1 && aSize !== bSize) {
            return aSize - bSize;
          }
          
          const aFormat = formatOrder.indexOf(a.format || '');
          const bFormat = formatOrder.indexOf(b.format || '');
          if (aFormat !== -1 && bFormat !== -1) {
            return aFormat - bFormat;
          }
          
          return a.sku.localeCompare(b.sku);
        }),
        sharedProperties: extractSharedProperties(variants)
      };
      
      families.push(family);
      variants.forEach(v => processedProducts.add(v.id));
    } else {
      // Single product (not a variant family)
      const family: VariantFamily = {
        id: crypto.randomUUID(),
        name: product.productName,
        products: [product],
        sharedProperties: {
          category: product.category,
          description: product.description,
    origin: Array.isArray(product.origin) ? product.origin.join(', ') : product.origin,
          roastLevel: product.roastLevel,
          tastingNotes: normalizeTastingNotes(product.tastingNotes),
          images: product.images
        }
      };
      
      families.push(family);
      processedProducts.add(product.id);
    }
  });
  
  return families.sort((a, b) => a.name.localeCompare(b.name));
}

// Extract properties shared across all variants in a family
function extractSharedProperties(variants: Product[]): VariantFamily['sharedProperties'] {
  if (variants.length === 0) return { category: '' };
  
  const first = variants[0];
  const shared: VariantFamily['sharedProperties'] = {
    category: first.category,
    description: first.description,
  };
  
  // Only include properties that are truly shared across all variants
  if (variants.every(v => v.origin === first.origin)) {
    shared.origin = Array.isArray(first.origin) ? first.origin.join(', ') : first.origin;
  }
  
  if (variants.every(v => v.roastLevel === first.roastLevel)) {
    shared.roastLevel = first.roastLevel;
  }
  
  // Compare tastingNotes as arrays
  const firstNotes = normalizeTastingNotes(first.tastingNotes);
  if (variants.every(v => arraysEqual(normalizeTastingNotes(v.tastingNotes), firstNotes))) {
    shared.tastingNotes = firstNotes;
  }
  
  // Use images from the first product as shared (can be overridden in bulk edit)
  shared.images = first.images;
  
  return shared;
}

// Update shared properties across all variants in a family
export function updateVariantFamilySharedProperties(
  family: VariantFamily, 
  updates: Partial<VariantFamily['sharedProperties']>
): Product[] {
  return family.products.map(product => ({
    ...product,
    // Update shared fields
    ...(updates.description !== undefined && { description: updates.description }),
    ...(updates.origin !== undefined && { origin: updates.origin }),
    ...(updates.roastLevel !== undefined && { roastLevel: updates.roastLevel }),
    ...(updates.tastingNotes !== undefined && { tastingNotes: updates.tastingNotes }),
    ...(updates.images !== undefined && { images: updates.images }),
    updatedAt: new Date()
  }));
}

// Generate variant suggestions based on existing family
export function generateVariantSuggestions(family: VariantFamily): {
  sizes: string[];
  formats: string[];
  missingCombinations: { size: string; format: string; suggestedSku: string }[];
} {
  const sizes = ['12oz', '1lb', '2lb'];
  const formats = ['whole-bean', 'ground'];
  
  const existingCombinations = new Set(
    family.products.map(p => `${p.weight}-${p.format}`)
  );
  
  const missingCombinations: { size: string; format: string; suggestedSku: string }[] = [];
  
  sizes.forEach(size => {
    formats.forEach(format => {
      const combo = `${size}-${format}`;
      if (!existingCombinations.has(combo)) {
        // Generate suggested SKU
        const baseSku = family.products[0]?.sku.split('-').slice(0, 2).join('-') || 'COFFEE-PRODUCT';
        const formatAbbr = format === 'whole-bean' ? 'WHOLE' : format.toUpperCase();
        const sizeAbbr = size.replace('oz', 'OZ').replace('lb', 'LB');
        
        missingCombinations.push({
          size,
          format,
          suggestedSku: `${baseSku}-${sizeAbbr}-${formatAbbr}`
        });
      }
    });
  });
  
  return {
    sizes,
    formats,
    missingCombinations
  };
}
