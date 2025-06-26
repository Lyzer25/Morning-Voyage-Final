import type { Product } from "../types/product"

// Mock product data
const mockProducts: Product[] = [
  {
    id: "prod_1",
    name: "Ethiopian Yirgacheffe",
    slug: "ethiopian-yirgacheffe",
    description:
      "A light roast coffee with bright acidity, floral notes, and a clean finish. Grown in the highlands of Ethiopia, this coffee is known for its complex flavor profile with hints of citrus and berries.",
    price: 18.99,
    compareAtPrice: 21.99,
    images: ["/images/products/ethiopian-yirgacheffe.jpg"],
    category: "coffee",
    tags: ["light roast", "floral", "fruity", "ethiopia"],
    variants: [
      {
        id: "variant_grind",
        name: "Grind",
        options: ["Whole Bean", "Drip", "French Press", "Espresso"],
      },
      {
        id: "variant_size",
        name: "Size",
        options: ["12oz", "1lb", "2lb", "5lb"],
      },
    ],
    featured: true,
    bestSeller: true,
    new: false,
    stock: 100,
    createdAt: "2023-01-15",
    updatedAt: "2023-05-01",
  },
  {
    id: "prod_2",
    name: "Colombian Supremo",
    slug: "colombian-supremo",
    description:
      "A medium roast coffee with a balanced body, caramel sweetness, and nutty undertones. This coffee from the highlands of Colombia offers a smooth drinking experience with minimal bitterness.",
    price: 16.99,
    images: ["/images/products/colombian-supremo.jpg"],
    category: "coffee",
    tags: ["medium roast", "balanced", "caramel", "colombia"],
    variants: [
      {
        id: "variant_grind",
        name: "Grind",
        options: ["Whole Bean", "Drip", "French Press", "Espresso"],
      },
      {
        id: "variant_size",
        name: "Size",
        options: ["12oz", "1lb", "2lb", "5lb"],
      },
    ],
    featured: false,
    bestSeller: true,
    new: false,
    stock: 85,
    createdAt: "2023-01-20",
    updatedAt: "2023-05-01",
  },
  {
    id: "prod_3",
    name: "Sumatra Mandheling",
    slug: "sumatra-mandheling",
    description:
      "A dark roast coffee with a full body, low acidity, and earthy flavors. This Indonesian coffee is known for its rich, complex taste with notes of dark chocolate and a subtle herbal finish.",
    price: 17.99,
    images: ["/images/products/sumatra-mandheling.jpg"],
    category: "coffee",
    tags: ["dark roast", "earthy", "full-bodied", "indonesia"],
    variants: [
      {
        id: "variant_grind",
        name: "Grind",
        options: ["Whole Bean", "Drip", "French Press", "Espresso"],
      },
      {
        id: "variant_size",
        name: "Size",
        options: ["12oz", "1lb", "2lb", "5lb"],
      },
    ],
    featured: true,
    bestSeller: false,
    new: false,
    stock: 70,
    createdAt: "2023-02-01",
    updatedAt: "2023-05-01",
  },
  {
    id: "prod_4",
    name: "Guatemala Antigua",
    slug: "guatemala-antigua",
    description:
      "A medium-dark roast coffee with a smooth body, rich flavor, and chocolate notes. Grown in the Antigua Valley of Guatemala, this coffee offers a perfect balance of sweetness and complexity.",
    price: 19.99,
    images: ["/images/products/guatemala-antigua.jpg"],
    category: "coffee",
    tags: ["medium-dark roast", "chocolate", "smooth", "guatemala"],
    variants: [
      {
        id: "variant_grind",
        name: "Grind",
        options: ["Whole Bean", "Drip", "French Press", "Espresso"],
      },
      {
        id: "variant_size",
        name: "Size",
        options: ["12oz", "1lb", "2lb", "5lb"],
      },
    ],
    featured: false,
    bestSeller: false,
    new: true,
    stock: 50,
    createdAt: "2023-04-15",
    updatedAt: "2023-05-01",
  },
  {
    id: "prod_5",
    name: "Morning Voyage Blend",
    slug: "morning-voyage-blend",
    description:
      "Our signature blend featuring a mix of medium and dark roast beans from Central and South America. Offers a balanced flavor profile with notes of chocolate, caramel, and a hint of citrus.",
    price: 15.99,
    images: ["/images/products/morning-voyage-blend.jpg"],
    category: "coffee",
    tags: ["medium roast", "blend", "balanced", "signature"],
    variants: [
      {
        id: "variant_grind",
        name: "Grind",
        options: ["Whole Bean", "Drip", "French Press", "Espresso"],
      },
      {
        id: "variant_size",
        name: "Size",
        options: ["12oz", "1lb", "2lb", "5lb"],
      },
    ],
    featured: true,
    bestSeller: true,
    new: false,
    stock: 120,
    createdAt: "2023-01-01",
    updatedAt: "2023-05-01",
  },
  {
    id: "prod_6",
    name: "Hario V60 Pour-Over Kit",
    slug: "hario-v60-pour-over-kit",
    description:
      "Everything you need to make the perfect pour-over coffee at home. Kit includes a Hario V60 ceramic dripper, glass server, and 100 filters.",
    price: 39.99,
    images: ["/images/products/hario-v60-kit.jpg"],
    category: "equipment",
    tags: ["pour-over", "dripper", "kit", "hario"],
    featured: true,
    bestSeller: false,
    new: false,
    stock: 30,
    createdAt: "2023-02-15",
    updatedAt: "2023-05-01",
  },
  {
    id: "prod_7",
    name: "Chemex Classic Brewer",
    slug: "chemex-classic-brewer",
    description:
      "The iconic Chemex brewer, known for its elegant design and ability to brew clean, flavorful coffee. Made of high-quality borosilicate glass and comes with a wooden collar and leather tie.",
    price: 45.99,
    images: ["/images/products/chemex-brewer.jpg"],
    category: "equipment",
    tags: ["chemex", "brewer", "pour-over", "glass"],
    featured: false,
    bestSeller: true,
    new: false,
    stock: 25,
    createdAt: "2023-02-20",
    updatedAt: "2023-05-01",
  },
  {
    id: "prod_8",
    name: "Morning Voyage Coffee Mug",
    slug: "morning-voyage-coffee-mug",
    description:
      "Our signature ceramic mug featuring the Morning Voyage logo. Holds 12oz of your favorite coffee and is microwave and dishwasher safe.",
    price: 14.99,
    images: ["/images/products/coffee-mug.jpg"],
    category: "merchandise",
    tags: ["mug", "ceramic", "merchandise"],
    featured: false,
    bestSeller: false,
    new: true,
    stock: 75,
    createdAt: "2023-03-10",
    updatedAt: "2023-05-01",
  },
]

// Cache for products
let productsCache: Product[] | null = null
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getAllProducts(): Promise<Product[]> {
  // Check cache first
  const now = Date.now()
  if (productsCache && now - lastFetchTime < CACHE_DURATION) {
    return productsCache
  }

  try {
    // In a real app, this would fetch from an API or parse CSV
    // For now, we'll just use our mock data

    // Update cache
    productsCache = mockProducts
    lastFetchTime = now

    return mockProducts
  } catch (error) {
    console.error("Error fetching products:", error)
    // Return empty array or cached data if available
    return productsCache || []
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getAllProducts()
  return products.find((product) => product.slug === slug) || null
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getAllProducts()
  return products.filter((product) => product.category === category)
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const products = await getAllProducts()
  return products.filter((product) => product.featured).slice(0, limit)
}

export async function getBestSellerProducts(limit = 4): Promise<Product[]> {
  const products = await getAllProducts()
  return products.filter((product) => product.bestSeller).slice(0, limit)
}

export async function getNewProducts(limit = 4): Promise<Product[]> {
  const products = await getAllProducts()
  return products.filter((product) => product.new).slice(0, limit)
}

export async function searchProducts(query: string): Promise<Product[]> {
  const products = await getAllProducts()
  const lowerQuery = query.toLowerCase()

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  )
}
