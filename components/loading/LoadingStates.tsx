'use client'

import { Coffee, Package, ShoppingCart, Wifi, WifiOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'coffee' | 'product' | 'cart' | 'generic'
  message?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'generic', 
  message 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  const containerSizes = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }

  const getIcon = () => {
    switch (variant) {
      case 'coffee': return <Coffee className={sizeClasses[size]} />
      case 'product': return <Package className={sizeClasses[size]} />
      case 'cart': return <ShoppingCart className={sizeClasses[size]} />
      default: return <div className={`${sizeClasses[size]} rounded-full border-2 border-current border-t-transparent animate-spin`} />
    }
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className={`${containerSizes[size]} bg-gradient-to-br from-[#4B2E2E] to-[#6E6658] rounded-2xl flex items-center justify-center text-white ${variant !== 'generic' ? 'animate-pulse' : ''}`}>
        {getIcon()}
      </div>
      {message && (
        <p className="text-sm font-medium text-[#6E6658] text-center max-w-xs">
          {message}
        </p>
      )}
    </div>
  )
}

export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7] flex items-center justify-center">
      <LoadingSpinner size="lg" variant="coffee" message={message} />
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden bg-white/70 backdrop-blur-xl border-0">
          <CardContent className="p-0">
            {/* Image skeleton */}
            <Skeleton className="aspect-square bg-gradient-to-br from-[#F6F1EB] to-[#E7CFC7]" />
            
            {/* Content skeleton */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16 bg-[#F6F1EB]" />
                <Skeleton className="h-4 w-12 bg-[#F6F1EB]" />
              </div>
              
              <Skeleton className="h-6 w-3/4 bg-[#E7CFC7]" />
              
              <div className="space-y-2">
                <Skeleton className="h-3 w-full bg-[#F6F1EB]" />
                <Skeleton className="h-3 w-2/3 bg-[#F6F1EB]" />
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-6 w-20 bg-[#E7CFC7]" />
                <Skeleton className="h-8 w-24 bg-[#D5BFA3] rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo skeleton */}
          <div className="flex items-center space-x-3">
            <Skeleton className="w-16 h-16 rounded-2xl bg-[#E7CFC7]" />
            <div className="hidden sm:block space-y-2">
              <Skeleton className="h-6 w-32 bg-[#F6F1EB]" />
              <Skeleton className="h-3 w-24 bg-[#F6F1EB]" />
            </div>
          </div>

          {/* Navigation skeleton - desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-16 bg-[#F6F1EB] rounded-xl" />
            ))}
          </div>

          {/* Actions skeleton */}
          <div className="flex items-center space-x-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-10 h-10 bg-[#E7CFC7] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}

interface ConnectionStatusProps {
  isOnline: boolean
  className?: string
}

export function ConnectionStatus({ isOnline, className = '' }: ConnectionStatusProps) {
  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4 text-green-600" />
          <span className="text-green-700 font-medium">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-600" />
          <span className="text-red-700 font-medium">Offline</span>
        </>
      )}
    </div>
  )
}

export function SlowConnectionWarning() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-3">
        <WifiOff className="w-5 h-5 text-yellow-600 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-yellow-800 mb-1">
            Slow Connection Detected
          </h3>
          <p className="text-yellow-700 text-sm">
            We&apos;ve optimized the page for your connection speed. Some images may load progressively.
          </p>
        </div>
      </div>
    </div>
  )
}

interface ProgressiveImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
}

export function ProgressiveImage({ 
  src, 
  alt, 
  className = '', 
  priority = false 
}: ProgressiveImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      <Skeleton className="absolute inset-0 bg-gradient-to-br from-[#F6F1EB] to-[#E7CFC7]" />
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${className}`}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={(e) => {
          // Hide skeleton when image loads
          const skeleton = e.currentTarget.previousElementSibling as HTMLElement
          if (skeleton) skeleton.style.display = 'none'
        }}
      />
    </div>
  )
}
