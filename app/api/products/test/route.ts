import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test Google Sheets API connection with detailed error reporting
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY

    console.log('Testing Google Sheets connection...')
    console.log(
      'Spreadsheet ID:',
      spreadsheetId ? `${spreadsheetId.substring(0, 10)}...` : 'MISSING'
    )
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING')

    if (!spreadsheetId || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing environment variables',
          details: {
            spreadsheetId: !spreadsheetId ? 'GOOGLE_SHEETS_ID is missing' : '✓ Present',
            apiKey: !apiKey ? 'GOOGLE_SHEETS_API_KEY is missing' : '✓ Present',
          },
          troubleshooting: [
            '1. Check your Vercel environment variables',
            '2. Make sure GOOGLE_SHEETS_ID contains your full spreadsheet ID',
            '3. Make sure GOOGLE_SHEETS_API_KEY contains your Google API key',
            '4. Redeploy after adding environment variables',
          ],
        },
        { status: 400 }
      )
    }

    // Test with a simple range first
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:E5?key=${apiKey}`

    console.log('Making request to:', url.replace(apiKey, '***API_KEY***'))

    const response = await fetch(url)
    const data = await response.json()

    console.log('Response status:', response.status)
    console.log('Response data:', data)

    if (!response.ok) {
      // Detailed error handling
      let errorMessage = 'Unknown Google Sheets API error'
      let troubleshooting = []

      if (response.status === 400) {
        errorMessage = 'Bad Request - Invalid spreadsheet ID or range'
        troubleshooting = [
          '1. Check that your spreadsheet ID is correct',
          '2. Make sure the spreadsheet exists and is accessible',
          '3. Try opening this URL in your browser:',
          `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
        ]
      } else if (response.status === 403) {
        errorMessage = 'Forbidden - API key invalid or insufficient permissions'
        troubleshooting = [
          '1. Check that your Google API key is valid',
          '2. Make sure the Google Sheets API is enabled in your Google Cloud project',
          '3. Ensure the spreadsheet is publicly readable OR your API key has proper permissions',
          '4. Try making the spreadsheet public (Anyone with the link can view)',
        ]
      } else if (response.status === 404) {
        errorMessage = 'Not Found - Spreadsheet or sheet not found'
        troubleshooting = [
          '1. Verify your spreadsheet ID is correct',
          "2. Make sure the sheet name 'Sheet1' exists (or change the range)",
          "3. Check that the spreadsheet hasn't been deleted",
        ]
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          httpStatus: response.status,
          apiResponse: data,
          troubleshooting,
          config: {
            spreadsheetId: spreadsheetId.substring(0, 15) + '...',
            hasApiKey: !!apiKey,
            testUrl: url.replace(apiKey, '***API_KEY***'),
          },
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Google Sheets connection successful! 🎉',
      sampleData: data.values || [],
      rowCount: data.values?.length || 0,
      config: {
        spreadsheetId: spreadsheetId.substring(0, 15) + '...',
        hasApiKey: !!apiKey,
        range: 'Sheet1!A1:E5',
      },
      nextSteps: [
        '1. Add your product headers to row 1',
        '2. Add product data starting from row 2',
        "3. Try the 'Sync Products' button",
      ],
    })
  } catch (error) {
    console.error('Connection test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        troubleshooting: [
          '1. Check your internet connection',
          '2. Verify environment variables are set correctly',
          '3. Check Vercel function logs for more details',
        ],
      },
      { status: 500 }
    )
  }
}
