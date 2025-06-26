"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X, Coffee, Package, Scale } from "lucide-react"
import type { Product } from "@/lib/product-data"

interface CoffeeFiltersProps {
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

export default function CoffeeFilters({
  selectedCategory,
  setSelectedCategory,
  selectedRoastLevel,
  setSelectedRoastLevel,
  selectedFormat,
  setSelectedFormat,
  priceRange,
  setPriceRange,
  products,
}: CoffeeFiltersProps) {
  // Generate categories from actual product data
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

  // New format filters
  const formats = [
    { id: "all", name: "All Formats", count: products.length },
    { id: "whole-bean", name: "Whole Bean", count: products.filter((p) => p.format === "whole-bean").length },
    { id: "ground", name: "Ground", count: products.filter((p) => p.format === "ground").length },
    { id: "pods", name: "Coffee Pods", count: products.filter((p) => p.format === "pods").length },
  ].filter((format) => format.count > 0)

  // Get unique origins and tasting notes from products
  const origins = [...new Set(products.map((p) => p.origin).filter(Boolean))]
  const allTastingNotes = products.flatMap((p) => p.tastingNotes || [])
  const uniqueTastingNotes = [...new Set(allTastingNotes)].slice(0, 8) // Show top 8

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

  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#6E6658]">Active Filters</span>
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[#9E7C83] hover:text-[#4B2E2E] p-2">
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        </div>
      )}

      {/* Coffee Categories */}
      <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-lg">
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
              variant="ghost"
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full justify-between p-3 rounded-xl transition-all duration-300 ${
                selectedCategory === category.id
                  ? "bg-[#4B2E2E] text-white shadow-lg"
                  : "text-[#6E6658] hover:bg-white/60 hover:text-[#4B2E2E]"
              }`}
            >
              <span className="font-medium">{category.name}</span>
              <Badge
                variant="secondary"
                className={`${
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
      <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-lg">
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
              variant="ghost"
              onClick={() => setSelectedFormat(format.id)}
              className={`w-full justify-between p-3 rounded-xl transition-all duration-300 ${
                selectedFormat === format.id
                  ? "bg-[#4B2E2E] text-white shadow-lg"
                  : "text-[#6E6658] hover:bg-white/60 hover:text-[#4B2E2E]"
              }`}
            >
              <span className="font-medium">{format.name}</span>
              <Badge
                variant="secondary"
                className={`${selectedFormat === format.id ? "bg-white/20 text-white" : "bg-[#F6F1EB] text-[#6E6658]"}`}
              >
                {format.count}
              </Badge>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Roast Levels */}
      <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-lg">
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
              variant="ghost"
              onClick={() => setSelectedRoastLevel(roast.id)}
              className={`w-full justify-between p-3 rounded-xl transition-all duration-300 ${
                selectedRoastLevel === roast.id
                  ? "bg-[#4B2E2E] text-white shadow-lg"
                  : "text-[#6E6658] hover:bg-white/60 hover:text-[#4B2E2E]"
              }`}
            >
              <span className="font-medium">{roast.name}</span>
              <Badge
                variant="secondary"
                className={`${
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
      <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-[#4B2E2E]">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="px-2">
            <Slider value={priceRange} onValueChange={setPriceRange} max={50} step={2} className="w-full" />
          </div>
          <div className="flex items-center justify-between text-sm font-medium text-[#6E6658]">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}+</span>
          </div>
        </CardContent>
      </Card>

      {/* Origins */}
      {origins.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-[#4B2E2E]">Origins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {origins.map((origin) => (
                <Badge
                  key={origin}
                  variant="outline"
                  className="cursor-pointer border-[#D5BFA3] text-[#6E6658] hover:bg-[#D5BFA3] hover:text-white transition-colors duration-300"
                >
                  {origin}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasting Notes */}
      {uniqueTastingNotes.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-[#4B2E2E]">Tasting Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {uniqueTastingNotes.map((note) => (
                <Badge
                  key={note}
                  variant="outline"
                  className="cursor-pointer border-[#D5BFA3] text-[#6E6658] hover:bg-[#D5BFA3] hover:text-white transition-colors duration-300"
                >
                  {note}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
