'use client'

import { useState, useEffect } from 'react'
import { Logo } from './Logo'
import { Navigation } from './Navigation'
import { Search } from './Search'
import { HeaderActions } from './HeaderActions'
import { MobileMenu } from './MobileMenu'
import { MobileMenuButton } from './MobileMenuButton'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMenuClose = () => {
    setIsMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'backdrop-blur-2xl bg-white/70 border-b border-white/10 shadow-2xl'
          : 'backdrop-blur-xl bg-white/60 border-b border-white/5'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <Navigation />

          {/* Desktop Actions */}
          <div className="flex items-center space-x-3">
            <Search />
            <HeaderActions />
          </div>

          {/* Mobile Menu Button */}
          <MobileMenuButton
            isOpen={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div>

        {/* Mobile Menu */}
        <MobileMenu isOpen={isMenuOpen} onClose={handleMenuClose} />
      </div>
    </header>
  )
}
