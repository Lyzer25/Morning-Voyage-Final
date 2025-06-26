import type { Product } from "@/types/product"
import ProductCard from "./product-card"

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3 | 4
}

export default function ProductGrid({ products, columns = 3 }: ProductGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }

  return (
    <div className={`grid gap-6 ${gridCols[columns]}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
