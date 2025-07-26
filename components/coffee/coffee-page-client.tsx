"use client"

import { useMemo, useState } from "react"
import CoffeeGrid from "@/components/coffee/coffee-grid"
import CoffeeSort from "@/components/coffee/coffee-sort"
import FormatFilterTabs from "@/components/coffee/format-filter-tabs"
import { Button } from "@/components/ui/button"
import { Filter, Grid3X3, List, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import IntegratedFilterPanel from "@/components/coffee/integrated-filter-panel"
import { useDebounce } from "@/hooks/use-debounce"
import CoffeeHero from "@/components/coffee/coffee-hero"
import type { GroupedProduct } from "@/lib/product-variants"

interface CoffeePageClientProps {
  initialProducts: GroupedProduct[]
}

export default function CoffeePageClient({ initialProducts }: CoffeePageClientProps) {
  const [products] = useState<GroupedProduct[]>(initialProducts)

  /* -------------- FILTER STATE -------------- */
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 300)

  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRoastLevel, setSelectedRoastLevel] = useState("all")
  const [selectedFormat, setSelectedFormat] = useState("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50])

  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedRoastLevel("all")
    setSelectedFormat("all")
    setPriceRange([0, 50])
  }

  /* -------------- MEMO FILTER --------------- */
  const filtered = useMemo(() => {
    let list = [...products]

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.origin?.toLowerCase().includes(q) ||
          p.tastingNotes?.some((n) => n.toLowerCase().includes(q)),
      )
    }

    if (selectedCategory !== "all") list = list.filter((p) => p.subcategory === selectedCategory)
    if (selectedRoastLevel !== "all") list = list.filter((p) => p.roastLevel === selectedRoastLevel)
    if (selectedFormat !== "all") list = list.filter((p) => p.availableFormats?.includes(selectedFormat))

    list = list.filter((p) => (p.defaultVariant?.price ?? p.priceRange?.min ?? 0) <= priceRange[1])

    switch (sortBy) {
      case "price-low":
        list.sort((a, b) => (a.defaultVariant?.price ?? 0) - (b.defaultVariant?.price ?? 0))
        break
      case "price-high":
        list.sort((a, b) => (b.defaultVariant?.price ?? 0) - (a.defaultVariant?.price ?? 0))
        break
      case "name":
        list.sort((a, b) => a.productName.localeCompare(b.productName))
        break
      default:
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return list
  }, [products, debouncedSearch, selectedCategory, selectedRoastLevel, selectedFormat, priceRange, sortBy])

  const hasActive =
    searchQuery ||
    selectedCategory !== "all" ||
    selectedRoastLevel !== "all" ||
    selectedFormat !== "all" ||
    priceRange[0] > 0 ||
    priceRange[1] < 50

  return (
    <>
      <IntegratedFilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedRoastLevel={selectedRoastLevel}
        setSelectedRoastLevel={setSelectedRoastLevel}
        selectedFormat={selectedFormat}
        setSelectedFormat={setSelectedFormat}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        clearAllFilters={clearAllFilters}
        products={products}
      />

      <main className={`relative pt-24 transition-all duration-500 ${showFilters ? "lg:ml-80" : ""}`}>
        <CoffeeHero />

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <FormatFilterTabs products={products} selectedFormat={selectedFormat} onFormatChange={setSelectedFormat} />

          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6E6658]" />
              <Input
                placeholder="Search coffee…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 rounded-2xl bg-white/80 pl-12 shadow-lg backdrop-blur-sm"
              />
              {searchQuery && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-[#6E6658]"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {hasActive && !showFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="rounded-2xl border-2 border-[#9E7C83] text-[#9E7C83] hover:bg-[#9E7C83] hover:text-white bg-transparent"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                className={`rounded-2xl border-2 px-6 py-3 ${
                  showFilters
                    ? "border-[#4B2E2E] bg-[#4B2E2E] text-white"
                    : "border-[#4B2E2E] bg-white/60 text-[#4B2E2E] hover:bg-[#4B2E2E] hover:text-white"
                }`}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>

              <div className="flex rounded-2xl border border-white/20 bg-white/60 p-1 backdrop-blur-sm">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-[#4B2E2E] text-white" : "text-[#6E6658]"}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-[#4B2E2E] text-white" : "text-[#6E6658]"}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <CoffeeSort sortBy={sortBy} setSortBy={setSortBy} />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <CoffeeGrid products={filtered} viewMode={viewMode} />
        </section>
      </main>
    </>
  )
}
