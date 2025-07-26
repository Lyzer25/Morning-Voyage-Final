"use server"

import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"
import Papa from "papaparse"
import { getProducts, updateProducts, addProduct, updateProduct, deleteProduct } from "@/lib/csv-data"
import type { Product } from "@/lib/types"
import { transformHeader } from "@/lib/csv-helpers"

const BLOB_FILENAME = "products.csv"

interface FormState {
  error?: string
  success?: string
}

export async function uploadCsvAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const file = formData.get("csvFile") as File

  if (!file || file.size === 0) {
    return { error: "Please select a CSV file to upload." }
  }
  if (file.type !== "text/csv") {
    return { error: "Invalid file type. Please upload a CSV file." }
  }

  try {
    const csvText = await file.text()
    const parsed = Papa.parse<Product>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: transformHeader,
    })

    if (parsed.errors.length > 0) {
      return { error: `CSV parsing error on row ${parsed.errors[0].row}: ${parsed.errors[0].message}` }
    }

    if (!parsed.meta.fields?.includes("sku") || !parsed.meta.fields?.includes("productName")) {
      return { error: "CSV must contain 'sku' and 'productName' columns." }
    }

    const processedData = parsed.data.map((p) => ({
      ...p,
      status: p.status || "active",
      price: typeof p.price === "number" ? p.price : 0,
      featured: p.featured === true || p.featured === "true" || p.featured === "TRUE",
    }))

    const standardizedCsvText = Papa.unparse(processedData, { header: true })

    await put(BLOB_FILENAME, standardizedCsvText, { access: "public", contentType: "text/csv" })

    revalidatePath("/admin", "layout")
    revalidatePath("/", "layout")
    revalidatePath("/coffee", "layout")
    return { success: `Successfully uploaded and updated ${processedData.length} products!` }
  } catch (error) {
    console.error("Error in uploadCsvAction:", error)
    return { error: "An unexpected error occurred during upload." }
  }
}

export async function exportCsvAction(): Promise<{ error?: string; csv?: string }> {
  try {
    const products = await getProducts()
    if (products.length === 0) {
      return { error: "No products to export." }
    }
    const csv = Papa.unparse(products)
    return { csv }
  } catch (error) {
    console.error("Error exporting CSV:", error)
    return { error: "Failed to export products." }
  }
}

function formDataToProduct(formData: FormData): Product {
  const price = Number(formData.get("price"))
  const originalPrice = formData.get("originalPrice") ? Number(formData.get("originalPrice")) : undefined

  return {
    sku: formData.get("sku") as string,
    productName: formData.get("productName") as string,
    category: formData.get("category") as string,
    status: formData.get("status") as "active" | "draft" | "archived",
    format: formData.get("format") as string,
    price: isNaN(price) ? 0 : price,
    originalPrice: originalPrice && !isNaN(originalPrice) ? originalPrice : undefined,
    description: formData.get("description") as string,
    weight: formData.get("weight") as string,
    roastLevel: formData.get("roastLevel") as string,
    origin: formData.get("origin") as string,
    tastingNotes: formData.get("tastingNotes") as string,
    featured: formData.get("featured") === "on",
    badge: formData.get("badge") as string,
  }
}

export async function addProductAction(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const newProduct = formDataToProduct(formData)
    const products = await getProducts()
    if (products.some((p) => p.sku === newProduct.sku)) {
      return { error: `Product with SKU '${newProduct.sku}' already exists.` }
    }
    await addProduct(newProduct)
    revalidatePath("/admin", "layout")
    return { success: `Product '${newProduct.productName}' added successfully.` }
  } catch (error) {
    console.error("Error adding product:", error)
    return { error: "Failed to add product." }
  }
}

export async function updateProductAction(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const updatedProduct = formDataToProduct(formData)
    await updateProduct(updatedProduct)
    revalidatePath("/admin", "layout")
    return { success: `Product '${updatedProduct.productName}' updated successfully.` }
  } catch (error) {
    console.error("Error updating product:", error)
    return { error: "Failed to update product." }
  }
}

export async function deleteProductAction(sku: string): Promise<FormState> {
  try {
    await deleteProduct(sku)
    revalidatePath("/admin", "layout")
    return { success: `Product with SKU '${sku}' deleted successfully.` }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { error: "Failed to delete product." }
  }
}

export async function toggleFeaturedAction(sku: string, isFeatured: boolean): Promise<FormState> {
  try {
    const products = await getProducts()
    const productIndex = products.findIndex((p) => p.sku === sku)

    if (productIndex === -1) {
      return { error: "Product not found." }
    }

    products[productIndex].featured = isFeatured
    await updateProducts(products)

    revalidatePath("/admin", "layout")
    revalidatePath("/", "layout")
    return { success: `Product feature status updated for SKU: ${sku}.` }
  } catch (error) {
    console.error("Error toggling featured status:", error)
    return { error: "Failed to update product feature status." }
  }
}
