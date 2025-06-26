"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface ShopFiltersProps {
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedSubcategory: string
  setSelectedSubcategory: (subcategory: string) => void
  priceRange: number[]
  setPriceRange: (range: number[]) => void
}

const categories = [
  { id: "all", name: "All Products", count: 26 },
  { id: "coffee", name: "Coffee", count: 12 },
  { id: "fashion", name: "Fashion", count: 8 },
  { id: "equipment", name: "Equipment", count: 6 },
]

const subcategories = {
  coffee: [
    { id: "light-roast", name: "Light Roast", count: 4 },
    { id: "medium-roast", name: "Medium Roast", count: 3 },
    { id: "dark-roast", name: "Dark Roast", count: 3 },
    { id: "single-origin", name: "Single Origin", count: 2 },
  ],
  fashion: [
    { id: "hoodies", name: "Hoodies", count: 3 },
    { id: "t-shirts", name: "T-Shirts", count: 2 },
    { id: "accessories", name: "Accessories", count: 3 },
  ],
  equipment: [
    { id: "brewing", name: "Brewing", count: 4 },
    { id: "grinders", name: "Grinders", count: 2 },
  ],
}

export default function ShopFilters({
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  priceRange,
  setPriceRange,
}: ShopFiltersProps) {
  const clearFilters = () => {
    setSelectedCategory("all")
    setSelectedSubcategory("all")
    setPriceRange([0, 100])
  }

  const hasActiveFilters =
    selectedCategory !== "all" || selectedSubcategory !== "all" || priceRange[0] > 0 || priceRange[1] < 100

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

      {/* Categories */}
      <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-[#4B2E2E]">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              onClick={() => {
                setSelectedCategory(category.id)
                setSelectedSubcategory("all")
              }}
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

      {/* Subcategories */}
      {selectedCategory !== "all" && subcategories[selectedCategory as keyof typeof subcategories] && (
        <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-[#4B2E2E]">
              {categories.find((c) => c.id === selectedCategory)?.name} Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => setSelectedSubcategory("all")}
              className={`w-full justify-start p-3 rounded-xl transition-all duration-300 ${
                selectedSubcategory === "all"
                  ? "bg-[#4B2E2E] text-white shadow-lg"
                  : "text-[#6E6658] hover:bg-white/60 hover:text-[#4B2E2E]"
              }`}
            >
              <span className="font-medium">All Types</span>
            </Button>
            {subcategories[selectedCategory as keyof typeof subcategories]?.map((sub) => (
              <Button
                key={sub.id}
                variant="ghost"
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`w-full justify-between p-3 rounded-xl transition-all duration-300 ${
                  selectedSubcategory === sub.id
                    ? "bg-[#4B2E2E] text-white shadow-lg"
                    : "text-[#6E6658] hover:bg-white/60 hover:text-[#4B2E2E]"
                }`}
              >
                <span className="font-medium">{sub.name}</span>
                <Badge
                  variant="secondary"
                  className={`${
                    selectedSubcategory === sub.id ? "bg-white/20 text-white" : "bg-[#F6F1EB] text-[#6E6658]"
                  }`}
                >
                  {sub.count}
                </Badge>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Price Range */}
      <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-[#4B2E2E]">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="px-2">
            <Slider value={priceRange} onValueChange={setPriceRange} max={100} step={5} className="w-full" />
          </div>
          <div className="flex items-center justify-between text-sm font-medium text-[#6E6658]">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}+</span>
          </div>
        </CardContent>
      </Card>

      {/* Popular Filters */}
      <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-[#4B2E2E]">Popular Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["Bestseller", "New Arrivals", "On Sale", "Premium", "Eco-Friendly"].map((filter) => (
              <Badge
                key={filter}
                variant="outline"
                className="cursor-pointer border-[#D5BFA3] text-[#6E6658] hover:bg-[#D5BFA3] hover:text-white transition-colors duration-300"
              >
                {filter}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
