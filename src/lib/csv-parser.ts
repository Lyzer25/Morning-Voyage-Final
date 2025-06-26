import type { Product, ProductVariant } from "@/types/product"

// Parse CSV data into Product objects
export async function parseProductsCSV(csvData: string): Promise<Product[]> {
  const lines = csvData.split("\n")
  const headers = lines[0].split(",")

  const products: Product[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const values = parseCSVLine(lines[i])
    const product: Product = {
      id: values[headers.indexOf("id")],
      name: values[headers.indexOf("name")],
      slug: values[headers.indexOf("slug")],
      description: values[headers.indexOf("description")],
      price: Number.parseFloat(values[headers.indexOf("price")]),
      images: values[headers.indexOf("images")].split(";"),
      category: values[headers.indexOf("category")],
      tags: values[headers.indexOf("tags")].split(";"),
      stock: Number.parseInt(values[headers.indexOf("stock")]),
      createdAt: values[headers.indexOf("createdAt")],
      updatedAt: values[headers.indexOf("updatedAt")],
    }

    // Optional fields
    const compareAtPriceIndex = headers.indexOf("compareAtPrice")
    if (compareAtPriceIndex !== -1 && values[compareAtPriceIndex]) {
      product.compareAtPrice = Number.parseFloat(values[compareAtPriceIndex])
    }

    const featuredIndex = headers.indexOf("featured")
    if (featuredIndex !== -1) {
      product.featured = values[featuredIndex] === "true"
    }

    const bestSellerIndex = headers.indexOf("bestSeller")
    if (bestSellerIndex !== -1) {
      product.bestSeller = values[bestSellerIndex] === "true"
    }

    const newIndex = headers.indexOf("new")
    if (newIndex !== -1) {
      product.new = values[newIndex] === "true"
    }

    // Parse variants if they exist
    const variantsIndex = headers.indexOf("variants")
    if (variantsIndex !== -1 && values[variantsIndex]) {
      product.variants = parseVariants(values[variantsIndex])
    }

    products.push(product)
  }

  return products
}

// Helper function to parse a CSV line, handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

// Parse variants from a serialized string
function parseVariants(variantsStr: string): ProductVariant[] {
  try {
    // Format: "name:option1,option2;name2:option1,option2"
    return variantsStr.split(";").map((variantStr) => {
      const [name, optionsStr] = variantStr.split(":")
      return {
        id: `variant_${name.toLowerCase().replace(/\s+/g, "_")}`,
        name,
        options: optionsStr.split(","),
      }
    })
  } catch (error) {
    console.error("Error parsing variants:", error)
    return []
  }
}
