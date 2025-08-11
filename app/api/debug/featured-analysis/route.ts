import { getProducts } from '@/lib/csv-data'
import { list } from '@vercel/blob'
import Papa from 'papaparse'
import type { Product } from '@/lib/types'

export async function POST() {
  try {
    console.log('🔍 FEATURED DEBUG: Starting comprehensive featured analysis...')
    
    // Step 1: Get products from admin staging (what admin sees)
    const adminProducts = await getProducts()
    const featuredInAdmin = adminProducts.filter(p => p.featured === true)
    
    console.log('🔍 FEATURED DEBUG: Admin products analysis:', {
      total: adminProducts.length,
      featuredCount: featuredInAdmin.length,
      featuredSample: featuredInAdmin.slice(0, 3).map(p => ({
        sku: p.sku,
        name: p.productName,
        featured: p.featured,
        featuredType: typeof p.featured
      }))
    })
    
    // Step 2: Get products from blob storage (direct read)
    const blobs = await list({ prefix: 'products.csv' })
    let featuredInBlob: any[] = []
    let blobFeaturedValues: any[] = []
    let csvAnalysis = null
    
    if (blobs.blobs.length > 0) {
      console.log('🔍 FEATURED DEBUG: Reading CSV blob directly...')
      
      const response = await fetch(blobs.blobs[0].url, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (!response.ok) {
        throw new Error(`Blob fetch failed: ${response.status}`)
      }
      
      const csvContent = await response.text()
      const parseResult = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false
      })
      
      csvAnalysis = {
        totalLines: csvContent.split('\n').length,
        totalRows: parseResult.data.length,
        headers: parseResult.meta?.fields || [],
        firstDataRow: parseResult.data[0] || null,
        parseErrors: parseResult.errors?.length || 0
      }
      
      // Find featured column in CSV
      const headers = parseResult.meta?.fields || []
      const featuredColumnIndex = headers.findIndex(h => 
        h.toLowerCase().includes('featured') || h.toUpperCase() === 'FEATURED'
      )
      
      console.log('🔍 FEATURED DEBUG: CSV structure analysis:', {
        featuredColumnFound: featuredColumnIndex !== -1,
        featuredColumnIndex,
        featuredColumnName: headers[featuredColumnIndex] || 'NOT_FOUND',
        allHeaders: headers
      })
      
      if (featuredColumnIndex !== -1) {
        const featuredColumnName = headers[featuredColumnIndex]
        
        parseResult.data.forEach((row: any, index: number) => {
          const featuredValue = row[featuredColumnName]
          blobFeaturedValues.push({
            rowIndex: index,
            sku: row.sku || row.SKU,
            productName: row.productName || row.PRODUCTNAME,
            rawFeaturedValue: featuredValue,
            featuredValueType: typeof featuredValue
          })
          
          // Check if this row would be considered "featured"
          const isFeaturedInBlob = featuredValue === 'true' || 
                                   featuredValue === 'TRUE' || 
                                   featuredValue === '1' ||
                                   featuredValue === true
          
          if (isFeaturedInBlob) {
            featuredInBlob.push({
              sku: row.sku || row.SKU,
              name: row.productName || row.PRODUCTNAME,
              rawFeaturedValue: featuredValue,
              processedFeatured: isFeaturedInBlob
            })
          }
        })
      }
    }
    
    // Step 3: Analyze front page data source
    console.log('🔍 FEATURED DEBUG: Checking front page data source...')
    let frontPageAnalysis = null
    
    try {
      // Test the same API that the front page uses
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      
      const frontPageResponse = await fetch(`${baseUrl}/api/products?test-featured=true`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (frontPageResponse.ok) {
        const frontPageData = await frontPageResponse.json()
        const frontPageProducts = Array.isArray(frontPageData.products) ? frontPageData.products : frontPageData
        const featuredOnFrontPage = frontPageProducts.filter((p: any) => p.featured === true)
        
        frontPageAnalysis = {
          totalProducts: frontPageProducts.length,
          featuredCount: featuredOnFrontPage.length,
          featuredSample: featuredOnFrontPage.slice(0, 3).map((p: any) => ({
            sku: p.sku,
            name: p.productName,
            featured: p.featured,
            featuredType: typeof p.featured
          })),
          dataSourceWorking: true
        }
      }
    } catch (error) {
      frontPageAnalysis = {
        error: error instanceof Error ? error.message : String(error),
        dataSourceWorking: false
      }
    }
    
    // Step 4: Identify issues and inconsistencies
    const issues: string[] = []
    
    if (featuredInAdmin.length !== featuredInBlob.length) {
      issues.push(`Count mismatch: ${featuredInAdmin.length} featured in admin vs ${featuredInBlob.length} in blob storage`)
    }
    
    if (frontPageAnalysis && frontPageAnalysis.featuredCount !== featuredInAdmin.length) {
      issues.push(`Front page mismatch: ${frontPageAnalysis.featuredCount} on front page vs ${featuredInAdmin.length} in admin`)
    }
    
    // Check for boolean conversion issues
    const booleanConversionIssues = blobFeaturedValues.filter(item => {
      const value = item.rawFeaturedValue
      return value !== 'TRUE' && value !== 'FALSE' && typeof value !== 'boolean'
    })
    
    if (booleanConversionIssues.length > 0) {
      issues.push(`Boolean conversion issues: ${booleanConversionIssues.length} products have non-standard featured values`)
    }
    
    // Check for SKU mismatches
    const adminSkus = new Set(featuredInAdmin.map(p => p.sku))
    const blobSkus = new Set(featuredInBlob.map(p => p.sku))
    const skuMismatches = [...adminSkus].filter(sku => !blobSkus.has(sku))
    
    if (skuMismatches.length > 0) {
      issues.push(`SKU mismatches: ${skuMismatches.length} featured products in admin not found as featured in blob`)
    }
    
    console.log('🔍 FEATURED DEBUG: Analysis complete', {
      adminFeatured: featuredInAdmin.length,
      blobFeatured: featuredInBlob.length,
      issuesFound: issues.length,
      issues
    })
    
    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      analysis: {
        admin: {
          totalProducts: adminProducts.length,
          featuredCount: featuredInAdmin.length,
          featuredProducts: featuredInAdmin.map(p => ({
            sku: p.sku,
            name: p.productName,
            featured: p.featured,
            featuredType: typeof p.featured,
            category: p.category
          }))
        },
        blobStorage: {
          csvAnalysis,
          featuredCount: featuredInBlob.length,
          featuredProducts: featuredInBlob,
          allFeaturedValues: blobFeaturedValues,
          booleanConversionIssues: booleanConversionIssues
        },
        frontPage: frontPageAnalysis,
        consistency: {
          isConsistent: issues.length === 0,
          issues,
          adminVsBlob: featuredInAdmin.length === featuredInBlob.length,
          adminVsFrontPage: frontPageAnalysis ? featuredInAdmin.length === frontPageAnalysis.featuredCount : 'unknown'
        },
        recommendations: issues.length > 0 ? [
          'Check CSV boolean conversion in exportProductsToCSV()',
          'Verify featured field mapping in fromCsvRow()',
          'Test featured toggle -> deploy -> front page flow',
          'Clear ISR cache to ensure fresh data'
        ] : [
          'Featured items pipeline appears to be working correctly',
          'Consider adding ongoing monitoring for featured field consistency'
        ]
      }
    })
    
  } catch (error) {
    console.error('❌ FEATURED DEBUG: Analysis failed:', error)
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
