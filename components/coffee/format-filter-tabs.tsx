"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coffee, Package, Zap } from "lucide-react"
import type { GroupedProduct } from "@/lib/product-variants"
import { getFormatDisplayName } from "@/lib/product-variants"

interface FormatFilterTabsProps {
  products: GroupedProduct[]
  selectedFormat: string
  onFormatChange: (format: string) => void
}

const formatIcons = {
  "whole-bean": Coffee,
  ground: Package,
  pods: Zap,
  instant: Zap,
}

export default function FormatFilterTabs({ products, selectedFormat, onFormatChange }: FormatFilterTabsProps) {
  // Get all available formats from products
  const allFormats = new Set<string>()
  products.forEach((product) => {
    product.availableFormats.forEach((format) => {
      allFormats.add(format)
    })
  })

  const availableFormats = Array.from(allFormats).sort()

  // Count products for each format
  const getFormatCount = (format: string) => {
    if (format === "all") return products.length
    return products.filter((product) => product.availableFormats.includes(format)).length
  }

  const formatOptions = [
    { id: "all", name: "All Formats", count: getFormatCount("all") },
    ...availableFormats.map((format) => ({
      id: format,
      name: getFormatDisplayName(format),
      count: getFormatCount(format),
    })),
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#4B2E2E]">Filter by Format</h3>
        <span className="text-sm text-[#6E6658]">
          {getFormatCount(selectedFormat)} products{" "}
          {selectedFormat !== "all" && `in ${getFormatDisplayName(selectedFormat)}`}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {formatOptions.map((option) => {
          const isSelected = selectedFormat === option.id
          const Icon = formatIcons[option.id as keyof typeof formatIcons] || Package

          return (
            <Button
              key={option.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => onFormatChange(option.id)}
              className={`h-auto p-4 rounded-2xl transition-all duration-300 ${
                isSelected
                  ? "bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] text-white shadow-lg ring-2 ring-[#D5BFA3] ring-opacity-50"
                  : "border-2 border-[#D5BFA3] text-[#6E6658] hover:bg-[#F6F1EB] hover:border-[#4B2E2E] bg-white/60 backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? "bg-white/20" : "bg-[#F6F1EB]"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-[#6E6658]"}`} />
                </div>
                <div className="text-left">
                  <div className="font-semibold">{option.name}</div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${isSelected ? "bg-white/20 text-white" : "bg-[#E7CFC7] text-[#6E6658]"}`}
                    >
                      {option.count} products
                    </Badge>
                  </div>
                </div>
              </div>
            </Button>
          )
        })}
      </div>

      {/* Format Descriptions */}
      {selectedFormat !== "all" && (
        <div className="mt-4 p-4 bg-gradient-to-r from-[#F6F1EB] to-[#E7CFC7] rounded-2xl">
          <div className="flex items-center gap-3">
            {(() => {
              const Icon = formatIcons[selectedFormat as keyof typeof formatIcons] || Package
              return <Icon className="w-5 h-5 text-[#6E6658]" />
            })()}
            <div>
              <h4 className="font-semibold text-[#4B2E2E]">{getFormatDisplayName(selectedFormat)}</h4>
              <p className="text-sm text-[#6E6658]">
                {selectedFormat === "whole-bean" && "Grind fresh at home for maximum flavor and aroma"}
                {selectedFormat === "ground" && "Ready to brew - perfect for drip coffee makers and pour-over"}
                {selectedFormat === "pods" && "Compatible with single-serve coffee machines"}
                {selectedFormat === "instant" && "Just add hot water for quick, convenient coffee"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
