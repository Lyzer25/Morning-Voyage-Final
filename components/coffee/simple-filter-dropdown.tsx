'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Filter, X } from 'lucide-react'

type Product = {
  subcategory?: string
  roastLevel?: string
  availableFormats?: string[]
  defaultVariant?: { price: number }
  priceRange?: { min: number; max: number }
}

type SimpleFilterDropdownProps = {
  products: Product[]
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedRoastLevel: string
  setSelectedRoastLevel: (level: string) => void
  selectedFormat: string
  setSelectedFormat: (format: string) => void
  clearAllFilters: () => void
}

export default function SimpleFilterDropdown({
  products,
  selectedCategory,
  setSelectedCategory,
  selectedRoastLevel,
  setSelectedRoastLevel,
  selectedFormat,
  setSelectedFormat,
  clearAllFilters,
}: SimpleFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Lightweight filter options calculation
  const filterOptions = useMemo(() => {
    const categories = new Set<string>()
    const roastLevels = new Set<string>()
    const formats = new Set<string>()

    products.forEach(p => {
      if (p.subcategory) categories.add(p.subcategory)
      if (p.roastLevel) roastLevels.add(p.roastLevel)
      p.availableFormats?.forEach(f => formats.add(f))
    })

    return {
      categories: Array.from(categories).sort(),
      roastLevels: Array.from(roastLevels).sort(),
      formats: Array.from(formats).sort(),
    }
  }, [products])

  // Count active filters
  const activeFilters = [
    selectedCategory !== 'all' ? selectedCategory : null,
    selectedRoastLevel !== 'all' ? selectedRoastLevel : null,
    selectedFormat !== 'all' ? selectedFormat : null,
  ].filter(Boolean)

  const hasActiveFilters = activeFilters.length > 0

  return (
    <div className="flex items-center gap-3">
      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          {activeFilters.map((filter) => (
            <Badge 
              key={filter} 
              variant="secondary"
              className="bg-[#4B2E2E]/10 text-[#4B2E2E] border-[#4B2E2E]/20 capitalize"
            >
              {filter}
            </Badge>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onClick={clearAllFilters}
            className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Filter Dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`rounded-xl border-2 px-4 py-2 transition-colors ${
              hasActiveFilters
                ? 'border-[#4B2E2E] bg-[#4B2E2E] text-white hover:bg-[#4B2E2E]/90'
                : 'border-[#4B2E2E] bg-white/60 text-[#4B2E2E] hover:bg-[#4B2E2E] hover:text-white'
            }`}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge className="ml-2 h-5 w-5 rounded-full bg-white text-[#4B2E2E] text-xs p-0 flex items-center justify-center">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="end" 
          className="w-64 bg-white/95 backdrop-blur-xl border-[#4B2E2E]/20"
        >
          {/* Category Filter */}
          <DropdownMenuLabel className="text-[#4B2E2E] font-semibold">
            Category
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => setSelectedCategory('all')}
            className={`cursor-pointer ${
              selectedCategory === 'all' ? 'bg-[#4B2E2E]/10 text-[#4B2E2E] font-medium' : ''
            }`}
          >
            All Categories
          </DropdownMenuItem>
          {filterOptions.categories.map(category => (
            <DropdownMenuItem
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`cursor-pointer capitalize ${
                selectedCategory === category ? 'bg-[#4B2E2E]/10 text-[#4B2E2E] font-medium' : ''
              }`}
            >
              {category.replace('-', ' ')}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          {/* Roast Level Filter */}
          <DropdownMenuLabel className="text-[#4B2E2E] font-semibold">
            Roast Level
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => setSelectedRoastLevel('all')}
            className={`cursor-pointer ${
              selectedRoastLevel === 'all' ? 'bg-[#4B2E2E]/10 text-[#4B2E2E] font-medium' : ''
            }`}
          >
            All Roasts
          </DropdownMenuItem>
          {filterOptions.roastLevels.map(level => (
            <DropdownMenuItem
              key={level}
              onClick={() => setSelectedRoastLevel(level)}
              className={`cursor-pointer capitalize ${
                selectedRoastLevel === level ? 'bg-[#4B2E2E]/10 text-[#4B2E2E] font-medium' : ''
              }`}
            >
              {level}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          {/* Format Filter */}
          <DropdownMenuLabel className="text-[#4B2E2E] font-semibold">
            Format
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => setSelectedFormat('all')}
            className={`cursor-pointer ${
              selectedFormat === 'all' ? 'bg-[#4B2E2E]/10 text-[#4B2E2E] font-medium' : ''
            }`}
          >
            All Formats
          </DropdownMenuItem>
          {filterOptions.formats.map(format => (
            <DropdownMenuItem
              key={format}
              onClick={() => setSelectedFormat(format)}
              className={`cursor-pointer capitalize ${
                selectedFormat === format ? 'bg-[#4B2E2E]/10 text-[#4B2E2E] font-medium' : ''
              }`}
            >
              {format.replace('-', ' ')}
            </DropdownMenuItem>
          ))}

          {hasActiveFilters && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  clearAllFilters()
                  setIsOpen(false)
                }}
                className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <X className="mr-2 h-4 w-4" />
                Clear All Filters
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
