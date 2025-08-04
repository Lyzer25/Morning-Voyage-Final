"use client"

import { useState, useTransition, useActionState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  Clock,
  Rocket,
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
import { exportCsvAction, deleteProductAction, toggleFeaturedAction, bulkDeleteProductsAction, toggleStatusAction, saveToProductionAction } from "@/app/admin/actions"
import { getProducts } from "@/lib/csv-data"
import { transformHeader, processCSVData } from "@/lib/csv-helpers"
import type { Product } from "@/lib/types"
import ProductForm from "./product-form"
import Papa from "papaparse"
import { toast } from "sonner"

export default function ProductManager({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
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
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // ENHANCED: Unified progress state management (FIXES DISAPPEARING PROGRESS BAR)
  const [saveState, setSaveState] = useState<{
    isActive: boolean
    stage: 'idle' | 'validating' | 'saving' | 'revalidating' | 'verifying' | 'complete' | 'error'
    progress: number
    message: string
    error?: string
    startTime?: Date
  }>({
    isActive: false,
    stage: 'idle',
    progress: 0,
    message: '',
    error: undefined,
    startTime: undefined
  })

  // FIXED: Consistent progress updater that never resets unexpectedly
  const updateSaveProgress = useCallback((stage: string, progress: number, message: string, error?: string) => {
    console.log(`🚀 Save Progress: ${stage} - ${progress}% - ${message}`, error ? { error } : '')
    
    setSaveState(prev => ({
      ...prev,
      isActive: stage !== 'idle',
      stage: stage as any,
      progress,
      message,
      error,
      startTime: prev.startTime || new Date()
    }))
  }, [])

  // NEW: Client-side CSV upload handler
  const handleCsvUpload = useCallback(async (file: File) => {
    try {
      console.log('📂 CSV Upload: Processing file locally...', {
        name: file.name,
        size: file.size,
        type: file.type
      })

      if (!file || file.size === 0) {
        toast.error("Please select a CSV file to upload.")
        return
      }

      if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
        toast.error("Invalid file type. Please upload a CSV file.")
        return
      }

      // Read file content
      const csvText = await file.text()
      console.log('📂 CSV content received:', {
        length: csvText.length,
        firstLine: csvText.split('\n')[0] || 'EMPTY',
        preview: csvText.substring(0, 300)
      })

      // Parse CSV using existing helper
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: transformHeader,
      })

      console.log('📂 CSV parsed:', {
        dataRows: parsed.data?.length || 0,
        errors: parsed.errors?.length || 0,
        headers: parsed.meta?.fields || []
      })

      if (parsed.errors.length > 0) {
        console.warn('⚠️ CSV parsing errors:', parsed.errors)
        toast.error(`CSV parsing error: ${parsed.errors[0].message}`)
        return
      }

      if (!parsed.meta.fields?.includes("sku") || !parsed.meta.fields?.includes("productName")) {
        toast.error("CSV must contain 'sku' and 'productName' columns.")
        return
      }

      // Process data using existing helper
      const processedData = processCSVData(parsed.data || [])

      console.log('📂 CSV processed:', {
        productsCount: processedData.length,
        categories: [...new Set(processedData.map(p => p.category).filter(Boolean))],
        sampleProduct: processedData[0]
      })

      // Smart merge: Ask user how to handle the CSV data
      const userChoice = confirm(
        `Import ${processedData.length} products from CSV.\n\nOK = Replace all products\nCancel = Add new products only`
      )

      setStagedProducts(prev => {
        if (userChoice) {
          // Replace all products with CSV data
          console.log('📂 Replacing all products with CSV data')
          return [...processedData]
        } else {
          // Add new products, update existing ones
          const existingSkus = new Set(prev.map(p => p.sku))
          const newProducts = processedData.filter(p => !existingSkus.has(p.sku))
          const updatedProducts = prev.map(existing => {
            const csvProduct = processedData.find(p => p.sku === existing.sku)
            return csvProduct || existing // Update if found in CSV, keep existing if not
          })
          
          console.log('📂 Merging CSV data:', {
            existing: prev.length,
            newFromCsv: newProducts.length,
            updated: updatedProducts.length
          })
          
          return [...updatedProducts, ...newProducts]
        }
      })

      // Show success message
      toast.success(`📂 CSV processed: ${processedData.length} products added to staging area`)

    } catch (error) {
      console.error('❌ CSV Upload Error:', error)
      toast.error(`CSV upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [])

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

  // ENHANCED: Save to production with REAL verification before completion
  const saveToProduction = useCallback(async () => {
    if (saveState.isActive) {
      console.log('🚫 Save already in progress, ignoring duplicate call')
      return
    }
    
    console.log('🚀 Starting save to production...')
    updateSaveProgress('validating', 0, 'Starting deployment...')
    
    try {
      // Stage 1: Validation (10%)
      updateSaveProgress('validating', 10, 'Validating product data...')
      await new Promise(resolve => setTimeout(resolve, 500)) // Brief UX delay
      
      if (!Array.isArray(stagedProducts)) {
        throw new Error('Invalid product data')
      }
      
      console.log('🚀 DEPLOY: Starting deployment of', stagedProducts.length, 'products')
      
      // Stage 2: Saving to Blob Storage (30%)
      updateSaveProgress('saving', 30, 'Saving to Blob storage...')
      const result = await saveToProductionAction(stagedProducts)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      // Stage 3: Update Local State (50%)
      updateSaveProgress('saving', 50, 'Updating local state...')
      setOriginalProducts([...stagedProducts])
      setProducts([...stagedProducts])
      setHasUnsavedChanges(false)
      
      // Stage 4: Cache Revalidation (70%)
      updateSaveProgress('revalidating', 70, 'Clearing site cache...')
      await new Promise(resolve => setTimeout(resolve, 2000)) // Allow cache clearing
      
      // CRITICAL NEW: Stage 5: Customer-Facing Data Verification (90%)
      updateSaveProgress('revalidating', 90, 'Verifying customer pages are updated...')
      
      console.log('🔍 CUSTOMER VERIFICATION: Starting customer-facing data pipeline verification...')
      
      // Verify the CUSTOMER-FACING data pipeline (not just blob storage)
      let verificationAttempts = 0
      let customerDataVerified = false
      const maxAttempts = 10 // Max 10 attempts = 30 seconds
      
      while (!customerDataVerified && verificationAttempts < maxAttempts) {
        try {
          console.log(`🔍 CUSTOMER VERIFICATION: Attempt ${verificationAttempts + 1}/${maxAttempts}`)
          
          // CRITICAL: Test the same API that customer pages use
          const response = await fetch('/api/products?grouped=true', {
            cache: 'no-store',
            headers: { 
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          })
          
          if (!response.ok) {
            throw new Error(`Customer API returned ${response.status}`)
          }
          
          const { products: customerProducts } = await response.json()
          
          // Filter coffee products (like customer pages do)
          const customerCoffeeProducts = Array.isArray(customerProducts) 
            ? customerProducts.filter(p => p.category?.toLowerCase().includes('coffee'))
            : []
          
          const stagedCoffeeProducts = stagedProducts.filter(p => p.category?.toLowerCase().includes('coffee'))
          
          // Compare coffee product counts (primary verification)
          const countsMatch = customerCoffeeProducts.length === stagedCoffeeProducts.length
          
          // Compare a few SKUs for additional verification
          const stagedSkus = stagedCoffeeProducts.map(p => p.sku).sort()
          const customerSkus = customerCoffeeProducts.map(p => p.sku).sort()
          const skusMatch = JSON.stringify(stagedSkus.slice(0, 3)) === JSON.stringify(customerSkus.slice(0, 3))
          
          console.log(`🔍 CUSTOMER VERIFICATION: Customer API check`, {
            stagedTotal: stagedProducts.length,
            stagedCoffee: stagedCoffeeProducts.length,
            customerTotal: customerProducts?.length || 0,
            customerCoffee: customerCoffeeProducts.length,
            countsMatch,
            skusMatch,
            stagedFirst3: stagedSkus.slice(0, 3),
            customerFirst3: customerSkus.slice(0, 3)
          })
          
          if (countsMatch && (stagedCoffeeProducts.length === 0 || skusMatch)) {
            console.log('✅ CUSTOMER VERIFICATION: Customer-facing data verified!')
            console.log(`✅ CUSTOMER VERIFICATION: Customers will see ${customerCoffeeProducts.length} coffee products`)
            customerDataVerified = true
          } else {
            console.log(`⏳ CUSTOMER VERIFICATION: Customer cache still updating...`)
            await new Promise(resolve => setTimeout(resolve, 3000))
            verificationAttempts++
          }
        } catch (verifyError) {
          console.warn(`⚠️ CUSTOMER VERIFICATION: Attempt ${verificationAttempts + 1} failed:`, verifyError)
          await new Promise(resolve => setTimeout(resolve, 3000))
          verificationAttempts++
        }
      }
      
      if (!customerDataVerified) {
        throw new Error('Changes saved but customer page verification timeout - customers may need to wait a moment longer for updates')
      }
      
      // Stage 6: Complete (100%) - Only after real verification
      updateSaveProgress('complete', 100, `✅ Successfully deployed & verified ${stagedProducts.length} products!`)
      setLastSaved(new Date())
      
      console.log('🎉 DEPLOY: Complete with verification! Changes are confirmed live.')
      
      // Show success state for 4 seconds
      setTimeout(() => {
        updateSaveProgress('idle', 0, '')
      }, 4000)
      
    } catch (error) {
      console.error('❌ DEPLOY: Failed with error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Deployment failed'
      
      // FIXED: Keep progress at 90% to show where verification failed
      updateSaveProgress('error', 90, errorMessage, errorMessage)
      
      // FIXED: Remove auto-reset timer - let user control error dismissal
      console.log('🔴 Error state will persist until user action')
    }
  }, [stagedProducts, updateSaveProgress, saveState.isActive])

  // STAGING SYSTEM: Discard changes
  const discardChanges = () => {
    const changeCount = Object.keys(getChangedProducts()).length
    
    if (confirm(`Are you sure you want to discard ${changeCount} unsaved changes?`)) {
      setStagedProducts([...originalProducts])
      setHasUnsavedChanges(false)
      updateSaveProgress('idle', 0, '') // Clear any error states
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

  // STAGING SYSTEM: Add product (staging only) - NEW
  const handleAddProduct = useCallback((productData: Product) => {
    console.log(`➕ Adding new product ${productData.sku} to staging area`, productData)
    
    // Check for duplicate SKU in staging
    const existingSku = stagedProducts.find(p => p.sku === productData.sku)
    if (existingSku) {
      toast.error(`Product with SKU '${productData.sku}' already exists in staging`)
      return false
    }
    
    // Add to staging immediately (no server call)
    const newProduct: Product = {
      ...productData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      inStock: true, // Default to in stock for new products
    }
    
    setStagedProducts(prev => [...prev, newProduct])
    
    console.log(`✅ Product ${productData.sku} added to staging area`)
    toast.success(`Product '${productData.productName}' added to staging area`)
    return true
  }, [stagedProducts])

  // STAGING SYSTEM: Update product (staging only) - NEW
  const handleUpdateProduct = useCallback((productData: Product) => {
    console.log(`✏️ Updating product ${productData.sku} in staging area`, productData)
    
    // Update in staging immediately (no server call)
    setStagedProducts(prev => 
      prev.map(p => p.sku === productData.sku 
        ? { ...productData, updatedAt: new Date() } 
        : p
      )
    )
    
    console.log(`✅ Product ${productData.sku} updated in staging area`)
    toast.success(`Product '${productData.productName}' updated in staging area`)
    return true
  }, [])

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
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              className="w-full file:mr-2 file:rounded-md file:border-0 file:bg-stone-200 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-stone-700 hover:file:bg-stone-300"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleCsvUpload(file)
                  // Reset file input after processing
                  e.target.value = ''
                }
              }}
            />
            <Button
              type="button"
              onClick={() => {
                const fileInput = document.getElementById('csvFile') as HTMLInputElement
                fileInput?.click()
              }}
              className="w-full sm:w-auto"
            >
              <Upload className="mr-2 h-4 w-4" />
              Add CSV to Staging
            </Button>
          </div>
          <Button onClick={handleExport} variant="outline" className="w-full sm:w-auto bg-transparent">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* ENHANCED: Professional Save & Deploy Interface */}
      {hasUnsavedChanges && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Rocket className="w-5 h-5 mr-2 text-blue-600" />
                Ready to Deploy Changes
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                You have <strong>{Object.keys(getChangedProducts()).length} changes</strong> in your staging area. 
                Deploy these changes to make them live on your website.
              </p>
              
              {/* Change Summary Cards */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-green-100 rounded-lg">
                  <div className="font-bold text-green-700">
                    {Object.values(getChangedProducts()).filter(c => c === 'new').length}
                  </div>
                  <div className="text-xs text-green-600">New Products</div>
                </div>
                <div className="text-center p-3 bg-blue-100 rounded-lg">
                  <div className="font-bold text-blue-700">
                    {Object.values(getChangedProducts()).filter(c => c === 'modified').length}
                  </div>
                  <div className="text-xs text-blue-600">Modified</div>
                </div>
                <div className="text-center p-3 bg-red-100 rounded-lg">
                  <div className="font-bold text-red-700">
                    {Object.values(getChangedProducts()).filter(c => c === 'deleted').length}
                  </div>
                  <div className="text-xs text-red-600">Deleted</div>
                </div>
              </div>
            </div>
            
            <div className="ml-6 min-w-80">
              <div className="space-y-4">
                {/* Progress Bar - Show during save/deploy */}
                {saveState.stage !== 'idle' && (
                  <div className="space-y-2">
                    <Progress 
                      value={saveState.progress} 
                      className={`w-full ${
                        saveState.stage === 'error' ? 'bg-red-100' : 'bg-gray-100'
                      }`}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className={`${
                        saveState.stage === 'error' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {saveState.message}
                      </span>
                      <span className={`font-mono ${
                        saveState.stage === 'error' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {saveState.progress}%
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Deploy Button */}
                <Button
                  onClick={saveToProduction}
                  disabled={saveState.isActive || !hasUnsavedChanges}
                  className={`w-full ${
                    hasUnsavedChanges 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {saveState.stage === 'idle' && hasUnsavedChanges && (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Deploy to Live Site
                    </>
                  )}
                  {saveState.stage === 'idle' && !hasUnsavedChanges && (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />  
                      No Changes to Deploy
                    </>
                  )}
                  {saveState.stage === 'validating' && (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  )}
                  {saveState.stage === 'saving' && (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving to Production...
                    </>
                  )}
                  {saveState.stage === 'revalidating' && (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating Live Site...
                    </>
                  )}
                  {saveState.stage === 'complete' && (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Successfully Deployed!
                    </>
                  )}
                  {saveState.stage === 'error' && (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Deployment Failed
                    </>
                  )}
                </Button>

                {/* Discard Changes Button */}
                <Button
                  variant="outline"
                  onClick={discardChanges}
                  disabled={saveState.isActive}
                  className="w-full text-gray-700 hover:bg-gray-100"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Discard Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS: All Changes Deployed */}
      {!hasUnsavedChanges && lastSaved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          <div>
            <div className="font-medium text-green-900">✅ All Changes Deployed</div>
            <div className="text-sm text-green-700">
              Last deployment: {lastSaved.toLocaleString()} • All products are live on your website
            </div>
          </div>
        </div>
      )}

      {/* ERROR: Deployment Failed with Retry and Clear Options */}
      {saveState.stage === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <div className="font-medium text-red-900">Deployment Failed</div>
                <div className="text-sm text-red-700">{saveState.message}</div>
                <div className="text-xs text-red-600 mt-1">
                  Progress stopped at {saveState.progress}% - Error state will persist until you take action
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={saveToProduction}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Retry Deployment
              </Button>
              <Button 
                onClick={() => updateSaveProgress('idle', 0, '')}
                variant="outline"
                size="sm"
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Clear Error
              </Button>
            </div>
          </div>
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
              <TableHead>Shipping (1st)</TableHead>
              <TableHead>Shipping (Add'l)</TableHead>
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
                  {product.shippingFirst ? formatPrice(product.shippingFirst) : "—"}
                </TableCell>
                <TableCell>
                  {product.shippingAdditional ? formatPrice(product.shippingAdditional) : "—"}
                </TableCell>
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
            // No router refresh needed - staging system handles UI updates
            console.log('🔄 ProductForm closed - staging system will handle updates')
          }
        }}
        onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
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
