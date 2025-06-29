'use client'

import { useEffect, useMemo, useState } from 'react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import CoffeeHero from '@/components/coffee/coffee-hero'
import CoffeeGrid from '@/components/coffee/coffee-grid'
import CoffeeSort from '@/components/coffee/coffee-sort'
import FormatFilterTabs from '@/components/coffee/format-filter-tabs'
import PageTransition from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { Filter, Grid3X3, List, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import SimpleFilterDropdown from '@/components/coffee/simple-filter-dropdown'
import { useDebounce } from '@/lib/hooks/use-debounce'
import type { GroupedProduct } from '@/lib/product-variants'

export default function CoffeePage() {
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

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedRoastLevel('all')
    setSelectedFormat('all')
    setPriceRange([0, 100])
  }

  /* -------------- MEMO FILTER --------------- */
  const filtered = useMemo(() => {
    console.log('🔄 Frontend filtering starting with', products.length, 'products')
    let list = [...products]

    if (debouncedSearch.trim()) {
      const beforeCount = list.length
      const q = debouncedSearch.toLowerCase()
      list = list.filter(
        p =>
          p.productName.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.origin?.toLowerCase().includes(q) ||
          p.tastingNotes?.some(n => n.toLowerCase().includes(q))
      )
      console.log(`🔍 Search filter "${q}": ${beforeCount} → ${list.length}`)
    }

    if (selectedCategory !== 'all') {
      const beforeCount = list.length
      list = list.filter(p => p.subcategory === selectedCategory)
      console.log(`📂 Category filter "${selectedCategory}": ${beforeCount} → ${list.length}`)
    }

    if (selectedRoastLevel !== 'all') {
      const beforeCount = list.length
      list = list.filter(p => p.roastLevel === selectedRoastLevel)
      console.log(`☕ Roast filter "${selectedRoastLevel}": ${beforeCount} → ${list.length}`)
    }

    if (selectedFormat !== 'all') {
      const beforeCount = list.length
      list = list.filter(p => p.availableFormats?.includes(selectedFormat))
      console.log(`📦 Format filter "${selectedFormat}": ${beforeCount} → ${list.length}`)
    }

    const beforePriceFilter = list.length
    list = list.filter(p => {
      const price = p.defaultVariant?.price ?? p.priceRange?.min ?? 0
      return price <= priceRange[1]
    })
    console.log(`💰 Price filter (≤$${priceRange[1]}): ${beforePriceFilter} → ${list.length}`)

    switch (sortBy) {
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

    console.log(`✅ Final filtered products: ${list.length}`)
    if (list.length > 0) {
      console.log('📋 Sample filtered products:')
      list.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.productName} - $${product.defaultVariant?.price ?? 'N/A'}`)
      })
    }

    return list
  }, [
    products,
    debouncedSearch,
    selectedCategory,
    selectedRoastLevel,
    selectedFormat,
    priceRange,
    sortBy,
  ])

  /* ---------------- RENDER ------------------ */
  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-[#4B2E2E] to-[#6E6658]">
              <span className="text-2xl text-white">☕</span>
            </div>
            <p className="font-medium text-[#6E6658]">Loading fresh coffee…</p>
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
      <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
        <Header />

        <main className="relative pt-24">
          <CoffeeHero />

          {/* Top Controls */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <FormatFilterTabs
              products={products}
              selectedFormat={selectedFormat}
              onFormatChange={setSelectedFormat}
            />

            <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6E6658]" />
                <Input
                  placeholder="Search coffee…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-12 rounded-2xl bg-white/80 pl-12 shadow-lg backdrop-blur-sm"
                />
                {searchQuery && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-[#6E6658]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Right side controls */}
              <div className="flex flex-wrap items-center gap-4">
                {/* New Lightweight Filter Dropdown */}
                <SimpleFilterDropdown
                  products={products}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedRoastLevel={selectedRoastLevel}
                  setSelectedRoastLevel={setSelectedRoastLevel}
                  selectedFormat={selectedFormat}
                  setSelectedFormat={setSelectedFormat}
                  clearAllFilters={clearAllFilters}
                />

                {/* View toggle */}
                <div className="flex rounded-2xl border border-white/20 bg-white/60 p-1 backdrop-blur-sm">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-[#4B2E2E] text-white' : 'text-[#6E6658]'}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-[#4B2E2E] text-white' : 'text-[#6E6658]'}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <CoffeeSort sortBy={sortBy} setSortBy={setSortBy} />
              </div>
            </div>
          </section>

          {/* Product Grid */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <CoffeeGrid products={filtered} viewMode={viewMode} />
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  )
}
