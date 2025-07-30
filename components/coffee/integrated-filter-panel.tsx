"use client"

import { useMemo } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { X } from "lucide-react"
import type { GroupedProduct } from "@/lib/product-variants"

interface IntegratedFilterPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedRoastLevel: string
  setSelectedRoastLevel: (roast: string) => void
  selectedFormat: string
  setSelectedFormat: (format: string) => void
  priceRange: [number, number]
  setPriceRange: (range: [number, number]) => void
  clearAllFilters: () => void
  products: GroupedProduct[]
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
  clearAllFilters,
  products,
}: IntegratedFilterPanelProps) {
  const categories = useMemo(() => {
    const allCategories = products.map((p) => p.subcategory).filter(Boolean)
    return ["all", ...Array.from(new Set(allCategories as string[]))]
  }, [products])

  const roastLevels = useMemo(() => {
    const allRoasts = products.map((p) => p.roastLevel).filter(Boolean)
    return ["all", ...Array.from(new Set(allRoasts as string[]))]
  }, [products])

  const formats = useMemo(() => {
    const allFormats = products.flatMap((p) => p.availableFormats || []).filter(Boolean)
    return ["all", ...Array.from(new Set(allFormats as string[]))]
  }, [products])

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-80 bg-[#F4F1ED] border-l-0 p-0" side="left">
        <div className="flex h-full flex-col">
          <SheetHeader className="flex flex-row items-center justify-between p-6 pb-4 border-b border-stone-300">
            <SheetTitle className="text-2xl font-serif text-[#4B2E2E]">Filters</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6 text-[#6E6658]" />
            </Button>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Category Filter */}
            <div>
              <Label className="text-lg font-serif text-[#4B2E2E] mb-3 block">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full h-12 rounded-lg bg-white border-stone-300">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Roast Level Filter */}
            <div>
              <Label className="text-lg font-serif text-[#4B2E2E] mb-3 block">Roast Level</Label>
              <Select value={selectedRoastLevel} onValueChange={setSelectedRoastLevel}>
                <SelectTrigger className="w-full h-12 rounded-lg bg-white border-stone-300">
                  <SelectValue placeholder="Select a roast level" />
                </SelectTrigger>
                <SelectContent>
                  {roastLevels.map((roast) => (
                    <SelectItem key={roast} value={roast} className="capitalize">
                      {roast}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Format Filter */}
            <div>
              <Label className="text-lg font-serif text-[#4B2E2E] mb-3 block">Format</Label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger className="w-full h-12 rounded-lg bg-white border-stone-300">
                  <SelectValue placeholder="Select a format" />
                </SelectTrigger>
                <SelectContent>
                  {formats.map((format) => (
                    <SelectItem key={format} value={format} className="capitalize">
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div>
              <Label className="text-lg font-serif text-[#4B2E2E] mb-3 block">Price Range</Label>
              <Slider
                min={0}
                max={50}
                step={1}
                value={[priceRange[1]]}
                onValueChange={(value) => setPriceRange([0, value[0]])}
                className="my-4"
              />
              <div className="flex justify-between text-sm text-[#6E6658]">
                <span>$0</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-stone-300">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="w-full rounded-xl border-2 border-[#9E7C83] text-[#9E7C83] hover:bg-[#9E7C83] hover:text-white bg-transparent"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
