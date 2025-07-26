"use client"

import { useEffect, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Save } from "lucide-react"
import type { Product } from "@/lib/types"
import { addProductAction, updateProductAction } from "@/app/admin/actions"

interface ProductFormProps {
  product?: Product | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      {pending ? (isEditing ? "Saving..." : "Adding...") : isEditing ? "Save Changes" : "Add Product"}
    </Button>
  )
}

export default function ProductForm({ product, isOpen, onOpenChange }: ProductFormProps) {
  const isEditing = !!product
  const action = isEditing ? updateProductAction : addProductAction
  const [state, formAction] = useActionState(action, {})

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false)
    }
  }, [state, onOpenChange])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">
                SKU
              </Label>
              <Input
                id="sku"
                name="sku"
                defaultValue={product?.sku}
                className="col-span-3"
                required
                readOnly={isEditing}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productName" className="text-right">
                Name
              </Label>
              <Input
                id="productName"
                name="productName"
                defaultValue={product?.productName}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={product?.description}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price</Label>
                <Input
                  id="originalPrice"
                  name="originalPrice"
                  type="number"
                  step="0.01"
                  defaultValue={product?.originalPrice}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" defaultValue={product?.category} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={product?.status || "active"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format">Format</Label>
                <Input id="format" name="format" defaultValue={product?.format} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input id="weight" name="weight" defaultValue={product?.weight} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roastLevel">Roast Level</Label>
                <Input id="roastLevel" name="roastLevel" defaultValue={product?.roastLevel} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input id="origin" name="origin" defaultValue={product?.origin} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tastingNotes">Tasting Notes (comma-separated)</Label>
              <Input
                id="tastingNotes"
                name="tastingNotes"
                defaultValue={
                  Array.isArray(product?.tastingNotes) ? product.tastingNotes.join(", ") : product?.tastingNotes
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="badge">Badge</Label>
              <Input id="badge" name="badge" defaultValue={product?.badge} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="featured" name="featured" defaultChecked={product?.featured} />
              <Label htmlFor="featured">Featured Product</Label>
            </div>
          </div>
          {state?.error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-lg mb-4">{state.error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <SubmitButton isEditing={isEditing} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
