"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import CoffeeHero from "@/components/coffee/coffee-hero"
import CoffeeGrid from "@/components/coffee/coffee-grid"
import CoffeeSort from "@/components/coffee/coffee-sort"
import FormatFilterTabs from "@/components/coffee/format-filter-tabs"
import PageTransition from "@/components/ui/page-transition"
import { Button } from "@/components/ui/button"
import { Filter, Grid3X3, List, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import SeamlessFilterSidebar from "@/components/coffee/seamless-filter-sidebar"

export default function CoffeePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRoastLevel, setSelectedRoastLevel] = useState("all")
  const [selectedFormat, setSelectedFormat] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 50])
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showSidebar, setShowSidebar] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  // Load products from cache (no Google Sheets API calls!)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log("🔄 Loading coffee products...")
        const response = await fetch("/api/products?category=coffee")
        const data = await response.json()

        console.log("📊 API Response:", data)

        if (data.success) {
          console.log(`✅ Loaded ${data.products.length} coffee products`)
          setProducts(data.products)
        } else {
          console.error("❌ Failed to load products:", data.error)
          setError(data.error || "Failed to load products")
        }
      } catch (error) {
        console.error("❌ Error loading products:", error)
        setError("Network error loading products")
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    console.log(`🔍 Filtering ${products.length} products...`)
    console.log("Filter criteria:", {
      searchQuery,
      selectedCategory,
      selectedRoastLevel,
      selectedFormat,
      priceRange,
    })

    const filtered = products.filter((product) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        product.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tastingNotes?.some((note: string) => note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.origin?.toLowerCase().includes(searchQuery.toLowerCase())

      // Category filter (subcategory)
      const matchesCategory = selectedCategory === "all" || product.subcategory === selectedCategory

      // Roast level filter
      const matchesRoast = selectedRoastLevel === "all" || product.roastLevel === selectedRoastLevel

      // Format filter - check if product has the selected format
      const matchesFormat = selectedFormat === "all" || product.availableFormats?.includes(selectedFormat)

      // Price filter
      const productPrice = product.defaultVariant?.price || product.priceRange?.min || 0
      const matchesPrice = productPrice >= priceRange[0] && productPrice <= priceRange[1]

      const matches = matchesSearch && matchesCategory && matchesRoast && matchesFormat && matchesPrice

      return matches
    })

    console.log(`✅ Filtered to ${filtered.length} products`)

    // Sort products
    switch (sortBy) {
      case "price-low":
        return filtered.sort((a, b) => {
          const priceA = a.defaultVariant?.price || a.priceRange?.min || 0
          const priceB = b.defaultVariant?.price || b.priceRange?.min || 0
          return priceA - priceB
        })
      case "price-high":
        return filtered.sort((a, b) => {
          const priceA = a.defaultVariant?.price || a.priceRange?.min || 0
          const priceB = b.defaultVariant?.price || b.priceRange?.min || 0
          return priceB - priceA
        })
      case "name":
        return filtered.sort((a, b) => a.productName.localeCompare(b.productName))
      case "featured":
      default:
        return filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }
  }, [searchQuery, selectedCategory, selectedRoastLevel, selectedFormat, priceRange, sortBy, products])

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedRoastLevel("all")
    setSelectedFormat("all")
    setPriceRange([0, 50])
  }

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    selectedRoastLevel !== "all" ||
    selectedFormat !== "all" ||
    priceRange[0] > 0 ||
    priceRange[1] < 50

  // Handle opening sidebar
  const handleOpenSidebar = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowSidebar(true)
  }

  // Handle closing sidebar
  const handleCloseSidebar = () => {
    setShowSidebar(false)
  }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#4B2E2E] to-[#6E6658] rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse">
              <span className="text-white text-2xl">☕</span>
            </div>
            <p className="text-[#6E6658] font-medium">Loading fresh coffee...</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
          <Header />
          <main className="relative overflow-hidden pt-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#4B2E2E] to-[#6E6658] rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-[#4B2E2E] mb-4">Unable to Load Coffee</h2>
              <p className="text-[#6E6658] mb-6">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] text-white"
              >
                Try Again
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
        <Header />

        <main className="relative overflow-hidden pt-24">
          <CoffeeHero />

          <section className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              {/* Format Filter Tabs */}
              <FormatFilterTabs
                products={products}
                selectedFormat={selectedFormat}
                onFormatChange={setSelectedFormat}
              />

              {/* Search and Controls */}
              <div className="mb-12">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6E6658]" />
                    <Input
                      placeholder="Search coffee blends, origins, tasting notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg text-[#4B2E2E] placeholder:text-[#6E6658] font-medium"
                    />
                    {searchQuery && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 text-[#6E6658] hover:text-[#4B2E2E]"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-4">
                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={clearAllFilters}
                        className="border-2 border-[#9E7C83] text-[#9E7C83] hover:bg-[#9E7C83] hover:text-white px-4 py-3 rounded-2xl font-semibold transition-all duration-300 bg-transparent"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>
                    )}

                    {/* Filter Toggle */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleOpenSidebar}
                      className={`border-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                        showSidebar
                          ? "border-[#4B2E2E] bg-[#4B2E2E] text-white"
                          : "border-[#4B2E2E] text-[#4B2E2E] hover:bg-[#4B2E2E] hover:text-white bg-white/60 backdrop-blur-sm"
                      }`}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      More Filters
                    </Button>

                    {/* View Mode */}
                    <div className="flex bg-white/60 backdrop-blur-sm rounded-2xl p-1 border border-white/20">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={`rounded-xl transition-all duration-300 ${
                          viewMode === "grid"
                            ? "bg-[#4B2E2E] text-white shadow-lg"
                            : "text-[#6E6658] hover:text-[#4B2E2E]"
                        }`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className={`rounded-xl transition-all duration-300 ${
                          viewMode === "list"
                            ? "bg-[#4B2E2E] text-white shadow-lg"
                            : "text-[#6E6658] hover:text-[#4B2E2E]"
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Sort */}
                    <CoffeeSort sortBy={sortBy} setSortBy={setSortBy} />
                  </div>
                </div>

                {/* Results Count */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-[#6E6658] font-medium">
                    Showing {filteredProducts.length} of {products.length} coffee products
                    {selectedFormat !== "all" && (
                      <span className="ml-2">
                        in <span className="text-[#4B2E2E] font-semibold">{selectedFormat}</span> format
                      </span>
                    )}
                    {searchQuery && (
                      <span className="ml-2">
                        for "<span className="text-[#4B2E2E] font-semibold">{searchQuery}</span>"
                      </span>
                    )}
                  </div>

                  {/* Active Filters Summary */}
                  {hasActiveFilters && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[#6E6658]">Active filters:</span>
                      {selectedFormat !== "all" && (
                        <span className="bg-[#D5BFA3] text-white px-2 py-1 rounded-full text-xs">{selectedFormat}</span>
                      )}
                      {selectedCategory !== "all" && (
                        <span className="bg-[#9E7C83] text-white px-2 py-1 rounded-full text-xs">
                          {selectedCategory}
                        </span>
                      )}
                      {selectedRoastLevel !== "all" && (
                        <span className="bg-[#6E6658] text-white px-2 py-1 rounded-full text-xs">
                          {selectedRoastLevel}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Grid - Full Width */}
              <div className="w-full">
                <CoffeeGrid products={filteredProducts} viewMode={viewMode} />
              </div>
            </div>
          </section>
        </main>

        <Footer />

        {/* Seamless Animated Sidebar */}
        <SeamlessFilterSidebar
          isOpen={showSidebar}
          onClose={handleCloseSidebar}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedRoastLevel={selectedRoastLevel}
          setSelectedRoastLevel={setSelectedRoastLevel}
          selectedFormat={selectedFormat}
          setSelectedFormat={setSelectedFormat}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          products={products}
        />
      </div>
    </PageTransition>
  )
}
