import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { put } from '@vercel/blob';
import Papa from 'papaparse';
import { fromCsvRow } from '@/lib/csv-data';
import { transformHeader, exportProductsToCSV } from '@/lib/csv-helpers';
import type { Product } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check admin access
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log('📤 CSV UPLOAD: Starting server-side CSV upload for admin:', session.userId);

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type and size
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a CSV file.' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    console.log('📤 CSV UPLOAD: Processing file:', {
      fileName: file.name,
      fileSize: file.size,
      type: file.type
    });

    // Read file content
    const fileContent = await file.text();
    
    if (!fileContent.trim()) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      );
    }

    console.log('📤 CSV UPLOAD: File content received:', {
      contentLength: fileContent.length,
      firstLine: fileContent.split('\n')[0] || 'EMPTY'
    });

    // Parse CSV with proper header transformation
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep as strings for proper processing
      transformHeader: transformHeader,
    });

    console.log('📤 CSV UPLOAD: CSV parsed:', {
      dataRows: parseResult.data?.length || 0,
      errors: parseResult.errors?.length || 0,
      headers: parseResult.meta?.fields || []
    });

    if (parseResult.errors.length > 0) {
      console.warn('⚠️ CSV parsing errors:', parseResult.errors);
      // Don't abort on parsing warnings, just show them
      parseResult.errors.forEach(error => {
        console.warn(`CSV Warning: ${error.message} at row ${error.row}`);
      });
    }

    // Validate required fields
    const requiredFields = ['SKU', 'PRODUCTNAME', 'CATEGORY', 'PRICE'];
    const missingRequired = requiredFields.filter(field => !parseResult.meta?.fields?.includes(field));
    
    if (missingRequired.length > 0) {
      return NextResponse.json(
        { error: `CSV must contain required columns: ${missingRequired.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('✅ CSV has all required fields:', requiredFields);

    // Process each row using the robust fromCsvRow function
    const processedProducts: Product[] = [];
    const processingErrors: string[] = [];
    
    for (let i = 0; i < parseResult.data.length; i++) {
      try {
        const product = fromCsvRow(parseResult.data[i] as Record<string, any>);
        processedProducts.push(product);
      } catch (rowError) {
        const errorMsg = `Row ${i + 1}: ${rowError instanceof Error ? rowError.message : 'Processing failed'}`;
        console.error(`❌ ${errorMsg}`, rowError);
        processingErrors.push(errorMsg);
      }
    }

    console.log('📤 CSV UPLOAD: Processing complete:', {
      totalRows: parseResult.data.length,
      successfullyProcessed: processedProducts.length,
      errors: processingErrors.length,
      categories: [...new Set(processedProducts.map(p => p.category).filter(Boolean))]
    });

    if (processedProducts.length === 0) {
      return NextResponse.json(
        { 
          error: 'No valid products could be processed from CSV',
          processingErrors: processingErrors.slice(0, 10) // Limit error list
        },
        { status: 400 }
      );
    }

    // Save both timestamped CSV and update products.json
    const timestamp = Date.now();
    
    // Save timestamped CSV file
    const csvResult = await put(
      `products_${timestamp}.csv`,
      fileContent,
      {
        access: 'public',
        contentType: 'text/csv',
        allowOverwrite: true
      }
    );

    // Generate and save products.json for API consumption
    const productsJson = JSON.stringify(processedProducts, null, 2);
    const jsonResult = await put(
      'products.json',
      productsJson,
      {
        access: 'public',
        contentType: 'application/json',
        allowOverwrite: true
      }
    );

    // Also update the main CSV file used by the system
    const standardCsv = exportProductsToCSV(processedProducts);
    const mainCsvResult = await put(
      'products.csv',
      standardCsv,
      {
        access: 'public',
        contentType: 'text/csv',
        allowOverwrite: true
      }
    );

    console.log('✅ CSV UPLOAD: Files saved to blob storage:', {
      csvUrl: csvResult.url,
      jsonUrl: jsonResult.url,
      mainCsvUrl: mainCsvResult.url,
      productCount: processedProducts.length
    });

    return NextResponse.json({
      success: true,
      productCount: processedProducts.length,
      csvUrl: csvResult.url,
      jsonUrl: jsonResult.url,
      mainCsvUrl: mainCsvResult.url,
      message: `Successfully processed ${processedProducts.length} products`,
      processingErrors: processingErrors.length > 0 ? processingErrors.slice(0, 5) : undefined,
      categories: [...new Set(processedProducts.map(p => p.category))]
    });

  } catch (error) {
    console.error('❌ CSV upload error:', error);
    return NextResponse.json(
      { error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
