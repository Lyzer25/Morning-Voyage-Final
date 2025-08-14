"use client"

import Link from "next/link"
import { ShoppingCart, Search, User, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import Image from "next/image"
import type { SessionData } from "@/lib/types"

export default function ClientHeader({ session }: { session?: SessionData | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [logoLoaded, setLogoLoaded] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  // ENHANCED: Aggressive sign-in flash prevention with client verification
  const [showSignIn, setShowSignIn] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Detect auth/admin pages on the client so we never show Sign In there
  const isAuthPage =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/admin') ||
      window.location.pathname.startsWith('/account') ||
      window.location.pathname.startsWith('/api'));

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Client-side session verification fallback
  useEffect(() => {
    // If no session provided from server, check client-side
    if (!session && isClient && !isAuthPage) {
      const checkClientSession = async () => {
        try {
          const res = await fetch('/api/auth/session-check', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data.session) {
              console.log('HeaderClient: Detected session via client check');
              return true; // Found session, don't show sign-in
            }
          }
        } catch (err) {
          console.warn('HeaderClient: Session check failed:', err);
        }
        return false; // No session found
      };

      // Check for session, then set timer if none found
      checkClientSession().then(hasSession => {
        if (!hasSession) {
          const timer = setTimeout(() => {
            setShowSignIn(true);
          }, 1000); // Increased to 1 second
          return () => clearTimeout(timer);
        }
      });
    }
  }, [session, isClient, isAuthPage]);

  useEffect(() => {
    // Don't show sign in button at all if we have a session
    if (session) {
      setShowSignIn(false);
      return;
    }

    // Only show sign in after delay on public pages
    const timer = setTimeout(() => {
      if (!session && isClient) {
        const path = window.location.pathname;
        const isAuthPage = path.startsWith('/admin') || path.startsWith('/account') || path.startsWith('/api');
        if (!isAuthPage) {
          setShowSignIn(true);
        }
      }
    }, 1000); // Increased to 1 second

    return () => clearTimeout(timer);
  }, [session, isClient]);

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Header Debug:', {
      session: !!session,
      showSignIn,
      isClient,
      path: typeof window !== 'undefined' ? window.location.pathname : 'SSR'
    });
  }


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogoLoad = () => {
    if (!hasAnimated) {
      setLogoLoaded(true)
      setHasAnimated(true)
    }
  }

  // Sign-out handler: call logout API then redirect to login
  const handleSignOut = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json().catch(() => null);
      // Redirect regardless, prefer server-provided redirect when present
      const redirectTo = data?.redirect || '/account/login';
      window.location.href = redirectTo;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Logout error:', err);
      window.location.href = '/account/login';
    }
  };

  const navItems = [
    { name: "Coffee", href: "/coffee", badge: "New" },
    { name: "Subscriptions", href: "/subscriptions", badge: "Up to 50% Off" },
    { name: "About", href: "/about-us", badge: null },
    { name: "Contact", href: "/contact-us", badge: null },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-2xl bg-white/70 border-b border-white/10 shadow-2xl"
          : "backdrop-blur-xl bg-white/60 border-b border-white/5"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group relative">
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
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 translate-y-2"
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
                    ? "opacity-80 scale-100 translate-x-0 translate-y-0"
                    : "opacity-0 scale-50 translate-x-2 -translate-y-2"
                }`}
                style={{
                  transitionDelay: logoLoaded || hasAnimated ? "200ms" : "0ms",
                }}
              ></div>
              <div
                className={`absolute -bottom-2 -left-2 w-3 h-3 bg-[#9E7C83] rounded-full transition-all duration-700 group-hover:opacity-100 ${
                  logoLoaded || hasAnimated
                    ? "opacity-60 scale-100 translate-x-0 translate-y-0"
                    : "opacity-0 scale-50 -translate-x-2 translate-y-2"
                }`}
                style={{
                  transitionDelay: logoLoaded || hasAnimated ? "400ms" : "0ms",
                }}
              ></div>

              {/* Steam Animation Effect */}
              <div
                className={`absolute -top-1 left-1/2 transform -translate-x-1/2 transition-all duration-700 ${
                  logoLoaded || hasAnimated ? "opacity-30 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{
                  transitionDelay: logoLoaded || hasAnimated ? "600ms" : "0ms",
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
                    logoLoaded || hasAnimated ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                  }`}
                  style={{
                    transitionDelay: logoLoaded || hasAnimated ? "300ms" : "0ms",
                  }}
                >
                  Morning Voyage
                </span>
                <span
                  className={`text-xs text-[#6E6658] font-semibold tracking-[0.2em] uppercase group-hover:opacity-100 transition-all duration-700 ${
                    logoLoaded || hasAnimated ? "opacity-70 translate-x-0" : "opacity-0 translate-x-4"
                  }`}
                  style={{
                    transitionDelay: logoLoaded || hasAnimated ? "500ms" : "0ms",
                  }}
                >
                  Premium Coffee
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => (
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

          {/* Desktop Actions */} 
          <div className="hidden lg:flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`w-10 h-10 rounded-xl transition-all duration-300 ${
                  isSearchOpen
                    ? "bg-[#4B2E2E] text-white shadow-lg"
                    : "text-[#4B2E2E] hover:bg-white/60 backdrop-blur-sm"
                }`}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Search Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6E6658]" />
                    <Input
                      placeholder="Search coffee, fashion..."
                      className="pl-10 h-12 bg-white/80 border-0 rounded-xl shadow-sm text-[#4B2E2E] placeholder:text-[#6E6658]"
                    />
                  </div>
                  <div className="mt-3 text-xs text-[#6E6658] font-medium">
                    Popular: Morning Blend, Dark Roast, Hoodies
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 text-[#4B2E2E] hover:bg-white/60 backdrop-blur-sm rounded-xl transition-all duration-300 relative"
            >
              <Bell className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#9E7C83] rounded-full animate-pulse"></div>
            </Button>

            {/* Account / Session-aware navigation */}
            <div>
              {session ? (
                <div className="flex items-center space-x-4">
                  <a
                    href="/account"
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    My Account
                  </a>
                  {session.role === 'admin' && (
                    <a
                      href="/admin"
                      className="text-purple-700 hover:text-purple-900 font-medium"
                    >
                      Admin
                    </a>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : !isAuthPage && showSignIn ? (
                <a 
                  href="/account/login" 
                  className={`
                    bg-gradient-to-r from-amber-900 to-amber-800 hover:from-amber-800 hover:to-amber-700
                    text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl
                    transition-all duration-300 transform hover:scale-105 border border-amber-700
                    ${showSignIn ? 'opacity-100' : 'opacity-0'}
                  `}
                  style={{ 
                    visibility: showSignIn ? 'visible' : 'hidden',
                    transitionDelay: showSignIn ? '0ms' : '750ms'
                  }}
                >
                  Sign In
                </a>
              ) : null}
            </div>

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
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-[#9E7C83] to-[#6E6658] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                3
              </div>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden w-10 h-10 text-[#4B2E2E] hover:bg-white/60 backdrop-blur-sm rounded-xl transition-all duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="relative w-6 h-6">
              <span
                className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ${isMenuOpen ? "rotate-45 top-3" : "top-1"}`}
              ></span>
              <span
                className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 top-3 ${isMenuOpen ? "opacity-0" : "opacity-100"}`}
              ></span>
              <span
                className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ${isMenuOpen ? "-rotate-45 top-3" : "top-5"}`}
              ></span>
            </div>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ${isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="py-6 space-y-4">
            {/* Mobile Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6E6658]" />
              <Input
                placeholder="Search coffee, fashion..."
                className="pl-12 h-12 bg-white/80 backdrop-blur-sm border-0 rounded-xl shadow-lg text-[#4B2E2E] placeholder:text-[#6E6658]"
              />
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center justify-between p-4 text-[#4B2E2E] font-semibold hover:text-[#6E6658] transition-colors rounded-xl hover:bg-white/60 backdrop-blur-sm group"
                  onClick={() => setIsMenuOpen(false)}
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
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 text-[#4B2E2E] hover:bg-white/60 backdrop-blur-sm rounded-xl"
                >
                  <Bell className="h-5 w-5" />
                </Button>

                {/* Session-aware mobile account links */}
                {session ? (
                  <div className="flex items-center space-x-3">
                    <a href="/account" className="text-[#4B2E2E] font-semibold">My Account</a>
                    {session.role === 'admin' && <a href="/admin" className="text-purple-700 font-semibold">Admin</a>}
                  </div>
                ) : !isAuthPage && showSignIn ? (
                  <a
                    href="/account/login"
                    className={`w-full text-center bg-gradient-to-r from-amber-900 to-amber-800 hover:from-amber-800 hover:to-amber-700 text-white py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${showSignIn ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                      visibility: showSignIn ? 'visible' : 'hidden',
                      transitionDelay: showSignIn ? '0ms' : '750ms'
                    }}
                  >
                    Sign In
                  </a>
                ) : null}

                <Button
                  size="icon"
                  className="w-12 h-12 bg-white/80 backdrop-blur-sm text-[#4B2E2E] hover:bg-white rounded-xl shadow-lg relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#9E7C83] to-[#6E6658] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    3
                  </div>
                </Button>
              </div>

              <Button className="w-full bg-gradient-to-r from-[#4B2E2E] via-[#6E6658] to-[#9E7C83] text-white py-3 rounded-xl font-bold shadow-xl">
                Subscribe & Save 50%
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Overlay for Mobile */}
      {isSearchOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsSearchOpen(false)}
        />
      )}
    </header>
  )
}
