'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import ShopHero from '@/components/shop/shop-hero'
import ProductGrid from '@/components/shop/product-grid'
import ShopFilters from '@/components/shop/shop-filters'
import ShopSort from '@/components/shop/shop-sort'
import { Button } from '@/components/ui/button'
import { Filter, Grid3X3, List, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

// Mock product data - in real app this would come from your CSV/API
const products = [
  {
    id: 1,
    name: 'Morning Blend',
    category: 'coffee',
    subcategory: 'light-roast',
    price: 24.99,
    originalPrice: 29.99,
    rating: 4.9,
    reviews: 234,
    badge: 'Bestseller',
    description: 'A smooth, balanced blend perfect for starting your day',
    image: '/placeholder.svg?height=400&width=400',
    inStock: true,
    featured: true,
    roastLevel: 'Light',
    origin: 'Colombia',
    processingMethod: 'Washed',
    tastingNotes: ['Chocolate', 'Caramel', 'Orange'],
  },
  {
    id: 2,
    name: 'Dark Roast Supreme',
    category: 'coffee',
    subcategory: 'dark-roast',
    price: 26.99,
    originalPrice: 31.99,
    rating: 4.8,
    reviews: 189,
    badge: 'Premium',
    description: 'Bold and intense flavor for the serious coffee lover',
    image: '/placeholder.svg?height=400&width=400',
    inStock: true,
    featured: true,
    roastLevel: 'Dark',
    origin: 'Guatemala',
    processingMethod: 'Natural',
    tastingNotes: ['Dark Chocolate', 'Smoky', 'Nutty'],
  },
  {
    id: 3,
    name: 'Ethiopian Single Origin',
    category: 'coffee',
    subcategory: 'single-origin',
    price: 32.99,
    originalPrice: 37.99,
    rating: 4.9,
    reviews: 156,
    badge: 'Limited',
    description: 'Bright and fruity notes from the birthplace of coffee',
    image: '/placeholder.svg?height=400&width=400',
    inStock: true,
    featured: false,
    roastLevel: 'Medium',
    origin: 'Ethiopia',
    processingMethod: 'Natural',
    tastingNotes: ['Blueberry', 'Floral', 'Wine'],
  },
  {
    id: 4,
    name: 'Voyage Hoodie',
    category: 'fashion',
    subcategory: 'hoodies',
    price: 49.99,
    originalPrice: 69.99,
    rating: 4.7,
    reviews: 298,
    badge: 'Limited',
    description: 'Premium cotton hoodie with embroidered logo',
    image: '/placeholder.svg?height=400&width=400',
    inStock: true,
    featured: true,
    size: ['S', 'M', 'L', 'XL'],
    color: ['Black', 'Brown', 'Cream'],
    material: '100% Organic Cotton',
  },
  {
    id: 5,
    name: 'Coffee Tote Bag',
    category: 'fashion',
    subcategory: 'accessories',
    price: 19.99,
    originalPrice: 24.99,
    rating: 4.9,
    reviews: 445,
    badge: 'Eco-Friendly',
    description: 'Sustainable canvas tote for the eco-conscious coffee lover',
    image: '/placeholder.svg?height=400&width=400',
    inStock: true,
    featured: false,
    material: 'Organic Canvas',
    dimensions: '15" x 16" x 6"',
  },
  {
    id: 6,
    name: 'French Press',
    category: 'equipment',
    subcategory: 'brewing',
    price: 39.99,
    originalPrice: 49.99,
    rating: 4.6,
    reviews: 123,
    badge: 'New',
    description: 'Professional-grade French press for the perfect brew',
    image: '/placeholder.svg?height=400&width=400',
    inStock: true,
    featured: false,
    capacity: '34oz',
    material: 'Borosilicate Glass',
  },
]

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 100])
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesSubcategory =
        selectedSubcategory === 'all' || product.subcategory === selectedSubcategory
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

      return matchesSearch && matchesCategory && matchesSubcategory && matchesPrice
    })

    // Sort products
    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price)
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price)
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating)
      case 'newest':
        return filtered.sort((a, b) => b.id - a.id)
      case 'featured':
      default:
        return filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }
  }, [searchQuery, selectedCategory, selectedSubcategory, priceRange, sortBy])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
      <Header />

      <main className="relative overflow-hidden pt-24">
        <ShopHero />

        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search and Controls */}
            <div className="mb-12">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6E6658]" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg text-[#4B2E2E] placeholder:text-[#6E6658] font-medium"
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  {/* Filter Toggle */}
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`border-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                      showFilters
                        ? 'border-[#4B2E2E] bg-[#4B2E2E] text-white'
                        : 'border-[#4B2E2E] text-[#4B2E2E] hover:bg-[#4B2E2E] hover:text-white bg-white/60 backdrop-blur-sm'
                    }`}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>

                  {/* View Mode */}
                  <div className="flex bg-white/60 backdrop-blur-sm rounded-2xl p-1 border border-white/20">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={`rounded-xl transition-all duration-300 ${
                        viewMode === 'grid'
                          ? 'bg-[#4B2E2E] text-white shadow-lg'
                          : 'text-[#6E6658] hover:text-[#4B2E2E]'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={`rounded-xl transition-all duration-300 ${
                        viewMode === 'list'
                          ? 'bg-[#4B2E2E] text-white shadow-lg'
                          : 'text-[#6E6658] hover:text-[#4B2E2E]'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Sort */}
                  <ShopSort sortBy={sortBy} setSortBy={setSortBy} />
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-6 text-[#6E6658] font-medium">
                Showing {filteredProducts.length} of {products.length} products
                {searchQuery && (
                  <span className="ml-2">
                    for "<span className="text-[#4B2E2E] font-semibold">{searchQuery}</span>"
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-8">
              {/* Filters Sidebar */}
              <div
                className={`transition-all duration-500 ${showFilters ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}
              >
                <ShopFilters
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  setSelectedSubcategory={setSelectedSubcategory}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                />
              </div>

              {/* Product Grid */}
              <div className="flex-1">
                <ProductGrid products={filteredProducts} viewMode={viewMode} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
