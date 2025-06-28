'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search } from './Search'
import { HeaderActions } from './HeaderActions'

interface NavItem {
  name: string
  href: string
  badge?: string | null
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

const navItems: NavItem[] = [
  { name: 'Coffee', href: '/coffee', badge: 'New' },
  { name: 'Equipment', href: '/equipment', badge: null },
  { name: 'Subscriptions', href: '/subscriptions', badge: 'Up to 50% Off' },
  { name: 'About', href: '/about', badge: null },
  { name: 'Contact', href: '/contact', badge: null },
]

export function MobileMenu({ isOpen, onClose, className = '' }: MobileMenuProps) {
  return (
    <div
      className={`lg:hidden overflow-hidden transition-all duration-500 ${
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      } ${className}`}
    >
      <div className="py-6 space-y-4">
        {/* Mobile Search */}
        <Search variant="mobile" className="mb-6" />

        {/* Mobile Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center justify-between p-4 text-[#4B2E2E] font-semibold hover:text-[#6E6658] transition-colors rounded-xl hover:bg-white/60 backdrop-blur-sm group"
              onClick={onClose}
            >
              <span>{item.name}</span>
              {item.badge && (
                <span className="bg-gradient-to-r from-[#9E7C83] to-[#6E6658] text-white text-xs font-bold px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Mobile Actions */}
        <div className="pt-6 border-t border-white/20 space-y-4">
          <HeaderActions variant="mobile" />

          <Button className="w-full bg-gradient-to-r from-[#4B2E2E] via-[#6E6658] to-[#9E7C83] text-white py-3 rounded-xl font-bold shadow-xl">
            Subscribe & Save 50%
          </Button>
        </div>
      </div>
    </div>
  )
}
