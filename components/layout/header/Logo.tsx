'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface LogoProps {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  const [logoLoaded, setLogoLoaded] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  const handleLogoLoad = () => {
    if (!hasAnimated) {
      setLogoLoaded(true)
      setHasAnimated(true)
    }
  }

  return (
    <Link href="/" className={`flex items-center space-x-3 group relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Logo Container */}
        <div className="w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-all duration-500 relative z-10">
          {/* Loading Skeleton - only show initially */}
          {!hasAnimated && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#F6F1EB] via-[#E7CFC7] to-[#F6F1EB] rounded-2xl animate-pulse">
              <div className="w-full h-full bg-gradient-to-br from-[#D5BFA3]/30 to-[#9E7C83]/30 rounded-2xl"></div>
            </div>
          )}

          {/* Actual Logo */}
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LogoCup-OnOrgzg5EXqBRLIbTMVgwwzgM1HMDq.png"
            alt="Morning Voyage Coffee Logo"
            width={64}
            height={64}
            className={`w-full h-full object-contain group-hover:rotate-3 drop-shadow-lg transition-all duration-700 ${
              logoLoaded || hasAnimated
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-2'
            }`}
            priority
            onLoad={handleLogoLoad}
            onError={handleLogoLoad}
          />
        </div>

        {/* Decorative floating elements */}
        <div
          className={`absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-[#D5BFA3] to-[#E7CFC7] rounded-full shadow-lg group-hover:scale-125 transition-all duration-700 ${
            logoLoaded || hasAnimated
              ? 'opacity-80 scale-100 translate-x-0 translate-y-0'
              : 'opacity-0 scale-50 translate-x-2 -translate-y-2'
          }`}
          style={{
            transitionDelay: logoLoaded || hasAnimated ? '200ms' : '0ms',
          }}
        ></div>
        <div
          className={`absolute -bottom-2 -left-2 w-3 h-3 bg-[#9E7C83] rounded-full transition-all duration-700 group-hover:opacity-100 ${
            logoLoaded || hasAnimated
              ? 'opacity-60 scale-100 translate-x-0 translate-y-0'
              : 'opacity-0 scale-50 -translate-x-2 translate-y-2'
          }`}
          style={{
            transitionDelay: logoLoaded || hasAnimated ? '400ms' : '0ms',
          }}
        ></div>

        {/* Steam Animation Effect */}
        <div
          className={`absolute -top-1 left-1/2 transform -translate-x-1/2 transition-all duration-700 ${
            logoLoaded || hasAnimated ? 'opacity-30 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            transitionDelay: logoLoaded || hasAnimated ? '600ms' : '0ms',
          }}
        >
          <div className="w-1 h-3 bg-gradient-to-t from-[#D5BFA3] to-transparent rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Text with Fade Animation */}
      <div className="hidden sm:block">
        <div className="flex flex-col">
          <span
            className={`text-[#4B2E2E] font-black text-2xl tracking-tight leading-none group-hover:text-[#6E6658] transition-all duration-700 ${
              logoLoaded || hasAnimated
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-4'
            }`}
            style={{
              transitionDelay: logoLoaded || hasAnimated ? '300ms' : '0ms',
            }}
          >
            Morning Voyage
          </span>
          <span
            className={`text-xs text-[#6E6658] font-semibold tracking-[0.2em] uppercase group-hover:opacity-100 transition-all duration-700 ${
              logoLoaded || hasAnimated
                ? 'opacity-70 translate-x-0'
                : 'opacity-0 translate-x-4'
            }`}
            style={{
              transitionDelay: logoLoaded || hasAnimated ? '500ms' : '0ms',
            }}
          >
            Premium Coffee
          </span>
        </div>
      </div>
    </Link>
  )
}
