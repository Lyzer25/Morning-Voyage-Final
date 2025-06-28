'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, AlertCircle, Database, Eye, Copy, Zap } from 'lucide-react'

interface TestResult {
  success: boolean
  message?: string
  error?: string
  details?: any
  troubleshooting?: string[]
  sampleData?: string[][]
  config?: any
  products?: any[]
  count?: number
  httpStatus?: number
  apiResponse?: any
  nextSteps?: string[]
  cache?: any
  timestamp?: string
}

export default function SheetsTestPanel() {
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTest, setActiveTest] = useState<string>('')

  const runConnectionTest = async () => {
    setIsLoading(true)
    setActiveTest('connection')

    try {
      const response = await fetch('/api/products/test')
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Failed to connect to API',
        troubleshooting: [
          "1. Check that you're connected to the internet",
          '2. Make sure the API route is deployed correctly',
          '3. Check browser console for more errors',
        ],
      })
    } finally {
      setIsLoading(false)
      setActiveTest('')
    }
  }

  const runProductSync = async () => {
    setIsLoading(true)
    setActiveTest('sync')

    try {
      const response = await fetch('/api/admin/sync', { method: 'POST' })
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Failed to sync products',
        troubleshooting: [
          '1. Make sure the connection test passes first',
          '2. Check your spreadsheet has product data',
          '3. Verify environment variables are set correctly',
        ],
      })
    } finally {
      setIsLoading(false)
      setActiveTest('')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#4B2E2E] flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Google Sheets Integration Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={runConnectionTest}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] hover:from-[#6E6658] hover:to-[#4B2E2E] text-white rounded-xl h-12"
            >
              {isLoading && activeTest === 'connection' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>

            <Button
              onClick={runProductSync}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#9E7C83] to-[#6E6658] hover:from-[#6E6658] hover:to-[#9E7C83] text-white rounded-xl h-12"
            >
              {isLoading && activeTest === 'sync' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing Products...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Sync Products
                </>
              )}
            </Button>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-xl border-2 ${
                testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center mb-3">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <span
                  className={`font-semibold ${testResult.success ? 'text-green-800' : 'text-red-800'}`}
                >
                  {testResult.success ? 'Success!' : 'Error'}
                </span>
                {testResult.httpStatus && (
                  <Badge variant="outline" className="ml-2">
                    HTTP {testResult.httpStatus}
                  </Badge>
                )}
                {testResult.timestamp && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {new Date(testResult.timestamp).toLocaleTimeString()}
                  </Badge>
                )}
              </div>

              {testResult.message && (
                <p className="text-sm text-gray-700 mb-3">{testResult.message}</p>
              )}

              {testResult.error && (
                <p className="text-sm text-red-700 mb-3 font-medium">{testResult.error}</p>
              )}

              {testResult.count !== undefined && (
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-blue-100 text-blue-800">
                    {testResult.count} products found
                  </Badge>
                </div>
              )}

              {/* Cache Status */}
              {testResult.cache && (
                <div className="bg-gray-100 rounded-lg p-3 mb-3">
                  <h4 className="font-semibold text-gray-800 mb-2">Cache Status</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Raw Products:</span>
                      <span className="font-mono">{testResult.cache.rawProductCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Grouped Products:</span>
                      <span className="font-mono">{testResult.cache.groupedProductCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Sync:</span>
                      <span className="font-mono text-xs">
                        {testResult.cache.lastSync
                          ? new Date(testResult.cache.lastSync).toLocaleString()
                          : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Configuration Details */}
              {testResult.config && (
                <div className="bg-gray-100 rounded-lg p-3 mb-3">
                  <h4 className="font-semibold text-gray-800 mb-2">Configuration</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Spreadsheet ID:</span>
                      <span className="font-mono">{testResult.config.spreadsheetId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>API Key:</span>
                      <span>{testResult.config.hasApiKey ? '✓ Configured' : '✗ Missing'}</span>
                    </div>
                    {testResult.config.testUrl && (
                      <div className="mt-2">
                        <span className="block mb-1">Test URL:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-white p-1 rounded flex-1 truncate">
                            {testResult.config.testUrl}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(testResult.config.testUrl)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Troubleshooting Steps */}
              {testResult.troubleshooting && testResult.troubleshooting.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                  <h4 className="font-semibold text-yellow-800 mb-2">Troubleshooting Steps:</h4>
                  <ol className="text-sm text-yellow-700 space-y-1">
                    {testResult.troubleshooting.map((step, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Next Steps */}
              {testResult.nextSteps && testResult.nextSteps.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
                  <ol className="text-sm text-blue-700 space-y-1">
                    {testResult.nextSteps.map((step, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Sample Data */}
              {testResult.sampleData && testResult.sampleData.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    View Sample Data ({testResult.sampleData.length} rows)
                  </summary>
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
                    {testResult.sampleData.slice(0, 5).map((row, i) => (
                      <div key={i} className="border-b border-gray-200 py-1">
                        {row.join(' | ')}
                      </div>
                    ))}
                    {testResult.sampleData.length > 5 && (
                      <div className="text-gray-500 pt-1">
                        ...and {testResult.sampleData.length - 5} more rows
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Quick Setup Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Quick Setup Checklist:</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Google Sheets API enabled in Google Cloud Console</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>API key created with Sheets API permissions</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Spreadsheet shared publicly or with API key</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Environment variables set in Vercel</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
