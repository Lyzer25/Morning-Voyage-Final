'use client'

import { ShoppingCart, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderActionsProps {
  className?: string
  variant?: 'desktop' | 'mobile'
  cartItemCount?: number
}

export function HeaderActions({ 
  className = '', 
  variant = 'desktop', 
  cartItemCount = 3 
}: HeaderActionsProps) {
  if (variant === 'mobile') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 text-[#4B2E2E] hover:bg-white/60 backdrop-blur-sm rounded-xl"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 text-[#4B2E2E] hover:bg-white/60 backdrop-blur-sm rounded-xl"
        >
          <User className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          className="w-12 h-12 bg-white/80 backdrop-blur-sm text-[#4B2E2E] hover:bg-white rounded-xl shadow-lg relative"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartItemCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#9E7C83] to-[#6E6658] text-white text-xs font-bold rounded-full flex items-center justify-center">
              {cartItemCount}
            </div>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className={`hidden lg:flex items-center space-x-3 ${className}`}>
      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10 text-[#4B2E2E] hover:bg-white/60 backdrop-blur-sm rounded-xl transition-all duration-300 relative"
      >
        <Bell className="h-5 w-5" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#9E7C83] rounded-full animate-pulse"></div>
      </Button>

      {/* Account */}
      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10 text-[#4B2E2E] hover:bg-white/60 backdrop-blur-sm rounded-xl transition-all duration-300"
      >
        <User className="h-5 w-5" />
      </Button>

      {/* Subscribe Button */}
      <Button className="bg-gradient-to-r from-[#4B2E2E] via-[#6E6658] to-[#9E7C83] hover:from-[#6E6658] hover:via-[#9E7C83] hover:to-[#4B2E2E] text-white px-6 py-2.5 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden group">
        <span className="relative z-10">Subscribe</span>
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
      </Button>

      {/* Cart */}
      <Button
        size="icon"
        className="w-10 h-10 bg-white/80 backdrop-blur-sm text-[#4B2E2E] hover:bg-white hover:scale-110 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative"
      >
        <ShoppingCart className="h-5 w-5" />
        {cartItemCount > 0 && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-[#9E7C83] to-[#6E6658] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
            {cartItemCount}
          </div>
        )}
      </Button>
    </div>
  )
}
