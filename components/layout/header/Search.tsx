'use client'

import { useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchProps {
  className?: string
  variant?: 'desktop' | 'mobile'
}

export function Search({ className = '', variant = 'desktop' }: SearchProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  if (variant === 'mobile') {
    return (
      <div className={`relative ${className}`}>
        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6E6658]" />
        <Input
          placeholder="Search coffee, fashion..."
          className="pl-12 h-12 bg-white/80 backdrop-blur-sm border-0 rounded-xl shadow-lg text-[#4B2E2E] placeholder:text-[#6E6658]"
        />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className={`w-10 h-10 rounded-xl transition-all duration-300 ${
          isSearchOpen
            ? 'bg-[#4B2E2E] text-white shadow-lg'
            : 'text-[#4B2E2E] hover:bg-white/60 backdrop-blur-sm'
        }`}
      >
        <SearchIcon className="h-5 w-5" />
      </Button>

      {/* Search Dropdown */}
      {isSearchOpen && (
        <>
          <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 animate-in slide-in-from-top-2 duration-300 z-50">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6E6658]" />
              <Input
                placeholder="Search coffee, fashion..."
                className="pl-10 h-12 bg-white/80 border-0 rounded-xl shadow-sm text-[#4B2E2E] placeholder:text-[#6E6658]"
                autoFocus
              />
            </div>
            <div className="mt-3 text-xs text-[#6E6658] font-medium">
              Popular: Morning Blend, Dark Roast, Hoodies
            </div>
          </div>

          {/* Overlay to close search */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsSearchOpen(false)}
          />
        </>
      )}
    </div>
  )
}
