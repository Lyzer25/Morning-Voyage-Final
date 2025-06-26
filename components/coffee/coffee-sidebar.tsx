"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import CoffeeFilters from "./coffee-filters"
import type { Product } from "@/lib/product-data"

interface CoffeeSidebarProps {
  isOpen: boolean
  onClose: () => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedRoastLevel: string
  setSelectedRoastLevel: (roast: string) => void
  selectedFormat: string
  setSelectedFormat: (format: string) => void
  priceRange: number[]
  setPriceRange: (range: number[]) => void
  products: Product[]
}

export default function CoffeeSidebar({
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
}: CoffeeSidebarProps) {
  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-96 bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7] shadow-2xl z-50 transform transition-transform duration-500 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/30 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-[#4B2E2E]">Filter Coffee</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[#6E6658] hover:text-[#4B2E2E] hover:bg-white/50 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="h-full overflow-y-auto pb-20 pt-6 px-6">
          <CoffeeFilters
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

        {/* Footer with Apply Button */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-white/20">
          <Button
            type="button"
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] text-white hover:from-[#6E6658] hover:to-[#4B2E2E] py-3 rounded-2xl font-semibold transition-all duration-300"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  )
}
