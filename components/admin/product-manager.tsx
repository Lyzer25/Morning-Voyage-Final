"use client"

import { useState, useTransition, useActionState } from "react"
import { useRouter } from "next/navigation"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import {
  PlusCircle,
  Upload,
  MoreHorizontal,
  Trash2,
  Pencil,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Download,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { uploadCsvAction, exportCsvAction, deleteProductAction, toggleFeaturedAction } from "@/app/admin/actions"
import type { Product } from "@/lib/types"
import ProductForm from "./product-form"

function UploadButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
      {pending ? "Uploading..." : "Upload & Update"}
    </Button>
  )
}

export default function ProductManager({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [uploadState, formAction] = useActionState(uploadCsvAction, {})
  const [isPending, startTransition] = useTransition()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingSku, setDeletingSku] = useState<string | null>(null)

  const filteredProducts = products.filter(
    (p) =>
      p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleExport = async () => {
    const { csv, error } = await exportCsvAction()
    if (error) {
      alert(`Export failed: ${error}`)
      return
    }
    if (csv) {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "products.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDelete = async () => {
    if (!deletingSku) return
    startTransition(async () => {
      const result = await deleteProductAction(deletingSku)
      if (result.error) {
        alert(`Deletion failed: ${result.error}`)
      } else {
        setProducts(products.filter((p) => p.sku !== deletingSku))
        router.refresh()
      }
      setDeletingSku(null)
    })
  }

  const handleToggleFeatured = (sku: string, isFeatured: boolean) => {
    startTransition(async () => {
      const result = await toggleFeaturedAction(sku, isFeatured)
      if (result.error) {
        alert(`Failed to update featured status: ${result.error}`)
      } else {
        setProducts(products.map((p) => (p.sku === sku ? { ...p, featured: isFeatured } : p)))
        // No full router.refresh() to keep the UI state, revalidation will handle data
      }
    })
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <Input
          placeholder="Search by name, SKU, category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex w-full flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
          <form action={formAction} className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <Input
              id="csvFile"
              name="csvFile"
              type="file"
              accept=".csv"
              className="w-full file:mr-2 file:rounded-md file:border-0 file:bg-stone-200 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-stone-700 hover:file:bg-stone-300"
              required
            />
            <UploadButton />
          </form>
          <Button onClick={handleExport} variant="outline" className="w-full sm:w-auto bg-transparent">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {uploadState?.error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {uploadState.error}
        </div>
      )}
      {uploadState?.success && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4" /> {uploadState.success}
        </div>
      )}

      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.sku}>
                <TableCell>
                  <Badge
                    variant={product.status === "active" ? "default" : "secondary"}
                    className={
                      product.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{product.productName}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell>
                  <Switch
                    checked={product.featured}
                    onCheckedChange={(checked) => handleToggleFeatured(product.sku, checked)}
                    disabled={isPending}
                    aria-label="Toggle featured"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeletingSku(product.sku)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredProducts.length === 0 && <div className="text-center py-12 text-gray-500">No products found.</div>}

      <ProductForm
        product={editingProduct}
        isOpen={!!editingProduct || isAddModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingProduct(null)
            setIsAddModalOpen(false)
            router.refresh()
          }
        }}
      />

      <AlertDialog open={!!deletingSku} onOpenChange={(isOpen) => !isOpen && setDeletingSku(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product with SKU:{" "}
              <strong>{deletingSku}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-red-600 hover:bg-red-700">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
