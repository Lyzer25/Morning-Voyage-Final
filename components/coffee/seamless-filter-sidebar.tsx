"use client"

import { useEffect, useRef } from "react"
import { X, Coffee, Package, Scale, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/product-data"

interface SeamlessFilterSidebarProps {
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

export default function SeamlessFilterSidebar({
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
}: SeamlessFilterSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Generate filter options from products (instant, no API calls)
  const categories = [
    { id: "all", name: "All Coffee", count: products.length },
    {
      id: "signature-blend",
      name: "Signature Blends",
      count: products.filter((p) => p.subcategory === "signature-blend").length,
    },
    { id: "dark-roast", name: "Dark Roast", count: products.filter((p) => p.subcategory === "dark-roast").length },
    { id: "light-roast", name: "Light Roast", count: products.filter((p) => p.subcategory === "light-roast").length },
    { id: "decaf", name: "Decaf", count: products.filter((p) => p.subcategory === "decaf").length },
  ].filter((cat) => cat.count > 0)

  const roastLevels = [
    { id: "all", name: "All Roasts", count: products.length },
    { id: "light", name: "Light Roast", count: products.filter((p) => p.roastLevel === "light").length },
    { id: "medium", name: "Medium Roast", count: products.filter((p) => p.roastLevel === "medium").length },
    { id: "dark", name: "Dark Roast", count: products.filter((p) => p.roastLevel === "dark").length },
  ].filter((roast) => roast.count > 0)

  const formats = [
    { id: "all", name: "All Formats", count: products.length },
    { id: "whole-bean", name: "Whole Bean", count: products.filter((p) => p.format === "whole-bean").length },
    { id: "ground", name: "Ground", count: products.filter((p) => p.format === "ground").length },
    { id: "pods", name: "Coffee Pods", count: products.filter((p) => p.format === "pods").length },
  ].filter((format) => format.count > 0)

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory("all")
    setSelectedRoastLevel("all")
    setSelectedFormat("all")
    setPriceRange([0, 50])
  }

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedRoastLevel !== "all" ||
    selectedFormat !== "all" ||
    priceRange[0] > 0 ||
    priceRange[1] < 50

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent body scroll
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7] shadow-2xl z-50 transform transition-all duration-500 ease-out ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/30 bg-white/40 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-[#4B2E2E]">Filter Coffee</h2>
            <p className="text-sm text-[#6E6658]">Refine your search</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[#6E6658] hover:text-[#4B2E2E] hover:bg-white/50 rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="h-full overflow-y-auto pb-24 pt-6 px-6 space-y-6">
          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white/30">
              <span className="text-sm font-medium text-[#6E6658]">Active Filters</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-[#9E7C83] hover:text-[#4B2E2E] hover:bg-white/50 rounded-xl"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
          )}

          {/* Coffee Categories */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-[#4B2E2E] flex items-center">
                <Coffee className="w-5 h-5 mr-2" />
                Coffee Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full justify-between p-3 rounded-xl transition-all duration-200 ${
                    selectedCategory === category.id
                      ? "bg-[#4B2E2E] text-white shadow-lg scale-[1.02]"
                      : "text-[#6E6658] hover:bg-white/60 hover:text-[#4B2E2E] hover:scale-[1.01]"
                  }`}
                >
                  <span className="font-medium">{category.name}</span>
                  <Badge
                    variant="secondary"
                    className={`transition-all duration-200 ${
                      selectedCategory === category.id ? "bg-white/20 text-white" : "bg-[#F6F1EB] text-[#6E6658]"
                    }`}
                  >
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Format Filter */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-[#4B2E2E] flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {formats.map((format) => (
                <Button
                  key={format.id}
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedFormat(format.id)}
                  className={`w-full justify-between p-3 rounded-xl transition-all duration-200 ${
                    selectedFormat === format.id
                      ? "bg-[#4B2E2E] text-white shadow-lg scale-[1.02]"
                      : "text-[#6E6658] hover:bg-white/60 hover:text-[#4B2E2E] hover:scale-[1.01]"
                  }`}
                >
                  <span className="font-medium">{format.name}</span>
                  <Badge
                    variant="secondary"
                    className={`transition-all duration-200 ${
                      selectedFormat === format.id ? "bg-white/20 text-white" : "bg-[#F6F1EB] text-[#6E6658]"
                    }`}
                  >
                    {format.count}
                  </Badge>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Roast Levels */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-[#4B2E2E] flex items-center">
                <Scale className="w-5 h-5 mr-2" />
                Roast Level
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {roastLevels.map((roast) => (
                <Button
                  key={roast.id}
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedRoastLevel(roast.id)}
                  className={`w-full justify-between p-3 rounded-xl transition-all duration-200 ${
                    selectedRoastLevel === roast.id
                      ? "bg-[#4B2E2E] text-white shadow-lg scale-[1.02]"
                      : "text-[#6E6658] hover:bg-white/60 hover:text-[#4B2E2E] hover:scale-[1.01]"
                  }`}
                >
                  <span className="font-medium">{roast.name}</span>
                  <Badge
                    variant="secondary"
                    className={`transition-all duration-200 ${
                      selectedRoastLevel === roast.id ? "bg-white/20 text-white" : "bg-[#F6F1EB] text-[#6E6658]"
                    }`}
                  >
                    {roast.count}
                  </Badge>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Price Range */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-[#4B2E2E] flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Price Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="px-2">
                <Slider value={priceRange} onValueChange={setPriceRange} max={50} step={2} className="w-full" />
              </div>
              <div className="flex items-center justify-between text-sm font-medium text-[#6E6658]">
                <span className="bg-white/50 px-3 py-1 rounded-full">${priceRange[0]}</span>
                <span className="text-xs">to</span>
                <span className="bg-white/50 px-3 py-1 rounded-full">${priceRange[1]}+</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-white/30">
          <Button
            type="button"
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] text-white hover:from-[#6E6658] hover:to-[#4B2E2E] py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  )
}
