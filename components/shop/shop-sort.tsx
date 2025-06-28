'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, ArrowUpDown } from 'lucide-react'

interface ShopSortProps {
  sortBy: string
  setSortBy: (sort: string) => void
}

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
]

export default function ShopSort({ sortBy, setSortBy }: ShopSortProps) {
  const currentSort = sortOptions.find(option => option.value === sortBy)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-2 border-[#4B2E2E] text-[#4B2E2E] hover:bg-[#4B2E2E] hover:text-white px-6 py-3 rounded-2xl backdrop-blur-sm bg-white/60 shadow-lg hover:shadow-xl transition-all duration-300 group font-semibold"
        >
          <ArrowUpDown className="w-4 h-4 mr-2" />
          Sort: {currentSort?.label}
          <ChevronDown className="w-4 h-4 ml-2 group-hover:rotate-180 transition-transform duration-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl p-2"
      >
        {sortOptions.map(option => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setSortBy(option.value)}
            className={`rounded-xl p-3 cursor-pointer transition-all duration-300 ${
              sortBy === option.value
                ? 'bg-[#4B2E2E] text-white'
                : 'text-[#6E6658] hover:bg-[#F6F1EB] hover:text-[#4B2E2E]'
            }`}
          >
            <span className="font-medium">{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
