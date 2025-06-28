'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface SyncStatus {
  lastSync: string
  productCount: number
  status: 'synced' | 'syncing' | 'error'
  errors?: string[]
}

export default function ProductSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: new Date().toISOString(),
    productCount: 0,
    status: 'synced',
  })
  const [isManualSync, setIsManualSync] = useState(false)

  const handleManualSync = async () => {
    setIsManualSync(true)
    setSyncStatus(prev => ({ ...prev, status: 'syncing' }))

    try {
      const response = await fetch('/api/products?refresh=true')
      const data = await response.json()

      setSyncStatus({
        lastSync: new Date().toISOString(),
        productCount: data.count,
        status: 'synced',
      })
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        status: 'error',
        errors: ['Failed to sync with Google Sheets'],
      }))
    } finally {
      setIsManualSync(false)
    }
  }

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'synced':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'syncing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusBadge = () => {
    switch (syncStatus.status) {
      case 'synced':
        return <Badge className="bg-green-100 text-green-800">Synced</Badge>
      case 'syncing':
        return <Badge className="bg-blue-100 text-blue-800">Syncing...</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
    }
  }

  return (
    <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-[#4B2E2E] flex items-center justify-between">
          <span className="flex items-center">
            {getStatusIcon()}
            <span className="ml-2">Product Sync Status</span>
          </span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[#6E6658] font-medium">Products:</span>
            <div className="text-[#4B2E2E] font-bold">{syncStatus.productCount}</div>
          </div>
          <div>
            <span className="text-[#6E6658] font-medium">Last Sync:</span>
            <div className="text-[#4B2E2E] font-bold flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {new Date(syncStatus.lastSync).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {syncStatus.errors && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-red-800 font-medium text-sm mb-1">Sync Errors:</div>
            {syncStatus.errors.map((error, index) => (
              <div key={index} className="text-red-600 text-xs">
                {error}
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={handleManualSync}
          disabled={isManualSync || syncStatus.status === 'syncing'}
          className="w-full bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] hover:from-[#6E6658] hover:to-[#4B2E2E] text-white rounded-xl"
        >
          {isManualSync ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Manual Sync
            </>
          )}
        </Button>

        <div className="text-xs text-[#6E6658] text-center">
          Products automatically sync every 5 minutes
        </div>
      </CardContent>
    </Card>
  )
}
