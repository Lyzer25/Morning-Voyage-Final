'use client'

import Link from 'next/link'

interface NavItem {
  name: string
  href: string
  badge?: string | null
}

interface NavigationProps {
  className?: string
}

const navItems: NavItem[] = [
  { name: 'Coffee', href: '/coffee', badge: 'New' },
  { name: 'Equipment', href: '/equipment', badge: null },
  { name: 'Subscriptions', href: '/subscriptions', badge: 'Up to 50% Off' },
  { name: 'About', href: '/about', badge: null },
  { name: 'Contact', href: '/contact', badge: null },
]

export function Navigation({ className = '' }: NavigationProps) {
  return (
    <nav className={`hidden lg:flex items-center space-x-1 ${className}`}>
      {navItems.map((item) => (
        <div key={item.name} className="relative">
          <Link
            href={item.href}
            className="relative px-4 py-2 text-[#4B2E2E] font-semibold hover:text-[#6E6658] transition-all duration-300 group rounded-xl hover:bg-white/40 backdrop-blur-sm"
          >
            <span className="relative z-10">{item.name}</span>

            {/* Hover Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F6F1EB]/50 to-[#E7CFC7]/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Active Indicator */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#D5BFA3] to-[#9E7C83] group-hover:w-8 transition-all duration-300 rounded-full"></div>

            {/* Badge */}
            {item.badge && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#9E7C83] to-[#6E6658] text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                {item.badge}
              </div>
            )}
          </Link>
        </div>
      ))}
    </nav>
  )
}
