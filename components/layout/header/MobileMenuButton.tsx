'use client'

import { Button } from '@/components/ui/button'

interface MobileMenuButtonProps {
  isOpen: boolean
  onClick: () => void
  className?: string
}

export function MobileMenuButton({ isOpen, onClick, className = '' }: MobileMenuButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`lg:hidden w-10 h-10 text-[#4B2E2E] hover:bg-white/60 backdrop-blur-sm rounded-xl transition-all duration-300 ${className}`}
      onClick={onClick}
    >
      <div className="relative w-6 h-6">
        <span
          className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ${
            isOpen ? 'rotate-45 top-3' : 'top-1'
          }`}
        ></span>
        <span
          className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 top-3 ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
        ></span>
        <span
          className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ${
            isOpen ? '-rotate-45 top-3' : 'top-5'
          }`}
        ></span>
      </div>
    </Button>
  )
}
