'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, AlertCircle, Clock, Zap, Pause, Play } from 'lucide-react'

interface SyncStatus {
  lastSync: string
  rawProductCount: number
  groupedProductCount: number
  isStale: boolean
  isSyncing: boolean
  nextSyncIn: number
}

export default function AutoSyncManager() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true)
  const [isManualSync, setIsManualSync] = useState(false)
  const [countdown, setCountdown] = useState(300) // 5 minutes
  const [lastSyncResult, setLastSyncResult] = useState<string>('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch sync status
  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/admin/sync')
      const data = await response.json()
      if (data.success) {
        setSyncStatus(data.cache)
        setCountdown(Math.floor(data.cache.nextSyncIn / 1000))
        console.log('📊 Sync status:', data.cache)
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error)
    }
  }

  // Perform sync
  const performSync = async () => {
    try {
      console.log('🔄 Starting sync...')
      const response = await fetch('/api/admin/sync', { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        setSyncStatus(data.cache)
        setCountdown(300) // Reset to 5 minutes
        setLastSyncResult(`✅ Synced ${data.count} products`)
        console.log('✅ Auto-sync completed:', data.count, 'products')
      } else {
        setLastSyncResult(`❌ Sync failed: ${data.error}`)
        console.error('❌ Sync failed:', data.error)
      }
    } catch (error) {
      setLastSyncResult(`❌ Sync error: ${error}`)
      console.error('Auto-sync failed:', error)
    }
  }

  // Manual sync
  const handleManualSync = async () => {
    setIsManualSync(true)
    setLastSyncResult('🔄 Syncing...')
    await performSync()
    setIsManualSync(false)
  }

  // Auto-sync every 5 minutes
  useEffect(() => {
    if (!autoSyncEnabled) return

    // Initial fetch
    fetchSyncStatus()

    // Set up auto-sync interval
    intervalRef.current = setInterval(
      async () => {
        console.log('🔄 Auto-sync triggered...')
        await performSync()
      },
      5 * 60 * 1000
    ) // 5 minutes

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoSyncEnabled])

  // Countdown timer
  useEffect(() => {
    if (!autoSyncEnabled || countdown <= 0) return

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 300 // Reset to 5 minutes
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [countdown, autoSyncEnabled])

  // Format countdown
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusIcon = () => {
    if (syncStatus?.isSyncing || isManualSync) {
      return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
    }
    if (syncStatus?.isStale) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />
  }

  const getStatusBadge = () => {
    if (syncStatus?.isSyncing || isManualSync) {
      return <Badge className="bg-blue-100 text-blue-800">Syncing...</Badge>
    }
    if (syncStatus?.isStale) {
      return <Badge className="bg-yellow-100 text-yellow-800">Stale</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Fresh</Badge>
  }

  return (
    <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-[#4B2E2E] flex items-center justify-between">
          <span className="flex items-center">
            {getStatusIcon()}
            <span className="ml-2">Auto-Sync Manager</span>
          </span>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                autoSyncEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {autoSyncEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[#6E6658] font-medium">Raw Products:</span>
            <div className="text-[#4B2E2E] font-bold">{syncStatus?.rawProductCount || 0}</div>
          </div>
          <div>
            <span className="text-[#6E6658] font-medium">Grouped Products:</span>
            <div className="text-[#4B2E2E] font-bold">{syncStatus?.groupedProductCount || 0}</div>
          </div>
          <div>
            <span className="text-[#6E6658] font-medium">Last Sync:</span>
            <div className="text-[#4B2E2E] font-bold flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {syncStatus?.lastSync ? new Date(syncStatus.lastSync).toLocaleTimeString() : 'Never'}
            </div>
          </div>
          <div>
            <span className="text-[#6E6658] font-medium">Status:</span>
            <div className="text-[#4B2E2E] font-bold">
              {syncStatus?.isSyncing || isManualSync ? 'Syncing' : 'Ready'}
            </div>
          </div>
        </div>

        {/* Last Sync Result */}
        {lastSyncResult && (
          <div className="bg-gradient-to-r from-[#F6F1EB] to-[#E7CFC7] rounded-lg p-3">
            <div className="text-sm text-[#4B2E2E] font-medium">{lastSyncResult}</div>
          </div>
        )}

        {/* Auto-sync Status */}
        <div className="bg-gradient-to-r from-[#F6F1EB] to-[#E7CFC7] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#4B2E2E] font-semibold">Auto-Sync Status</span>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#9E7C83]" />
              <span className="text-sm text-[#6E6658]">
                {autoSyncEnabled ? 'Active' : 'Paused'}
              </span>
            </div>
          </div>
          {autoSyncEnabled && (
            <div className="text-sm text-[#6E6658]">
              Next sync in:{' '}
              <span className="font-mono font-bold">{formatCountdown(countdown)}</span>
            </div>
          )}
        </div>

        {/* Manual Controls */}
        <div className="flex gap-2">
          <Button
            onClick={handleManualSync}
            disabled={isManualSync || syncStatus?.isSyncing}
            className="flex-1 bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] hover:from-[#6E6658] hover:to-[#4B2E2E] text-white rounded-xl"
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
          <Button
            onClick={fetchSyncStatus}
            variant="outline"
            className="border-2 border-[#4B2E2E] text-[#4B2E2E] hover:bg-[#4B2E2E] hover:text-white rounded-xl"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-[#6E6658] space-y-1">
          <div className="flex items-center justify-between">
            <span>• Products served from cache (fast!)</span>
            <span>• No API calls for end users</span>
          </div>
          <div className="flex items-center justify-between">
            <span>• Auto-syncs every 5 minutes</span>
            <span>• Admin portal only</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
