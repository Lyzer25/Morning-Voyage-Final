#!/usr/bin/env node

// Google Sheets Preflight Validation Script
// Validates environment variables and sheet accessibility before sync

import { statSync } from 'fs'
import { join } from 'path'

interface ValidationResult {
  success: boolean
  errors: string[]
  warnings: string[]
  sheetInfo?: {
    headers: string[]
    dataRows: number
    accessible: boolean
  }
}

export async function validateSheetAccess(): Promise<ValidationResult> {
  const result: ValidationResult = {
    success: false,
    errors: [],
    warnings: []
  }

  console.log('🔍 Starting Google Sheets preflight validation...\n')

  // Step 1: Check environment variables
  console.log('📋 Checking environment variables...')
  
  if (!process.env.GOOGLE_SHEETS_ID) {
    result.errors.push('GOOGLE_SHEETS_ID not found in environment')
    console.error('❌ GOOGLE_SHEETS_ID missing')
  } else {
    console.log('✅ GOOGLE_SHEETS_ID found')
  }
  
  if (!process.env.GOOGLE_SHEETS_API_KEY) {
    result.errors.push('GOOGLE_SHEETS_API_KEY not found in environment')
    console.error('❌ GOOGLE_SHEETS_API_KEY missing')
  } else {
    console.log('✅ GOOGLE_SHEETS_API_KEY found')
  }

  // Step 2: Check disk space
  console.log('\n💾 Checking disk space...')
  try {
    const projectRoot = process.cwd()
    const stats = statSync(projectRoot)
    console.log('✅ Project directory accessible')
    
    // Try to create a test file to check write permissions
    const testPath = join(projectRoot, '.write-test')
    try {
      require('fs').writeFileSync(testPath, 'test', 'utf8')
      require('fs').unlinkSync(testPath)
      console.log('✅ Write permissions confirmed')
    } catch (writeError: any) {
      if (writeError.code === 'ENOSPC') {
        result.errors.push('Disk full (ENOSPC) - cannot write cache file')
        console.error('❌ DISK FULL - Free up space before syncing')
      } else {
        result.warnings.push('Write permission test failed')
        console.warn('⚠️ Write permission test failed:', writeError.message)
      }
    }
  } catch (error) {
    result.warnings.push('Could not check disk space')
    console.warn('⚠️ Could not check disk space')
  }

  // If environment variables are missing, can't proceed with sheet test
  if (result.errors.length > 0) {
    console.log('\n❌ Environment validation failed - cannot test sheet access')
    return result
  }

  // Step 3: Test Google Sheets API access
  console.log('\n🔗 Testing Google Sheets API access...')
  
  try {
    // Test with minimal range first
    const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/Sheet1!A1:Z10?key=${process.env.GOOGLE_SHEETS_API_KEY}`
    
    console.log('📡 Making API request...')
    const response = await fetch(testUrl)
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      if (response.status === 403) {
        errorMessage += ' - Check API key permissions'
      } else if (response.status === 404) {
        errorMessage += ' - Check spreadsheet ID and sharing settings'
      } else if (response.status === 400) {
        errorMessage += ' - Check sheet name (must be "Sheet1")'
      }
      
      result.errors.push(`Sheet API access failed: ${errorMessage}`)
      console.error(`❌ ${errorMessage}`)
      return result
    }
    
    const data = await response.json()
    
    if (!data.values || data.values.length === 0) {
      result.errors.push('Sheet is empty or has no accessible data')
      console.error('❌ Sheet appears to be empty')
      return result
    }
    
    // Analyze sheet structure
    const [headers, ...rows] = data.values
    const dataRows = rows.filter((row: any[]) => row && row.length > 0).length
    
    result.sheetInfo = {
      headers: headers || [],
      dataRows: dataRows,
      accessible: true
    }
    
    console.log(`✅ Sheet accessible with ${headers?.length || 0} columns`)
    console.log(`✅ Found ${dataRows} data rows`)
    
    // Step 4: Validate required headers
    console.log('\n📊 Validating sheet structure...')
    
    const requiredHeaders = ['sku', 'productname', 'category', 'price']
    const normalizedHeaders = headers?.map((h: string) => h.toLowerCase().replace(/\s+/g, '')) || []
    
    const missingHeaders = requiredHeaders.filter(required => 
      !normalizedHeaders.includes(required)
    )
    
    if (missingHeaders.length > 0) {
      result.errors.push(`Missing required headers: ${missingHeaders.join(', ')}`)
      console.error(`❌ Missing headers: ${missingHeaders.join(', ')}`)
      console.log(`📋 Found headers: ${headers?.join(', ') || 'none'}`)
    } else {
      console.log('✅ All required headers present')
    }
    
    if (dataRows === 0) {
      result.errors.push('No product data rows found below headers')
      console.error('❌ No data rows found')
    } else {
      console.log(`✅ ${dataRows} product rows ready for processing`)
    }
    
  } catch (error) {
    result.errors.push(`Sheet access test failed: ${error instanceof Error ? error.message : String(error)}`)
    console.error('❌ Sheet access test failed:', error)
  }

  // Final validation
  result.success = result.errors.length === 0
  
  console.log('\n' + '='.repeat(50))
  if (result.success) {
    console.log('🎉 All validation checks passed!')
    console.log('✅ Ready to sync products from Google Sheets')
  } else {
    console.log('❌ Validation failed - please fix the following issues:')
    result.errors.forEach(error => console.log(`   • ${error}`))
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️ Warnings:')
      result.warnings.forEach(warning => console.log(`   • ${warning}`))
    }
  }
  console.log('='.repeat(50))
  
  return result
}

// Run validation if called directly
if (require.main === module) {
  validateSheetAccess()
    .then((result) => {
      if (result.success) {
        console.log('\n✅ Google Sheets validation successful!')
        process.exit(0)
      } else {
        console.log('\n❌ Google Sheets validation failed!')
        console.log('\n🔧 Quick fix guide:')
        console.log('   1. Copy .env.example to .env.local')
        console.log('   2. Add your GOOGLE_SHEETS_ID from the spreadsheet URL')
        console.log('   3. Add your GOOGLE_SHEETS_API_KEY from Google Cloud Console')
        console.log('   4. Ensure the sheet has a "Sheet1" tab with product data')
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error('\n💥 Validation script crashed:', error.message)
      process.exit(1)
    })
}
