'use client'

import { useEffect, useMemo, useState, useCallback, startTransition, useDeferredValue } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import CoffeeHero from '@/components/coffee/coffee-hero'
import CoffeeGrid from '@/components/coffee/coffee-grid'
import CoffeeSort from '@/components/coffee/coffee-sort'
import FilterSidebar from '@/components/coffee/FilterSidebar'
import PageTransition from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { Filter, Grid3X3, List, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/lib/hooks/use-debounce'
import type { GroupedProduct } from '@/lib/product-variants'

// Performance types
interface FilterState {
  search: string
  category: string
  roastLevel: string
  format: string
  priceRange: [number, number]
  sortBy: string
}

export default function CoffeePage() {
  /* ---------------- FPS MONITORING ---------------- */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // FPS and scroll performance monitoring
      let scrollTimeout: NodeJS.Timeout
      
      const handleScroll = () => {
        performance.mark('scroll-start')
        
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          performance.mark('scroll-end')
          performance.measure('scroll-performance', 'scroll-start', 'scroll-end')
          
          const measures = performance.getEntriesByName('scroll-performance')
          const latestMeasure = measures[measures.length - 1]
          
          if (latestMeasure && latestMeasure.duration > 16.67) { // 60fps = 16.67ms
            console.warn(`[FPS] Scroll lag detected: ${latestMeasure.duration.toFixed(2)}ms (target: <16.67ms)`)
          }
          
          // Clean up old measures to prevent memory leaks
          if (measures.length > 10) {
            performance.clearMeasures('scroll-performance')
          }
        }, 100)
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      
      return () => {
        window.removeEventListener('scroll', handleScroll)
        clearTimeout(scrollTimeout)
        performance.clearMarks('scroll-start')
        performance.clearMarks('scroll-end')
        performance.clearMeasures('scroll-performance')
      }
    }
  }, [])

  /* ---------------- RAW DATA ---------------- */
  const [products, setProducts] = useState<GroupedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/products?category=coffee')
        if (!res.ok) throw new Error('Failed to fetch products')
        const json = await res.json()
        
        // Debug logging
        console.log('🔍 Frontend received API response:', json)
        console.log('🔍 Response success:', json.success)
        console.log('🔍 Response data:', json.data)
        console.log('🔍 Products array:', json.data?.products)
        console.log('🔍 Products length:', json.data?.products?.length)
        console.log('🔍 First product:', json.data?.products?.[0])
        
        const productsArray = Array.isArray(json.data?.products) ? json.data.products : []
        console.log('📊 Final products array to set in state:', productsArray.length)
        setProducts(productsArray)
      } catch (e) {
        console.error('🚨 Frontend API error:', e)
        setError((e as Error).message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  /* -------------- FILTER STATE -------------- */
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRoastLevel, setSelectedRoastLevel] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100])

  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Initialize price range dynamically based on products
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 100
    return Math.ceil(Math.max(...products.map(p => p.defaultVariant?.price || 0)))
  }, [products])

  // Update price range when products load
  useEffect(() => {
    if (products.length > 0 && priceRange[1] === 100) {
      setPriceRange([0, maxPrice])
    }
  }, [products, maxPrice, priceRange])

  // Remove body scroll lock - not needed for inline sidebar
  // useEffect(() => {
  //   // Removed - inline sidebar doesn't need scroll lock
  // }, [filtersOpen])

  // Optimized drawer toggle with startTransition
  const handleDrawerToggle = useCallback(() => {
    startTransition(() => {
      setFiltersOpen((prev: boolean) => !prev)
    })
  }, [])

  // Use deferred value for price range to prevent blocking UI updates
  const deferredPriceRange = useDeferredValue(priceRange)

  // Performance optimized filter handlers with startTransition
  const handleCategoryChange = useCallback((category: string) => {
    console.time('category-filter-update')
    startTransition(() => {
      setSelectedCategory(category)
      console.timeEnd('category-filter-update')
    })
  }, [])

  const handleRoastLevelChange = useCallback((level: string) => {
    console.time('roast-filter-update')
    startTransition(() => {
      setSelectedRoastLevel(level)
      console.timeEnd('roast-filter-update')
    })
  }, [])

  const handleFormatChange = useCallback((format: string) => {
    console.time('format-filter-update')
    startTransition(() => {
      setSelectedFormat(format)
      console.timeEnd('format-filter-update')
    })
  }, [])

  const handlePriceRangeChange = useCallback((range: [number, number]) => {
    console.time('price-filter-update')
    startTransition(() => {
      setPriceRange(range)
      console.timeEnd('price-filter-update')
    })
  }, [])

  const handleSortChange = useCallback((sort: string) => {
    console.time('sort-update')
    startTransition(() => {
      setSortBy(sort)
      console.timeEnd('sort-update')
    })
  }, [])

  const handleClearAllFilters = useCallback(() => {
    console.time('clear-all-filters')
    startTransition(() => {
      setSearchQuery('')
      setSelectedCategory('all')
      setSelectedRoastLevel('all')
      setSelectedFormat('all')
      setPriceRange([0, maxPrice])
      console.timeEnd('clear-all-filters')
    })
  }, [maxPrice])

  // Extract filtering logic for better memoization
  const applyFilters = useCallback((products: GroupedProduct[], filters: FilterState) => {
    console.log('🔄 [OPTIMIZED] Frontend filtering starting with', products.length, 'products')
    console.time('filter-computation')
    
    let list = [...products]

    if (filters.search.trim()) {
      const beforeCount = list.length
      const q = filters.search.toLowerCase()
      list = list.filter(
        p =>
          p.productName.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.origin?.toLowerCase().includes(q) ||
          p.tastingNotes?.some(n => n.toLowerCase().includes(q))
      )
      console.log(`🔍 Search filter "${q}": ${beforeCount} → ${list.length}`)
    }

    if (filters.category !== 'all') {
      const beforeCount = list.length
      list = list.filter(p => p.subcategory === filters.category)
      console.log(`📂 Category filter "${filters.category}": ${beforeCount} → ${list.length}`)
    }

    if (filters.roastLevel !== 'all') {
      const beforeCount = list.length
      list = list.filter(p => p.roastLevel === filters.roastLevel)
      console.log(`☕ Roast filter "${filters.roastLevel}": ${beforeCount} → ${list.length}`)
    }

    if (filters.format !== 'all') {
      const beforeCount = list.length
      list = list.filter(p => p.availableFormats?.includes(filters.format))
      console.log(`📦 Format filter "${filters.format}": ${beforeCount} → ${list.length}`)
    }

    const beforePriceFilter = list.length
    list = list.filter(p => {
      const price = p.defaultVariant?.price ?? p.priceRange?.min ?? 0
      return price <= filters.priceRange[1]
    })
    console.log(`💰 Price filter (≤$${filters.priceRange[1]}): ${beforePriceFilter} → ${list.length}`)

    switch (filters.sortBy) {
      case 'price-low':
        list.sort((a, b) => (a.defaultVariant?.price ?? 0) - (b.defaultVariant?.price ?? 0))
        break
      case 'price-high':
        list.sort((a, b) => (b.defaultVariant?.price ?? 0) - (a.defaultVariant?.price ?? 0))
        break
      case 'name':
        list.sort((a, b) => a.productName.localeCompare(b.productName))
        break
      default:
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    console.timeEnd('filter-computation')
    console.log(`✅ [OPTIMIZED] Final filtered products: ${list.length}`)
    
    if (list.length > 0) {
      console.log('📋 Sample filtered products:')
      list.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.productName} - $${product.defaultVariant?.price ?? 'N/A'}`)
      })
    }

    return list
  }, [])

  /* -------------- OPTIMIZED MEMO FILTER --------------- */
  const filtered = useMemo(() => 
    applyFilters(products, {
      search: debouncedSearch,
      category: selectedCategory,
      roastLevel: selectedRoastLevel,
      format: selectedFormat,
      priceRange: deferredPriceRange, // Use deferred value for smoother price updates
      sortBy,
    }), 
    [products, debouncedSearch, selectedCategory, selectedRoastLevel, selectedFormat, deferredPriceRange, sortBy, applyFilters]
  )

  // Development-only profiler callback 
  const onProfilerRender = useCallback((
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    if (process.env.NODE_ENV === 'development' && actualDuration > 10) {
      console.log(`[Profiler] ${id} took ${actualDuration}ms during ${phase}`)
      console.log(`  startTime: ${startTime}, commitTime: ${commitTime}`)
      console.log(`  baseDuration: ${baseDuration}ms (theoretical minimum)`)
    }
  }, [])

  /* ---------------- RENDER ------------------ */
  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
          <div 
            className="text-center"
            style={{ 
              width: '200px', 
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div 
              className="mx-auto mb-4 flex animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-[#4B2E2E] to-[#6E6658]"
              style={{
                width: '64px',
                height: '64px',
                minWidth: '64px',
                minHeight: '64px'
              }}
            >
              <span className="text-2xl text-white">☕</span>
            </div>
            <p 
              className="font-medium text-[#6E6658]"
              style={{ height: '24px', lineHeight: '24px' }}
            >
              Loading fresh coffee…
            </p>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (error) {
    return (
      <PageTransition>
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </PageTransition>
    )
  }

  const hasActive =
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedRoastLevel !== 'all' ||
    selectedFormat !== 'all' ||
    priceRange[0] > 0 ||
    priceRange[1] < 100

  return (
    <PageTransition>
      <div 
        className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]"
        style={{
          contain: 'layout style paint',
          willChange: 'scroll-position'
        }}
      >
        <Header />

        <main className="relative pt-24">
          <CoffeeHero />

          {/* Corrected Inline Sidebar Layout */}
          <section 
            className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"
            style={{ contain: 'layout style paint' }}
          >
            {/* Filters Button */}
            <div className="mb-6">
              <Button
                onClick={handleDrawerToggle}
                className="w-full sm:w-auto bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] text-white rounded-2xl shadow-lg"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {(selectedCategory !== 'all' || selectedRoastLevel !== 'all' || selectedFormat !== 'all' || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                  <span className="ml-2 bg-white/20 text-white rounded-full px-2 py-1 text-xs">
                    {[
                      selectedCategory !== 'all',
                      selectedRoastLevel !== 'all',
                      selectedFormat !== 'all',
                      priceRange[0] > 0 || priceRange[1] < maxPrice
                    ].filter(Boolean).length}
                  </span>
                )}
              </Button>
            </div>

            {/* Two-Column Flex Layout */}
            <div className="flex gap-8">
              {/* Animated Inline Sidebar */}
              <AnimatePresence>
                {filtersOpen && (
                  <motion.aside
                    initial={{ x: -320, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -320, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                    className="w-80 shrink-0"
                  >
                    <div className="sticky top-8">
                      <FilterSidebar
                        products={products}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={handleCategoryChange}
                        selectedRoastLevel={selectedRoastLevel}
                        setSelectedRoastLevel={handleRoastLevelChange}
                        selectedFormat={selectedFormat}
                        setSelectedFormat={handleFormatChange}
                        priceRange={priceRange}
                        setPriceRange={handlePriceRangeChange}
                        clearAllFilters={handleClearAllFilters}
                        isMobile={false}
                      />
                    </div>
                  </motion.aside>
                )}
              </AnimatePresence>

              {/* Main Content Area - Flexes Naturally */}
              <div className="flex-1 min-w-0 transition-all duration-300">
                <div className="flex flex-col gap-6 lg:gap-8">
                  {/* Search + Controls */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6E6658]" />
                      <Input
                        placeholder="Search coffee blends, origins, tasting notes..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="h-12 rounded-2xl bg-white/95 pl-12 shadow-lg border-0 focus:ring-2 focus:ring-[#4B2E2E]/20"
                      />
                      {searchQuery && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-[#6E6658] hover:bg-[#F6F1EB]"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center gap-4">
                      {/* View toggle */}
                      <div className="flex rounded-2xl border border-white/20 bg-white/90 p-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setViewMode('grid')}
                          className={`transition-all duration-200 ${viewMode === 'grid' ? 'bg-[#4B2E2E] text-white shadow-md' : 'text-[#6E6658] hover:bg-[#F6F1EB]'}`}
                        >
                          <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setViewMode('list')}
                          className={`transition-all duration-200 ${viewMode === 'list' ? 'bg-[#4B2E2E] text-white shadow-md' : 'text-[#6E6658] hover:bg-[#F6F1EB]'}`}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>

                      <CoffeeSort sortBy={sortBy} setSortBy={handleSortChange} />
                    </div>
                  </div>

                  {/* Results Summary */}
                  <div className="flex items-center justify-between text-sm text-[#6E6658]">
                    <span>
                      Showing {filtered.length} of {products.length} coffee products
                    </span>
                    {(selectedCategory !== 'all' || selectedRoastLevel !== 'all' || selectedFormat !== 'all' || searchQuery.trim()) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAllFilters}
                        className="text-[#6E6658] hover:text-[#4B2E2E] hover:bg-[#F6F1EB]"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Clear filters
                      </Button>
                    )}
                  </div>

                  {/* Product Grid */}
                  <div 
                    className="pt-4" 
                    data-grid-size={filtered.length}
                    style={{ contain: 'layout style paint' }}
                  >
                    {process.env.NODE_ENV === 'development' ? (
                      <div>
                        <CoffeeGrid products={filtered} viewMode={viewMode} />
                      </div>
                    ) : (
                      <CoffeeGrid products={filtered} viewMode={viewMode} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  )
}
