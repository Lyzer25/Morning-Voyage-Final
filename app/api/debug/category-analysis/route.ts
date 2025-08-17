import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/csv-data';
import { normalizeCategory } from '@/lib/csv-helpers';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [CATEGORY DEBUG] Starting category analysis...');
    
    // Fetch all products
    const products = await getProducts({ forceRefresh: true });
    
    console.log('🔍 [CATEGORY DEBUG] Products loaded:', products.length);
    
    // Analyze raw vs normalized categories
    const categoryAnalysis = {
      totalProducts: products.length,
      rawCategories: new Map<string, number>(),
      normalizedCategories: new Map<string, number>(),
      categoryMappings: new Map<string, string>(),
      mushroomProducts: [] as any[]
    };
    
    products.forEach(product => {
      const rawCategory = product.category || 'undefined';
      const normalizedCategory = normalizeCategory(rawCategory);
      
      // Track raw categories
      const rawCount = categoryAnalysis.rawCategories.get(rawCategory) || 0;
      categoryAnalysis.rawCategories.set(rawCategory, rawCount + 1);
      
      // Track normalized categories
      const normalizedCount = categoryAnalysis.normalizedCategories.get(normalizedCategory) || 0;
      categoryAnalysis.normalizedCategories.set(normalizedCategory, normalizedCount + 1);
      
      // Track mappings
      categoryAnalysis.categoryMappings.set(rawCategory, normalizedCategory);
      
      // Find mushroom-related products
      if (rawCategory.toLowerCase().includes('mushroom') || 
          normalizedCategory === 'mushroom-coffee') {
        categoryAnalysis.mushroomProducts.push({
          sku: product.sku,
          productName: product.productName,
          rawCategory,
          normalizedCategory,
          price: product.price
        });
      }
    });
    
    // Test normalization function directly
    const testCases = [
      'Mushroom Coffee',
      'mushroom coffee', 
      'MUSHROOM COFFEE',
      'Mushroom',
      'mushroom',
      'Functional Coffee',
      'functional coffee',
      'Coffee',
      'coffee',
      'Regular Coffee',
      'Single Origin'
    ];
    
    const normalizationTests = testCases.map(testCase => ({
      input: testCase,
      output: normalizeCategory(testCase)
    }));
    
    console.log('✅ [CATEGORY DEBUG] Analysis complete');
    
    return NextResponse.json({
      success: true,
      analysis: {
        totalProducts: categoryAnalysis.totalProducts,
        rawCategoriesFound: Array.from(categoryAnalysis.rawCategories.entries())
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count),
        normalizedCategoriesFound: Array.from(categoryAnalysis.normalizedCategories.entries())
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count),
        categoryMappings: Array.from(categoryAnalysis.categoryMappings.entries())
          .map(([raw, normalized]) => ({ raw, normalized }))
          .sort((a, b) => a.raw.localeCompare(b.raw)),
        mushroomProducts: categoryAnalysis.mushroomProducts,
        normalizationTests
      },
      message: `Found ${products.length} products across ${categoryAnalysis.rawCategories.size} raw categories, normalized to ${categoryAnalysis.normalizedCategories.size} categories. ${categoryAnalysis.mushroomProducts.length} mushroom-related products found.`
    });
    
  } catch (error) {
    console.error('❌ [CATEGORY DEBUG] Analysis failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Category analysis failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
