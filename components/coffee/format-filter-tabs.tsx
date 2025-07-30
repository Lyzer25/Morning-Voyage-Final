"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import type { GroupedProduct } from "@/lib/product-variants"

interface FormatFilterTabsProps {
  products: GroupedProduct[]
  selectedFormat: string
  onFormatChange: (format: string) => void
}

export default function FormatFilterTabs({ products, selectedFormat, onFormatChange }: FormatFilterTabsProps) {
  const formats = useMemo(() => {
    const allFormats = products.flatMap((p) => p.availableFormats || []).filter(Boolean)
    return ["all", ...Array.from(new Set(allFormats as string[]))]
  }, [products])

  if (formats.length <= 2) return null

  return (
    <div className="flex justify-center items-center flex-wrap gap-3">
      {formats.map((format) => (
        <Button
          key={format}
          variant={selectedFormat === format ? "default" : "outline"}
          onClick={() => onFormatChange(format)}
          className={`capitalize rounded-full px-6 py-2 transition-all duration-300 ${
            selectedFormat === format
              ? "bg-[#4B2E2E] text-white border-[#4B2E2E]"
              : "bg-transparent text-[#6E6658] border-stone-300 hover:bg-stone-100 hover:border-stone-400"
          }`}
        >
          {format}
        </Button>
      ))}
    </div>
  )
}
