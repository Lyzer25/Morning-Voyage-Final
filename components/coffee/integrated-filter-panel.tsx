'use client'

import { useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { X } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type Product = {
  subcategory?: string
  roastLevel?: string
  availableFormats?: string[]
}

type IntegratedFilterPanelProps = {
  isOpen: boolean
  onClose: () => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedRoastLevel: string
  setSelectedRoastLevel: (level: string) => void
  selectedFormat: string
  setSelectedFormat: (format: string) => void
  priceRange: [number, number]
  setPriceRange: (range: [number, number]) => void
  products: Product[]
  clearAllFilters: () => void
}

export default function IntegratedFilterPanel({
  isOpen,
  onClose,
  selectedCategory,
  setSelectedCategory,
  selectedRoastLevel,
  setSelectedRoastLevel,
  selectedFormat,
  setSelectedFormat,
  priceRange,
  setPriceRange,
  products,
  clearAllFilters,
}: IntegratedFilterPanelProps) {
  // Conditional scroll lock
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = '' // Cleanup on close
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

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
      categories: Array.from(categories),
      roastLevels: Array.from(roastLevels),
      formats: Array.from(formats),
    }
  }, [products])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-80 max-w-[90vw] bg-gradient-to-br from-[#F6F1EB] to-white shadow-2xl transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-stone-300 p-4">
            <h2 className="text-xl font-bold text-[#4B2E2E]">Filters</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5 text-[#6E6658]" />
            </Button>
          </div>

          <div className="flex-grow overflow-y-auto p-4">
            <Accordion
              type="multiple"
              defaultValue={['category', 'roast', 'format', 'price']}
              className="w-full"
            >
              <AccordionItem value="category">
                <AccordionTrigger className="text-lg font-semibold text-[#4B2E2E]">
                  Category
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-2">
                    <FilterButton
                      label="All"
                      isActive={selectedCategory === 'all'}
                      onClick={() => setSelectedCategory('all')}
                    />
                    {filterOptions.categories.map(cat => (
                      <FilterButton
                        key={cat}
                        label={cat}
                        isActive={selectedCategory === cat}
                        onClick={() => setSelectedCategory(cat)}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="roast">
                <AccordionTrigger className="text-lg font-semibold text-[#4B2E2E]">
                  Roast Level
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-2">
                    <FilterButton
                      label="All"
                      isActive={selectedRoastLevel === 'all'}
                      onClick={() => setSelectedRoastLevel('all')}
                    />
                    {filterOptions.roastLevels.map(level => (
                      <FilterButton
                        key={level}
                        label={level}
                        isActive={selectedRoastLevel === level}
                        onClick={() => setSelectedRoastLevel(level)}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="format">
                <AccordionTrigger className="text-lg font-semibold text-[#4B2E2E]">
                  Format
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-2">
                    <FilterButton
                      label="All"
                      isActive={selectedFormat === 'all'}
                      onClick={() => setSelectedFormat('all')}
                    />
                    {filterOptions.formats.map(format => (
                      <FilterButton
                        key={format}
                        label={format}
                        isActive={selectedFormat === format}
                        onClick={() => setSelectedFormat(format)}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price">
                <AccordionTrigger className="text-lg font-semibold text-[#4B2E2E]">
                  Price Range
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="px-1">
                    <Slider
                      min={0}
                      max={50}
                      step={1}
                      value={priceRange}
                      onValueChange={value => setPriceRange(value as [number, number])}
                    />
                    <div className="mt-2 flex justify-between text-sm text-[#6E6658]">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="border-t border-stone-300 p-4">
            <Button
              variant="outline"
              className="w-full border-2 border-[#9E7C83] text-[#9E7C83] hover:bg-[#9E7C83] hover:text-white bg-transparent"
              onClick={clearAllFilters}
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

function FilterButton({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      className={`w-full justify-start capitalize ${
        isActive
          ? 'bg-[#4B2E2E] text-white hover:bg-[#4B2E2E]/90'
          : 'border-stone-300 text-[#6E6658] hover:bg-stone-200'
      }`}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}
