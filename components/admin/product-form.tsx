"use client"

import { useEffect, useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Save, Upload, X, Image as ImageIcon } from "lucide-react"
import type { Product, ProductImage } from "@/lib/types"
import { addProductAction, updateProductAction } from "@/app/admin/actions"
import { validateImageFiles } from "@/lib/blob-storage"

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

  // Image upload state
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [imageErrors, setImageErrors] = useState<string[]>([])

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false)
    }
  }, [state, onOpenChange])

  const handleImageUpload = (files: File[], type: 'thumbnail' | 'main' | 'gallery') => {
    const validation = validateImageFiles(files)
    if (!validation.valid) {
      setImageErrors(validation.errors)
      return
    }
    
    setImageErrors([])
    
    if (type === 'thumbnail' && files[0]) {
      setThumbnailFile(files[0])
    } else if (type === 'main' && files[0]) {
      setMainImageFile(files[0])
    } else if (type === 'gallery') {
      setGalleryFiles(files)
    }
  }

  const removeImage = (type: 'thumbnail' | 'main' | 'gallery', index?: number) => {
    if (type === 'thumbnail') {
      setThumbnailFile(null)
    } else if (type === 'main') {
      setMainImageFile(null)
    } else if (type === 'gallery' && typeof index === 'number') {
      setGalleryFiles(files => files.filter((_, i) => i !== index))
    }
  }

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
                <Label htmlFor="price">Current Price</Label>
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
                <Select name="category" defaultValue={product?.category || "coffee"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coffee">Coffee</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="gift-set">Gift Set</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select name="format" defaultValue={product?.format || "whole-bean"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whole-bean">Whole Bean</SelectItem>
                    <SelectItem value="ground">Ground</SelectItem>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="pods">Pods</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input id="weight" name="weight" defaultValue={product?.weight} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roastLevel">Roast Level</Label>
                <Select name="roastLevel" defaultValue={product?.roastLevel || "medium"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select roast level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="medium-dark">Medium-Dark</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
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

            {/* Image Upload Section */}
            <div className="border-t pt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload images for your product. Recommended: square images (1:1 ratio) for best display.
                </p>
              </div>

              {/* Image Errors */}
              {imageErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-sm text-red-700">
                    <p className="font-medium mb-1">Image upload errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {imageErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Thumbnail Image */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Thumbnail Image (for product grid)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {thumbnailFile ? (
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={URL.createObjectURL(thumbnailFile)} 
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{thumbnailFile.name}</p>
                        <p className="text-xs text-gray-500">{(thumbnailFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage('thumbnail')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="thumbnail" className="cursor-pointer">
                          <span className="text-sm text-blue-600 hover:text-blue-500">Upload thumbnail</span>
                          <input
                            id="thumbnail"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files && handleImageUpload([e.target.files[0]], 'thumbnail')}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Image */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Main Image (for product detail page)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {mainImageFile ? (
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={URL.createObjectURL(mainImageFile)} 
                          alt="Main image preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{mainImageFile.name}</p>
                        <p className="text-xs text-gray-500">{(mainImageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage('main')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="mainImage" className="cursor-pointer">
                          <span className="text-sm text-blue-600 hover:text-blue-500">Upload main image</span>
                          <input
                            id="mainImage"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files && handleImageUpload([e.target.files[0]], 'main')}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Images */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Gallery Images (additional product images)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {galleryFiles.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        {galleryFiles.map((file, index) => (
                          <div key={index} className="relative">
                            <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt={`Gallery image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImage('gallery', index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white hover:bg-red-600 rounded-full p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                            <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                          </div>
                        ))}
                      </div>
                      <div className="text-center">
                        <label htmlFor="galleryImages" className="cursor-pointer">
                          <span className="text-sm text-blue-600 hover:text-blue-500">Add more images</span>
                          <input
                            id="galleryImages"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => e.target.files && handleImageUpload(Array.from(e.target.files), 'gallery')}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="galleryImages" className="cursor-pointer">
                          <span className="text-sm text-blue-600 hover:text-blue-500">Upload gallery images</span>
                          <input
                            id="galleryImages"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => e.target.files && handleImageUpload(Array.from(e.target.files), 'gallery')}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Select multiple files (max 10 total images)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Product Images (when editing) */}
              {isEditing && product?.images && product.images.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Current Images</Label>
                  <div className="grid grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
                    {product.images.map((image, index) => (
                      <div key={image.id} className="space-y-2">
                        <div className="w-full h-20 bg-white rounded-lg flex items-center justify-center overflow-hidden border">
                          <img 
                            src={image.url} 
                            alt={image.alt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-center">
                          <span className="text-xs font-medium text-gray-700 capitalize">{image.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Note: Upload new images above to replace current images. Current images will be updated when you save.
                  </p>
                </div>
              )}
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
