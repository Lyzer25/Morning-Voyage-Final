"use client"

import { useState, useTransition, useActionState, useEffect } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
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
import { uploadCsvAction, exportCsvAction, deleteProductAction, toggleFeaturedAction, bulkDeleteProductsAction, toggleStatusAction, saveToProductionAction } from "@/app/admin/actions"
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
  
  // Bulk delete state
  const [selectedSkus, setSelectedSkus] = useState<string[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Enhanced filtering state
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [roastFilter, setRoastFilter] = useState<string>('all') 
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // STAGING SYSTEM: Core state management
  const [stagedProducts, setStagedProducts] = useState<Product[]>([])
  const [originalProducts, setOriginalProducts] = useState<Product[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [savingError, setSavingError] = useState<string | null>(null)

  // STAGING SYSTEM: Initialize staging data (including empty state)
  useEffect(() => {
    console.log('🔍 initialProducts changed:', {
      length: initialProducts.length,
      first: initialProducts[0]?.productName || 'EMPTY',
      timestamp: new Date().toISOString()
    })
    
    // Always initialize with server data (including empty state)
    setStagedProducts([...initialProducts])
    setOriginalProducts([...initialProducts])
    setHasUnsavedChanges(false)
    console.log('🎭 Staging system initialized with', initialProducts.length, 'products')
  }, [initialProducts])

  // STAGING SYSTEM: Detect changes
  useEffect(() => {
    const hasChanges = JSON.stringify(stagedProducts) !== JSON.stringify(originalProducts)
    setHasUnsavedChanges(hasChanges)
    if (hasChanges) {
      console.log('🎭 Unsaved changes detected')
    }
  }, [stagedProducts, originalProducts])

  // STAGING SYSTEM: Prevent navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // STAGING SYSTEM: Change detection helpers
  const getChangedProducts = () => {
    const changes: { [key: string]: 'new' | 'modified' | 'deleted' } = {}
    
    stagedProducts.forEach(staged => {
      const original = originalProducts.find(p => p.sku === staged.sku)
      
      if (!original) {
        changes[staged.sku] = 'new'
      } else if (JSON.stringify(staged) !== JSON.stringify(original)) {
        changes[staged.sku] = 'modified'
      }
    })
    
    // Check for deleted products
    originalProducts.forEach(original => {
      if (!stagedProducts.find(p => p.sku === original.sku)) {
        changes[original.sku] = 'deleted'
      }
    })
    
    return changes
  }

  // STAGING SYSTEM: Save to production
  const saveToProduction = async () => {
    setIsSaving(true)
    setSavingError(null)
    
    try {
      console.log('🚀 Saving', stagedProducts.length, 'products to production...')
      const result = await saveToProductionAction(stagedProducts)
      
      if (result.error) {
        setSavingError(result.error)
        return
      }
      
      // Success - update original state to match staged
      setOriginalProducts([...stagedProducts])
      setProducts([...stagedProducts]) // Also update local products state
      setHasUnsavedChanges(false)
      setLastSaved(new Date())
      
      console.log('✅ Successfully saved to production!')
      alert(result.success || 'Changes saved successfully!')
      
    } catch (error) {
      console.error('❌ Save error:', error)
      setSavingError('An unexpected error occurred while saving.')
    } finally {
      setIsSaving(false)
    }
  }

  // STAGING SYSTEM: Discard changes
  const discardChanges = () => {
    const changeCount = Object.keys(getChangedProducts()).length
    
    if (confirm(`Are you sure you want to discard ${changeCount} unsaved changes?`)) {
      setStagedProducts([...originalProducts])
      setHasUnsavedChanges(false)
      setSavingError(null)
      console.log('🗑️ Discarded all staged changes')
    }
  }

  const filteredProducts = stagedProducts.filter((p) => {
    // Existing search logic
    const matchesSearch = p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // NEW: Category filter
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter
    
    // NEW: Roast level filter (only for coffee)
    const matchesRoast = roastFilter === 'all' || 
      (p.category === 'coffee' && p.roastLevel === roastFilter) ||
      p.category !== 'coffee' // Non-coffee products pass roast filter
    
    // NEW: Status filter  
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesRoast && matchesStatus
  })

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

  // STAGING SYSTEM: Delete product (staging only)
  const handleDelete = () => {
    if (!deletingSku) return
    console.log(`🗑️ Removing product ${deletingSku} from staging area`)
    
    // Remove from staging immediately (no server call)
    setStagedProducts(prev => prev.filter(p => p.sku !== deletingSku))
    setDeletingSku(null)
    
    console.log(`✅ Product ${deletingSku} removed from staging area`)
  }

  // STAGING SYSTEM: Toggle featured (staging only)
  const handleToggleFeatured = (sku: string, isFeatured: boolean) => {
    console.log(`⭐ Toggling featured status for ${sku} to ${isFeatured} in staging`)
    
    // Update staging immediately (no server call)
    setStagedProducts(prev => 
      prev.map(p => p.sku === sku ? { ...p, featured: isFeatured } : p)
    )
    
    console.log(`✅ Featured status updated in staging for ${sku}`)
  }

  // STAGING SYSTEM: Toggle status (staging only)  
  const handleToggleStatus = (sku: string, isActive: boolean) => {
    const newStatus = isActive ? "active" : "draft"
    console.log(`🔄 Toggling status for ${sku} to ${newStatus} in staging`)
    
    // Update staging immediately (no server call)
    setStagedProducts(prev => 
      prev.map(p => p.sku === sku ? { ...p, status: newStatus } : p)
    )
    
    console.log(`✅ Status updated in staging for ${sku}`)
  }

  // Bulk delete handlers
  const handleSelectProduct = (sku: string, checked: boolean) => {
    if (checked) {
      setSelectedSkus([...selectedSkus, sku])
    } else {
      setSelectedSkus(selectedSkus.filter(s => s !== sku))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSkus(filteredProducts.map(p => p.sku))
    } else {
      setSelectedSkus([])
    }
  }

  // STAGING SYSTEM: Bulk delete (staging only)
  const handleBulkDelete = () => {
    if (selectedSkus.length === 0) return
    
    console.log(`🗑️ Bulk removing ${selectedSkus.length} products from staging area`)
    
    // Remove from staging immediately (no server call)
    setStagedProducts(prev => prev.filter(p => !selectedSkus.includes(p.sku)))
    setSelectedSkus([])
    setIsBulkDeleting(false)
    
    console.log(`✅ ${selectedSkus.length} products removed from staging area`)
  }

  const isAllSelected = filteredProducts.length > 0 && selectedSkus.length === filteredProducts.length
  const isIndeterminate = selectedSkus.length > 0 && selectedSkus.length < filteredProducts.length

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

      {/* STAGING SYSTEM: Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-medium text-yellow-800">Unsaved Changes</h3>
                <p className="text-sm text-yellow-600">
                  You have {Object.keys(getChangedProducts()).length} unsaved changes that haven't been published to the live site.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={discardChanges}
                disabled={isSaving}
                className="text-yellow-700 hover:bg-yellow-100"
              >
                Discard Changes
              </Button>
              <Button
                onClick={saveToProduction}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save to Production
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STAGING SYSTEM: Success indicator */}
      {lastSaved && !hasUnsavedChanges && (
        <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Last saved to production: {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* STAGING SYSTEM: Error indicator */}
      {savingError && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {savingError}
        </div>
      )}

      {/* Advanced Filters */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div className="flex flex-col min-w-40">
            <label className="text-sm font-medium mb-1">Category</label>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="all">All Categories ({stagedProducts.length})</option>
              <option value="coffee">Coffee ({stagedProducts.filter(p => p.category === 'coffee').length})</option>
              <option value="subscription">Subscription ({stagedProducts.filter(p => p.category === 'subscription').length})</option>
              <option value="gift-set">Gift Set ({stagedProducts.filter(p => p.category === 'gift-set').length})</option>
            </select>
          </div>

          {/* Roast Level Filter - Show only when coffee selected */}
          {categoryFilter === 'coffee' && (
            <div className="flex flex-col min-w-40">
              <label className="text-sm font-medium mb-1">Roast Level</label>
              <select 
                value={roastFilter} 
                onChange={(e) => setRoastFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="all">All Roasts</option>
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="medium-dark">Medium-Dark</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className="flex flex-col min-w-40">
            <label className="text-sm font-medium mb-1">Status</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="all">All Status ({stagedProducts.length})</option>
              <option value="active">Active ({stagedProducts.filter(p => p.status === 'active').length})</option>
              <option value="draft">Draft ({stagedProducts.filter(p => p.status === 'draft').length})</option>
              <option value="archived">Archived ({stagedProducts.filter(p => p.status === 'archived').length})</option>
            </select>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCategoryFilter('coffee')}
            className="bg-blue-50 hover:bg-blue-100 border-blue-200"
          >
            Coffee Only ({stagedProducts.filter(p => p.category === 'coffee').length})
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setStatusFilter('draft')}
            className="bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
          >
            Drafts ({stagedProducts.filter(p => p.status === 'draft').length})
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setStatusFilter('active')}
            className="bg-green-50 hover:bg-green-100 border-green-200"
          >
            Active ({stagedProducts.filter(p => p.status === 'active').length})
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {setCategoryFilter('all'); setRoastFilter('all'); setStatusFilter('all'); setSearchTerm('')}}
            className="bg-gray-50 hover:bg-gray-100 border-gray-200"
          >
            Clear All Filters
          </Button>
          
          {/* Results Count */}
          <div className="flex items-center px-3 py-1 bg-white rounded-md border text-sm ml-auto">
            <strong>Showing {filteredProducts.length} of {stagedProducts.length} products</strong>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedSkus.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-900">
              {selectedSkus.length} product{selectedSkus.length === 1 ? '' : 's'} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSkus([])}
              disabled={isPending}
            >
              Clear Selection
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsBulkDeleting(true)}
              disabled={isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  aria-label="Select all products"
                />
              </TableHead>
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
                  <Checkbox
                    checked={selectedSkus.includes(product.sku)}
                    onCheckedChange={(checked) => handleSelectProduct(product.sku, !!checked)}
                    aria-label={`Select ${product.productName}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product.status === "active"}
                      onCheckedChange={(checked) => handleToggleStatus(product.sku, checked)}
                      disabled={isPending}
                      aria-label="Toggle active status"
                    />
                    <Badge
                      variant={product.status === "active" ? "default" : "secondary"}
                      className={
                        product.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }
                    >
                      {product.status === "active" ? "Active" : "Draft"}
                    </Badge>
                  </div>
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
            // Only refresh if no unsaved changes (don't interfere with save workflow)
            if (!hasUnsavedChanges && !isSaving) {
              console.log('🔄 ProductForm closed - refreshing router (no unsaved changes)')
              router.refresh()
            } else {
              console.log('🚫 ProductForm closed - skipping router refresh (unsaved changes or saving in progress)')
            }
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkDeleting} onOpenChange={(isOpen) => !isOpen && setIsBulkDeleting(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedSkus.length} products?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <strong>{selectedSkus.length} product{selectedSkus.length === 1 ? '' : 's'}</strong> from your inventory.
              {selectedSkus.length <= 5 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Products to be deleted:</p>
                  <ul className="text-sm text-gray-800 list-disc list-inside mt-1">
                    {selectedSkus.slice(0, 5).map(sku => {
                      const product = products.find(p => p.sku === sku)
                      return (
                        <li key={sku}>{product?.productName || sku}</li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={isPending} className="bg-red-600 hover:bg-red-700">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete {selectedSkus.length} Product{selectedSkus.length === 1 ? '' : 's'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
