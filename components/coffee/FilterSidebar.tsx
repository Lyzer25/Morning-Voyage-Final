'use client'

import { useMemo, startTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { X, Coffee, Package, Zap, Filter } from 'lucide-react'
import type { GroupedProduct } from '@/lib/product-variants'
import { getFormatDisplayName } from '@/lib/product-variants'

interface FilterSidebarProps {
  products: GroupedProduct[]
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedRoastLevel: string
  setSelectedRoastLevel: (level: string) => void
  selectedFormat: string
  setSelectedFormat: (format: string) => void
  priceRange: [number, number]
  setPriceRange: (range: [number, number]) => void
  clearAllFilters: () => void
  onMobileClose?: () => void
  isMobile?: boolean
}

const formatIcons = {
  'whole-bean': Coffee,
  ground: Package,
  pods: Zap,
  instant: Zap,
} as const

const roastLevelColors = {
  'light': 'bg-gradient-to-r from-[#E7CFC7] to-[#D5BFA3]',
  'medium': 'bg-gradient-to-r from-[#D5BFA3] to-[#9E7C83]',
  'medium-dark': 'bg-gradient-to-r from-[#9E7C83] to-[#6E6658]',
  'dark': 'bg-gradient-to-r from-[#6E6658] to-[#4B2E2E]',
} as const

export default function FilterSidebar({
  products,
  selectedCategory,
  setSelectedCategory,
  selectedRoastLevel,
  setSelectedRoastLevel,
  selectedFormat,
  setSelectedFormat,
  priceRange,
  setPriceRange,
  clearAllFilters,
  onMobileClose,
  isMobile = false,
}: FilterSidebarProps) {
  // Memoize filter options for optimal performance
  const filterOptions = useMemo(() => {
    const categories = new Set<string>()
    const roastLevels = new Set<string>()
    const formats = new Set<string>()
    let maxPrice = 0

    products.forEach(product => {
      if (product.subcategory) categories.add(product.subcategory)
      if (product.roastLevel) roastLevels.add(product.roastLevel)
      product.availableFormats.forEach(format => formats.add(format))
      maxPrice = Math.max(maxPrice, product.defaultVariant?.price || 0)
    })

    return {
      categories: Array.from(categories).sort(),
      roastLevels: Array.from(roastLevels).sort(),
      formats: Array.from(formats).sort(),
      maxPrice: Math.ceil(maxPrice),
    }
  }, [products])

  // Count products for each filter option
  const getFilterCount = (filterType: 'category' | 'roast' | 'format', value: string) => {
    if (value === 'all') return products.length

    return products.filter(product => {
      switch (filterType) {
        case 'category':
          return product.subcategory === value
        case 'roast':
          return product.roastLevel === value
        case 'format':
          return product.availableFormats.includes(value)
        default:
          return false
      }
    }).length
  }

  // Handle price range with transition for smooth UX
  const handlePriceChange = (value: number[]) => {
    startTransition(() => {
      setPriceRange([value[0], value[1]])
    })
  }

  // Check if filters are active
  const hasActiveFilters = 
    selectedCategory !== 'all' ||
    selectedRoastLevel !== 'all' ||
    selectedFormat !== 'all' ||
    priceRange[0] > 0 ||
    priceRange[1] < filterOptions.maxPrice

  const activeFilterCount = [
    selectedCategory !== 'all',
    selectedRoastLevel !== 'all', 
    selectedFormat !== 'all',
    priceRange[0] > 0 || priceRange[1] < filterOptions.maxPrice,
  ].filter(Boolean).length

  return (
    <div 
      className="h-full bg-white/95 border-r border-[#E7CFC7]"
      style={{
        contain: 'layout style paint',
        willChange: 'scroll-position'
      }}
    >
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between p-6 border-b border-[#E7CFC7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] rounded-xl flex items-center justify-center">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#4B2E2E]">Filters</h2>
              {activeFilterCount > 0 && (
                <p className="text-sm text-[#6E6658]">{activeFilterCount} active</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="text-[#6E6658] hover:bg-[#F6F1EB]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      <div 
        className={`${isMobile ? 'h-[calc(100vh-120px)]' : 'h-screen'} px-6 py-6 overflow-y-auto overscroll-contain`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#E7CFC7 transparent'
        }}
      >
        <div className="space-y-8">
          {/* Desktop Header */}
          {!isMobile && (
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] rounded-2xl flex items-center justify-center">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#4B2E2E]">Filter Coffee</h2>
                <p className="text-sm text-[#6E6658]">
                  {products.length} total products
                </p>
              </div>
            </div>
          )}

          {/* Coffee Types (Subcategory) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-[#6E6658]" />
              <h3 className="font-semibold text-[#4B2E2E]">Coffee Types</h3>
            </div>
            
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={() => setSelectedCategory('all')}
                className={`w-full justify-between h-auto p-3 rounded-xl transition-all duration-200 ${
                  selectedCategory === 'all'
                    ? 'bg-[#4B2E2E] text-white shadow-lg'
                    : 'hover:bg-[#F6F1EB] text-[#6E6658]'
                }`}
              >
                <span className="font-medium">All Coffee</span>
                <Badge 
                  variant="secondary" 
                  className={`${
                    selectedCategory === 'all' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-[#E7CFC7] text-[#6E6658]'
                  }`}
                >
                  {getFilterCount('category', 'all')}
                </Badge>
              </Button>
              
              {filterOptions.categories.map(category => (
                <Button
                  key={category}
                  variant="ghost"
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full justify-between h-auto p-3 rounded-xl transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-[#4B2E2E] text-white shadow-lg'
                      : 'hover:bg-[#F6F1EB] text-[#6E6658]'
                  }`}
                >
                  <span className="font-medium capitalize">
                    {category.replace('-', ' ')}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className={`${
                      selectedCategory === category 
                        ? 'bg-white/20 text-white' 
                        : 'bg-[#E7CFC7] text-[#6E6658]'
                    }`}
                  >
                    {getFilterCount('category', category)}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          <Separator className="bg-[#E7CFC7]" />

          {/* Format */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#6E6658]" />
              <h3 className="font-semibold text-[#4B2E2E]">Format</h3>
            </div>
            
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={() => setSelectedFormat('all')}
                className={`w-full justify-between h-auto p-3 rounded-xl transition-all duration-200 ${
                  selectedFormat === 'all'
                    ? 'bg-[#4B2E2E] text-white shadow-lg'
                    : 'hover:bg-[#F6F1EB] text-[#6E6658]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedFormat === 'all' ? 'bg-white/20' : 'bg-[#F6F1EB]'
                  }`}>
                    <Package className={`w-4 h-4 ${
                      selectedFormat === 'all' ? 'text-white' : 'text-[#6E6658]'
                    }`} />
                  </div>
                  <span className="font-medium">All Formats</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`${
                    selectedFormat === 'all' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-[#E7CFC7] text-[#6E6658]'
                  }`}
                >
                  {getFilterCount('format', 'all')}
                </Badge>
              </Button>
              
              {filterOptions.formats.map(format => {
                const Icon = formatIcons[format as keyof typeof formatIcons] || Package
                return (
                  <Button
                    key={format}
                    variant="ghost"
                    onClick={() => setSelectedFormat(format)}
                    className={`w-full justify-between h-auto p-3 rounded-xl transition-all duration-200 ${
                      selectedFormat === format
                        ? 'bg-[#4B2E2E] text-white shadow-lg'
                        : 'hover:bg-[#F6F1EB] text-[#6E6658]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedFormat === format ? 'bg-white/20' : 'bg-[#F6F1EB]'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          selectedFormat === format ? 'text-white' : 'text-[#6E6658]'
                        }`} />
                      </div>
                      <span className="font-medium">{getFormatDisplayName(format)}</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${
                        selectedFormat === format 
                          ? 'bg-white/20 text-white' 
                          : 'bg-[#E7CFC7] text-[#6E6658]'
                      }`}
                    >
                      {getFilterCount('format', format)}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </div>

          <Separator className="bg-[#E7CFC7]" />

          {/* Roast Level */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-[#D5BFA3] to-[#4B2E2E] rounded-full" />
              <h3 className="font-semibold text-[#4B2E2E]">Roast Level</h3>
            </div>
            
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={() => setSelectedRoastLevel('all')}
                className={`w-full justify-between h-auto p-3 rounded-xl transition-all duration-200 ${
                  selectedRoastLevel === 'all'
                    ? 'bg-[#4B2E2E] text-white shadow-lg'
                    : 'hover:bg-[#F6F1EB] text-[#6E6658]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedRoastLevel === 'all' ? 'bg-white/20' : 'bg-gradient-to-r from-[#D5BFA3] to-[#4B2E2E]'
                  }`}>
                    <Coffee className={`w-4 h-4 ${
                      selectedRoastLevel === 'all' ? 'text-white' : 'text-white'
                    }`} />
                  </div>
                  <span className="font-medium">All Roasts</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`${
                    selectedRoastLevel === 'all' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-[#E7CFC7] text-[#6E6658]'
                  }`}
                >
                  {getFilterCount('roast', 'all')}
                </Badge>
              </Button>
              
              {filterOptions.roastLevels.map(level => {
                const colorClass = roastLevelColors[level as keyof typeof roastLevelColors] || roastLevelColors['medium']
                return (
                  <Button
                    key={level}
                    variant="ghost"
                    onClick={() => setSelectedRoastLevel(level)}
                    className={`w-full justify-between h-auto p-3 rounded-xl transition-all duration-200 ${
                      selectedRoastLevel === level
                        ? 'bg-[#4B2E2E] text-white shadow-lg'
                        : 'hover:bg-[#F6F1EB] text-[#6E6658]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedRoastLevel === level ? 'bg-white/20' : colorClass
                      }`}>
                        <Coffee className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium capitalize">{level.replace('-', ' ')} Roast</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${
                        selectedRoastLevel === level 
                          ? 'bg-white/20 text-white' 
                          : 'bg-[#E7CFC7] text-[#6E6658]'
                      }`}
                    >
                      {getFilterCount('roast', level)}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </div>

          <Separator className="bg-[#E7CFC7]" />

          {/* Price Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#4B2E2E]">Price Range</h3>
              <span className="text-sm text-[#6E6658]">
                ${priceRange[0]} - ${priceRange[1]}
              </span>
            </div>
            
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={handlePriceChange}
                max={filterOptions.maxPrice}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[#6E6658] mt-2">
                <span>$0</span>
                <span>${filterOptions.maxPrice}</span>
              </div>
            </div>
          </div>

          {/* Clear All Filters */}
          {hasActiveFilters && (
            <div className="pt-4">
              <Button
                onClick={clearAllFilters}
                variant="outline"
                className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Footer */}
      {isMobile && (
        <div className="p-6 border-t border-[#E7CFC7] bg-white">
          <Button
            onClick={onMobileClose}
            className="w-full bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] text-white rounded-xl"
          >
            View {products.length} Products
          </Button>
        </div>
      )}
    </div>
  )
}
