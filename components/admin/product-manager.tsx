"use client"

import { useState, useTransition, useActionState, useEffect, useCallback, useMemo } from "react"
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
  Trash2,
  Pencil,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Download,
  Clock,
  Rocket,
  Coffee,
  RefreshCw,
  Gift,
  Wrench,
  Edit,
  Copy,
  MoreHorizontal,
  ChevronDown,
  Package,
  Users,
  Search,
  TestTube,
  Zap,
  XCircle,
  Star
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
import { exportCsvAction, deleteProductAction, toggleFeaturedAction, bulkDeleteProductsAction, toggleStatusAction, saveToProductionAction, debugBlobStatus, forceBlobRefresh, testBlobWrite, forceImmediateSyncAction, checkCacheStatusAction } from "@/app/admin/actions"
import { getProducts, fromCsvRow } from "@/lib/csv-data"
import { transformHeader, normalizeTastingNotes } from "@/lib/csv-helpers"
import type { Product } from "@/lib/types"
import { CoffeeProductForm } from "./forms/CoffeeProductForm"
import { SubscriptionProductForm } from "./forms/SubscriptionProductForm"
import { GiftBundleProductForm } from "./forms/GiftBundleProductForm"
import { FamilyEditForm } from "./forms/FamilyEditForm"
import ProductForm from "./product-form" // Assuming this is a general form
import Papa from "papaparse"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { groupProductFamilies, ProductFamily } from "@/lib/family-grouping"

// ENHANCED: Debug Result Interface for Visual Feedback
interface DebugResult {
  title: string
  status: 'success' | 'warning' | 'error'
  details: Record<string, any>
  timestamp: string
}

// ENHANCED: Debug Result Modal Component
const DebugResultModal = ({ result, isOpen, onClose }: {
  result: DebugResult | null
  isOpen: boolean
  onClose: () => void
}) => {
  if (!result) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {result.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {result.status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
            {result.status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
            {result.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            {result.timestamp}
          </div>
          
          <div className="space-y-3">
            {Object.entries(result.details).map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-50 rounded border">
                <div className="font-medium text-gray-900 mb-1">{key}:</div>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ProductManager({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isPending, startTransition] = useTransition()

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)
  const [deletingSku, setDeletingSku] = useState<string | null>(null)
  const [activeFormType, setActiveFormType] = useState<'coffee' | 'subscription' | 'gift-set' | 'general'>('coffee')
  
  // Family editing state
  const [isFamilyEditOpen, setIsFamilyEditOpen] = useState(false)
  const [editingFamily, setEditingFamily] = useState<ProductFamily | null>(null)
  const [isCreatingFamily, setIsCreatingFamily] = useState(false)
  
  // Bulk delete state
  const [selectedSkus, setSelectedSkus] = useState<string[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // ENHANCED: Visual debug state management
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null)
  const [showDebugModal, setShowDebugModal] = useState(false)
  const [isDebugging, setIsDebugging] = useState(false)

  const handleAddNewProduct = (category: 'coffee' | 'subscription' | 'gift-set' | 'general') => {
    setEditingProduct(undefined)
    setActiveFormType(category)
    setIsEditDialogOpen(true)
  }

  // NEW: Handle Coffee Family creation
  const handleAddNewFamily = () => {
    console.log('🏗️ Creating new coffee family from scratch')
    
    // Create empty family structure
    const emptyFamily: ProductFamily = {
      familyKey: `NEW_FAMILY_${Date.now()}`,
      base: {
        id: crypto.randomUUID(),
        sku: '',
        productName: '',
        description: '',
        category: 'coffee',
        price: 0,
        roastLevel: 'medium',
        origin: '',
        tastingNotes: [],
        format: 'whole-bean',
        weight: '',
        status: 'draft',
        featured: false,
        inStock: true,
        images: [], // Add missing images property
        createdAt: new Date(),
        updatedAt: new Date()
      },
      variants: []
    }
    
    setEditingFamily(emptyFamily)
    setIsCreatingFamily(true)
    setIsFamilyEditOpen(true)
    
    console.log('🏗️ Opening empty family editor for new family creation')
  }

  // Enhanced filtering state
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [roastFilter, setRoastFilter] = useState<string>('all') 
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // PHASE 3: View toggle state (family vs individual view)
  const [viewMode, setViewMode] = useState<'family' | 'individual'>('family')

  // STAGING SYSTEM: Core state management
  const [stagedProducts, setStagedProducts] = useState<Product[]>([])
  const [originalProducts, setOriginalProducts] = useState<Product[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isDeployInProgress, setIsDeployInProgress] = useState(false)

  const handleCategoryChange = useCallback(async (productSku: string, newCategory: string) => {
    try {
      setStagedProducts(prev => 
        prev.map(product => 
          product.sku === productSku 
            ? { 
                ...product, 
                category: newCategory.toLowerCase(),
                // Reset category-specific fields when changing category
                ...(newCategory === 'coffee' ? {
                  roastLevel: product.roastLevel || 'medium',
                  origin: product.origin || '',
                  tastingNotes: normalizeTastingNotes(product.tastingNotes || "")
                } : {}),
                ...(newCategory === 'subscription' ? {
                  notification: product.notification || '',
                  subscriptionInterval: product.subscriptionInterval || 'monthly',
                  deliveryFrequency: product.deliveryFrequency || 'monthly'
                } : {})
              }
            : product
        )
      )
      toast.success(`${productSku} category updated to ${newCategory}`)
    } catch (error: any) {
      toast.error(`Failed to update category: ${error.message}`)
    }
  }, [])

  const getCategoryFormType = (category: string): 'coffee' | 'subscription' | 'gift-set' | 'general' => {
    switch (category?.toLowerCase()) {
      case 'coffee': return 'coffee'
      case 'subscription': return 'subscription'
      case 'gift-set': return 'gift-set'
      default: return 'general'
    }
  }

  const handleCategoryEdit = useCallback((product: Product) => {
    console.log('🔍 EDIT TRIGGER: Product being passed to form:', {
      productObject: product,
      productExists: !!product,
      productKeys: product ? Object.keys(product) : [],
      coreData: {
        sku: product?.sku,
        productName: product?.productName,
        description: product?.description,
        price: product?.price,
        originalPrice: product?.originalPrice,
        category: product?.category,
        status: product?.status,
        featured: product?.featured,
        inStock: product?.inStock
      },
      coffeeSpecific: product?.category === 'coffee' ? {
        roastLevel: product?.roastLevel,
        origin: product?.origin,
        format: product?.format,
        weight: product?.weight,
        tastingNotes: {
          value: product?.tastingNotes,
          type: typeof product?.tastingNotes,
          isArray: Array.isArray(product?.tastingNotes),
          length: Array.isArray(product?.tastingNotes) ? product.tastingNotes.length : 'N/A'
        }
      } : null,
      shippingData: {
        shippingFirst: product?.shippingFirst,
        shippingAdditional: product?.shippingAdditional
      },
      dataTypes: {
        sku: typeof product?.sku,
        productName: typeof product?.productName,
        price: typeof product?.price,
        tastingNotes: typeof product?.tastingNotes
      },
      timestamp: new Date().toISOString()
    })
    
    const formType = getCategoryFormType(product.category)
    console.log('🔍 FORM TYPE SELECTED:', formType, 'for category:', product?.category)
    
    setEditingProduct(product)
    setActiveFormType(formType) // 'coffee', 'subscription', 'general'
    setIsEditDialogOpen(true)
    
    console.log('🔍 STATE UPDATES TRIGGERED:', {
      editingProduct: 'SET',
      activeFormType: formType,
      isEditDialogOpen: true
    })
  }, [])

  // FAMILY EDITING: Handle family edit button click
  const handleFamilyEdit = useCallback((family: ProductFamily) => {
    console.log('🏗️ FAMILY EDIT: Opening family editor for:', family.familyKey, {
      variantCount: family.variants.length,
      familyData: family.base,
      variants: family.variants.map(v => ({ sku: v.sku, format: v.format, weight: v.weight }))
    })
    
    setEditingFamily(family)
    setIsFamilyEditOpen(true)
  }, [])

  // FAMILY EDITING: Handle family update in staging
  const handleFamilyUpdate = useCallback((updatedProducts: Product[]) => {
    console.log('🏗️ FAMILY UPDATE: Processing family update in staging:', {
      productCount: updatedProducts.length,
      updatedSkus: updatedProducts.map(p => p.sku)
    })
    
    try {
      // Update all family variants in staging
      setStagedProducts(prev => 
        prev.map(existingProduct => {
          const updatedProduct = updatedProducts.find(up => up.sku === existingProduct.sku)
          return updatedProduct || existingProduct
        })
      )
      
      console.log('✅ Family update applied to staging successfully')
      toast.success(`Family updated successfully in staging area!`)
      return true
    } catch (error) {
      console.error('❌ Family update failed:', error)
      toast.error(`Failed to update family: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return false
    }
  }, [])

  const getCategoryFormLabel = (category: string): string => {
    switch (category?.toLowerCase()) {
      case 'coffee': return 'Edit Coffee'
      case 'subscription': return 'Edit Subscription'
      case 'gift-set': return 'Edit Gift Set'
      case 'gift-bundle': return 'Edit Gift Set'
      default: return 'Edit Product'
    }
  }
  
  const getCategoryVariant = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'coffee': return 'default'
      case 'subscription': return 'secondary'
      default: return 'outline'
    }
  }

  const getCategoryDisplayName = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'coffee': return 'Coffee'
      case 'subscription': return 'Subscription'
      case 'gift-set': return 'Gift Set'
      case 'equipment': return 'Equipment'
      default: return 'General'
    }
  }

  // ✅ ENHANCED: Comprehensive category styling system with permanent row colors
  const getCategoryStyle = (category: string) => {
    const styles: Record<string, { badge: string; row: string; icon: any }> = {
      'coffee': {
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        row: 'bg-amber-50 border-l-2 border-l-amber-400 hover:bg-amber-100',
        icon: Coffee
      },
      'coffee-family': {
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
        row: 'bg-blue-50 border-l-4 border-l-blue-400 hover:bg-blue-100',
        icon: Coffee
      },
      'subscription': {
        badge: 'bg-purple-100 text-purple-800 border-purple-200',
        row: 'bg-purple-50 border-l-2 border-l-purple-400 hover:bg-purple-100',
        icon: Users
      },
      'gift-set': {
        badge: 'bg-green-100 text-green-800 border-green-200',
        row: 'bg-green-50 border-l-2 border-l-green-400 hover:bg-green-100',
        icon: Gift
      },
      'equipment': {
        badge: 'bg-gray-100 text-gray-800 border-gray-200',
        row: 'bg-gray-50 border-l-2 border-l-gray-400 hover:bg-gray-100',
        icon: Package
      }
    }
    
    return styles[category] || styles['coffee']
  }

  // ✅ NEW: Family category change handler
  const handleFamilyCategoryChange = useCallback((family: ProductFamily, newCategory: string) => {
    console.log('🏗️ FAMILY CATEGORY CHANGE:', family.familyKey, 'to', newCategory)
    
    if (newCategory === 'coffee-family') {
      // Keep as family - ensure all variants are coffee category
      setStagedProducts(prev => 
        prev.map(p => 
          family.variants.some(v => v.sku === p.sku)
            ? { ...p, category: 'coffee' } // Variants stay as coffee
            : p
        )
      )
      toast.success(`Family "${family.base.productName}" category maintained as Coffee Family`)
    } else {
      // Convert family to individual items with new category
      setStagedProducts(prev => 
        prev.map(p => 
          family.variants.some(v => v.sku === p.sku)
            ? { ...p, category: newCategory } // All variants get new category
            : p
        )
      )
      toast.success(`Family "${family.base.productName}" converted to individual ${newCategory} products`)
    }
  }, [])

  // ✅ ENHANCED: Category dropdown component for families and individuals
  const CategoryDropdown = ({ item, onChange, isFamily = false }: { 
    item: any, 
    onChange: (item: any, newCategory: string) => void,
    isFamily?: boolean 
  }) => {
    const style = getCategoryStyle(isFamily ? 'coffee-family' : item.category)
    const Icon = style.icon
    
    return (
      <Select 
        value={isFamily ? 'coffee-family' : item.category || 'coffee'} 
        onValueChange={(newCategory) => onChange(item, newCategory)}
      >
        <SelectTrigger className={`w-auto border-none ${style.badge}`}>
          <div className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="coffee">
            <div className="flex items-center gap-2">
              <Coffee className="h-3 w-3" />
              Coffee
            </div>
          </SelectItem>
          <SelectItem value="coffee-family">
            <div className="flex items-center gap-2">
              <Coffee className="h-3 w-3" />
              Coffee Family
            </div>
          </SelectItem>
          <SelectItem value="subscription">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              Subscription
            </div>
          </SelectItem>
          <SelectItem value="gift-set">
            <div className="flex items-center gap-2">
              <Gift className="h-3 w-3" />
              Gift Set
            </div>
          </SelectItem>
          <SelectItem value="equipment">
            <div className="flex items-center gap-2">
              <Package className="h-3 w-3" />
              Equipment
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    )
  }

  // LEGACY: Keep badge function for backwards compatibility
  const getCategoryBadge = (category: string) => {
    const style = getCategoryStyle(category)
    const Icon = style.icon
    
    return (
      <Badge variant="default" className={style.badge}>
        <Icon className="h-3 w-3 mr-1" />
        {getCategoryDisplayName(category)}
      </Badge>
    )
  }

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

  // PARSING GUARD: Prevent duplicate CSV processing
  const [isParsingCsv, setIsParsingCsv] = useState(false)

  // NEW: Client-side CSV upload handler with staging integration
  const handleCsvUpload = useCallback(async (file: File) => {
    // GUARD: Prevent duplicate runs
    if (isParsingCsv) {
      console.log('🚫 CSV parsing already in progress, ignoring duplicate call')
      return
    }

    setIsParsingCsv(true)
    
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

      // Parse CSV with proper header transformation
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // Keep as strings for proper processing
        transformHeader: transformHeader,
      })

      console.log('📂 CSV parsed:', {
        dataRows: parsed.data?.length || 0,
        errors: parsed.errors?.length || 0,
        headers: parsed.meta?.fields || []
      })

      if (parsed.errors.length > 0) {
        console.warn('⚠️ CSV parsing errors:', parsed.errors)
        // Don't abort on parsing warnings, just show them
        parsed.errors.forEach(error => {
          console.warn(`CSV Warning: ${error.message} at row ${error.row}`)
        })
      }

      // CRITICAL: Only require essential fields (SKU, PRODUCTNAME, CATEGORY, PRICE)
      const requiredFields = ["SKU", "PRODUCTNAME", "CATEGORY", "PRICE"]
      const missingRequired = requiredFields.filter(field => !parsed.meta?.fields?.includes(field))
      
      if (missingRequired.length > 0) {
        toast.error(`CSV must contain required columns: ${missingRequired.join(', ')}`)
        return
      }

      console.log('✅ CSV has all required fields:', requiredFields)

      // Process each row using the robust fromCsvRow function directly
      const processedProducts: Product[] = []
      
      for (let i = 0; i < parsed.data.length; i++) {
        try {
          // FIXED: Use the robust fromCsvRow function that expects uppercase keys
          const product = fromCsvRow(parsed.data[i] as Record<string, any>)
          processedProducts.push(product)
        } catch (rowError) {
          console.error(`❌ Failed to process row ${i + 1}:`, rowError)
          toast.error(`Row ${i + 1}: ${rowError instanceof Error ? rowError.message : 'Processing failed'}`)
          // Continue processing other rows instead of aborting
        }
      }

      console.log('📂 CSV processed:', {
        totalRows: parsed.data.length,
        successfullyProcessed: processedProducts.length,
        categories: [...new Set(processedProducts.map(p => p.category).filter(Boolean))],
        sampleProduct: processedProducts[0]
      })

      if (processedProducts.length === 0) {
        toast.error('No valid products could be processed from CSV')
        return
      }

      // CRITICAL: Always set staging products and mark as unsaved
      console.log('🎭 Staging replace: Updating staging area with CSV data')
      setStagedProducts(processedProducts)
      setHasUnsavedChanges(true)

      console.log(`🎭 Staging replace: ${processedProducts.length} products loaded into staging`)
      toast.success(`📂 CSV processed: ${processedProducts.length} products loaded into staging area`)

    } catch (error) {
      console.error('❌ CSV Upload Error:', error)
      toast.error(`CSV upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsParsingCsv(false)
    }
  }, [isParsingCsv])

  // STAGING SYSTEM: Initialize staging data (including empty state)
  useEffect(() => {
    // CRITICAL FIX: Don't reset staging if a deployment is in progress.
    if (isDeployInProgress) {
      console.log('⚠️ Skipping staging re-init - deployment in progress')
      return
    }

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
  }, [initialProducts, isDeployInProgress])

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

  // ENHANCED: Force refresh admin data from blob storage
  const handleForceRefresh = useCallback(async () => {
    console.log('🔄 Force refreshing admin data from blob storage...')
    try {
      // Force fresh data fetch bypassing any cache
      const freshProducts = await getProducts({ forceRefresh: true, bypassCache: true })
      
      console.log('✅ Fresh products loaded from blob:', {
        count: freshProducts.length,
        source: 'direct-blob-fetch',
        timestamp: new Date().toISOString()
      })
      
      // Update all staging state with fresh data
      setStagedProducts([...freshProducts])
      setOriginalProducts([...freshProducts])
      setProducts([...freshProducts])
      setHasUnsavedChanges(false)
      
      console.log('✅ Admin data refreshed successfully')
      toast.success('Admin data refreshed from production')
      
    } catch (error) {
      console.error('❌ Force refresh failed:', error)
      toast.error('Failed to refresh admin data')
      throw error
    }
  }, [])

  // ENHANCED: Save to production with automatic admin data refresh
  const saveToProduction = useCallback(async () => {
    if (saveState.isActive) {
      console.log('🚫 Save already in progress, ignoring duplicate call')
      return
    }
    
    setIsDeployInProgress(true)
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
      
      // CRITICAL NEW: Stage 5: Customer-Facing Data Verification (85%)
      updateSaveProgress('revalidating', 85, 'Verifying customer pages are updated...')
      
      console.log('🔍 CUSTOMER VERIFICATION: Starting customer-facing data pipeline verification...')
      
      // Verify the CUSTOMER-FACING data pipeline (not just blob storage)
      let verificationAttempts = 0
      let customerDataVerified = false
      const maxAttempts = 20 // 20 attempts = 300 seconds (5 minutes)
      const checkInterval = 15000 // 15 seconds between checks
      const startTime = Date.now()
      
      while (!customerDataVerified && verificationAttempts < maxAttempts) {
        try {
          const elapsed = Date.now() - startTime
          const elapsedSeconds = Math.floor(elapsed / 1000)
          const maxSeconds = Math.floor((maxAttempts * checkInterval) / 1000)
          
          console.log(`🔍 CUSTOMER VERIFICATION: Attempt ${verificationAttempts + 1}/${maxAttempts} (${elapsedSeconds}s/${maxSeconds}s)`)
          
          // Update progress with timer
          updateSaveProgress('revalidating', 85, `Verifying customer pages... ${elapsedSeconds}s/${maxSeconds}s`)
          
          // CRITICAL: Test the same API that customer pages use
          const response = await fetch(`/api/products?grouped=true&ts=${Date.now()}`, {
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
            await new Promise(resolve => setTimeout(resolve, checkInterval))
            verificationAttempts++
          }
        } catch (verifyError) {
          console.warn(`⚠️ CUSTOMER VERIFICATION: Attempt ${verificationAttempts + 1} failed:`, verifyError)
          await new Promise(resolve => setTimeout(resolve, checkInterval))
          verificationAttempts++
        }
      }
      
      if (!customerDataVerified) {
        throw new Error('Changes saved but customer page verification timeout - customers may need to wait a moment longer for updates')
      }
      
      // CRITICAL NEW: Stage 6: Admin Data Refresh (95%)
      if (result.needsRefresh) {
        updateSaveProgress('revalidating', 95, 'Refreshing admin data from production...')
        console.log('🔄 DEPLOY: Auto-refreshing admin data after successful deployment...')
        
        // Small delay to ensure blob write propagation
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        try {
          await handleForceRefresh()
          console.log('✅ DEPLOY: Admin data auto-refresh completed')
        } catch (refreshError) {
          console.warn('⚠️ DEPLOY: Admin auto-refresh failed (deployment still successful):', refreshError)
          // Don't fail deployment for admin refresh issues
        }
      }
      
      // Stage 7: Complete (100%) - Only after real verification AND admin refresh
      updateSaveProgress('complete', 100, `✅ Successfully deployed & verified ${stagedProducts.length} products!`)
      setLastSaved(new Date())
      
      console.log('🎉 DEPLOY: Complete with verification AND admin refresh! Changes confirmed live and admin updated.')
      
      // Show success state for 4 seconds
      setTimeout(() => {
        updateSaveProgress('idle', 0, '')
        setIsDeployInProgress(false) // Clear deployment lock
      }, 4000)
      
    } catch (error) {
      console.error('❌ DEPLOY: Failed with error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Deployment failed'
      
      // CRITICAL FIX: Clear deployment protection on error
      setIsDeployInProgress(false)
      
      // FIXED: Keep progress at current stage to show where failure occurred
      updateSaveProgress('error', 90, errorMessage, errorMessage)
      
      // FIXED: Remove auto-reset timer - let user control error dismissal
      console.log('🔴 Error state will persist until user action')
    }
  }, [stagedProducts, updateSaveProgress, saveState.isActive, isDeployInProgress, handleForceRefresh])

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

  // ENHANCED: Transform coffee products based on view mode (family vs individual)
  const displayData = useMemo(() => {
    // First, apply filters to get base products
    const baseFilteredProducts = stagedProducts.filter((p) => {
      const matchesSearch = p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      
      // ENHANCED: Smart category filtering that respects view mode
      let matchesCategory = true;
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'coffee') {
          // When "coffee" is selected: show coffee families (in family view) or individual coffee items (in individual view)
          if (viewMode === 'family') {
            matchesCategory = p.category === 'coffee'  // Will be grouped into families
          } else {
            matchesCategory = p.category === 'coffee'  // Show as individual items
          }
        } else if (categoryFilter === 'coffee-family') {
          // When "coffee-family" is selected: only show coffee families (regardless of view mode)
          matchesCategory = p.category === 'coffee' && viewMode === 'family'
        } else {
          // Standard category matching
          matchesCategory = p.category === categoryFilter
        }
      }
      
      const matchesRoast = roastFilter === 'all' || 
        (p.category === 'coffee' && p.roastLevel === roastFilter) ||
        p.category !== 'coffee'
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      
      return matchesSearch && matchesCategory && matchesRoast && matchesStatus
    })

    if (viewMode === 'individual') {
      // INDIVIDUAL VIEW: Show all products as individual items (no family grouping)
      console.log('📦 Individual view transformation:', {
        totalFiltered: baseFilteredProducts.length,
        allIndividual: true
      })
      
      return baseFilteredProducts.map(product => ({ ...product, isFamily: false }))
    } else {
      // FAMILY VIEW: Group coffee into families, keep others individual (existing logic)
      const coffeeProducts = baseFilteredProducts.filter(p => p.category === 'coffee')
      const nonCoffeeProducts = baseFilteredProducts.filter(p => p.category !== 'coffee')
      
      // Group coffee products into families (now with 2+ variant requirement)
      const coffeeFamilies = coffeeProducts.length > 0 
        ? groupProductFamilies(coffeeProducts)
        : []

      // ✅ Get singles that didn't group into families
      const familySkus = new Set(coffeeFamilies.flatMap(f => f.variants.map(v => v.sku)))
      const singleCoffeeProducts = coffeeProducts.filter(p => !familySkus.has(p.sku))

      console.log('🏗️ Family view transformation:', {
        totalFiltered: baseFilteredProducts.length,
        coffeeProducts: coffeeProducts.length,
        coffeeFamilies: coffeeFamilies.length,
        singleCoffeeProducts: singleCoffeeProducts.length,
        nonCoffeeProducts: nonCoffeeProducts.length
      })
      
      // Return mixed array: families (for multi-variant coffee) + singles + individual products (for non-coffee)
      return [
        ...coffeeFamilies.map(family => ({ ...family, isFamily: true, category: 'coffee-family' })),
        ...singleCoffeeProducts.map(product => ({ ...product, isFamily: false })),
        ...nonCoffeeProducts.map(product => ({ ...product, isFamily: false }))
      ]
    }
  }, [stagedProducts, searchTerm, categoryFilter, roastFilter, statusFilter, viewMode])

  // Legacy compatibility for places that expect filteredProducts
  const filteredProducts = displayData.flatMap((item: any) => 
    item.isFamily ? item.variants : [item]
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

  // ENHANCED: Visual debug handler with modal results
  const handleVisualDebug = useCallback(async (debugType: string) => {
    try {
      setIsDebugging(true)
      let result: DebugResult

      switch (debugType) {
        case 'blob-analysis':
          const blobStatus = await debugBlobStatus()
          result = {
            title: 'Blob Storage Analysis',
            status: blobStatus.blobExists ? 'success' : 'warning',
            details: {
              'Blob Files Found': blobStatus.blobExists ? 'Yes' : 'No',
              'Blob Size': `${blobStatus.blobSize} bytes`,
              'Last Modified': blobStatus.lastModified,
              'Line Count': blobStatus.lineCount,
              'Headers Found': blobStatus.headers,
              'Content Preview': blobStatus.contentPreview.substring(0, 500) + (blobStatus.contentPreview.length > 500 ? '...' : '')
            },
            timestamp: new Date().toISOString()
          }
          break

        case 'test-write':
          const writeTest = await testBlobWrite()
          result = {
            title: 'Blob Write Test',
            status: writeTest.success ? 'success' : 'error',
            details: writeTest.details,
            timestamp: new Date().toISOString()
          }
          break

        case 'cache-status':
          const cacheStatus = await checkCacheStatusAction()
          result = {
            title: 'Cache Status Check',
            status: cacheStatus.success ? 'success' : 'error',
            details: cacheStatus.details,
            timestamp: new Date().toISOString()
          }
          break

        case 'force-sync':
          const syncResult = await forceImmediateSyncAction()
          result = {
            title: 'Force Immediate Sync',
            status: syncResult.success ? 'success' : 'error',
            details: syncResult.details,
            timestamp: new Date().toISOString()
          }
          // Also refresh admin data after sync
          if (syncResult.success) {
            await handleForceRefresh()
          }
          break

        case 'featured-analysis':
          const featuredResponse = await fetch('/api/debug/featured-analysis', { method: 'POST' })
          const featuredData = await featuredResponse.json()
          
          if (!featuredResponse.ok) {
            throw new Error(featuredData.error || 'Featured analysis failed')
          }
          
          result = {
            title: 'Featured Items Analysis',
            status: featuredData.analysis.consistency.isConsistent ? 'success' : 'warning',
            details: {
              'Admin Featured Count': featuredData.analysis.admin.featuredCount,
              'Blob Featured Count': featuredData.analysis.blobStorage.featuredCount,
              'Front Page Featured Count': featuredData.analysis.frontPage?.featuredCount || 'N/A',
              'Data Consistency': featuredData.analysis.consistency.isConsistent ? '✅ Consistent' : '❌ Inconsistent',
              'Issues Found': featuredData.analysis.consistency.issues,
              'Admin Featured Products': featuredData.analysis.admin.featuredProducts,
              'Blob Featured Products': featuredData.analysis.blobStorage.featuredProducts,
              'Boolean Conversion Issues': featuredData.analysis.blobStorage.booleanConversionIssues,
              'CSV Analysis': featuredData.analysis.blobStorage.csvAnalysis,
              'Recommendations': featuredData.analysis.recommendations
            },
            timestamp: new Date().toISOString()
          }
          break

        default:
          throw new Error('Unknown debug type')
      }

      setDebugResult(result)
      setShowDebugModal(true)
      
      // Also show toast for quick feedback
      toast.success(`${result.title} completed - Click to view details`)

    } catch (error) {
      const errorResult: DebugResult = {
        title: 'Debug Operation Failed',
        status: 'error',
        details: { error: error instanceof Error ? error.message : String(error) },
        timestamp: new Date().toISOString()
      }
      setDebugResult(errorResult)
      setShowDebugModal(true)
      toast.error('Debug operation failed')
    } finally {
      setIsDebugging(false)
    }
  }, [handleForceRefresh])

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
          <Button 
            onClick={handleForceRefresh}
            variant="outline" 
            className="w-full sm:w-auto bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            disabled={saveState.isActive}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${saveState.isActive ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                disabled={saveState.isActive}
              >
                <Wrench className="mr-2 h-4 w-4" />
                Debug Tools
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleVisualDebug('blob-analysis')}>
                <Search className="mr-2 h-4 w-4" />
                Analyze Blob Storage
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleVisualDebug('test-write')}>
                <TestTube className="mr-2 h-4 w-4" />
                Test Blob Write
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleVisualDebug('cache-status')}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Check Cache Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleVisualDebug('force-sync')}>
                <Zap className="mr-2 h-4 w-4" />
                Force Immediate Sync
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleVisualDebug('featured-analysis')}>
                <Star className="mr-2 h-4 w-4" />
                Debug Featured Items
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleAddNewProduct('coffee')}>
                <Coffee className="mr-2 h-4 w-4" />
                Add Coffee Product
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNewFamily()}>
                <Package className="mr-2 h-4 w-4" />
                Coffee Family
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNewProduct('subscription')}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Add Subscription
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNewProduct('gift-set')}>
                <Gift className="mr-2 h-4 w-4" />
                Add Gift Bundle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNewProduct('general')}>
                <Package className="mr-2 h-4 w-4" />
                Add General Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ENHANCED: Professional Save & Deploy Interface - FIXED VISIBILITY */}
      {(hasUnsavedChanges || saveState.isActive || isDeployInProgress) && (
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

      {/* PHASE 3: View Toggle & Advanced Filters */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">View Mode:</span>
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode('family')}
                variant={viewMode === 'family' ? 'default' : 'outline'}
                size="sm"
                className={viewMode === 'family' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'border-blue-300 text-blue-700 hover:bg-blue-100'
                }
              >
                <Coffee className="h-3 w-3 mr-1" />
                👨‍👩‍👧‍👦 Family View
              </Button>
              <Button
                onClick={() => setViewMode('individual')}
                variant={viewMode === 'individual' ? 'default' : 'outline'}
                size="sm"
                className={viewMode === 'individual' 
                  ? 'bg-amber-600 text-white hover:bg-amber-700' 
                  : 'border-amber-300 text-amber-700 hover:bg-amber-100'
                }
              >
                <Package className="h-3 w-3 mr-1" />
                📦 Individual Items
              </Button>
            </div>
          </div>
          
          {/* View Mode Description */}
          <div className="text-xs text-gray-600 max-w-xs">
            {viewMode === 'family' 
              ? 'Coffee products grouped into families, others shown individually' 
              : 'All products shown as individual items (no family grouping)'
            }
          </div>
        </div>
        
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
              <option value="coffee-family">Coffee Family ({viewMode === 'family' ? displayData.filter((item: any) => item.isFamily && item.category === 'coffee-family').length : 0})</option>
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
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  aria-label="Select all products"
                />
              </TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-1/4">Product Name</TableHead>
              <TableHead className="w-32">Category</TableHead>
              <TableHead className="w-32">SKU</TableHead>
              <TableHead className="w-24">Price</TableHead>
              <TableHead className="w-24">Shipping (1st)</TableHead>
              <TableHead className="w-24">Shipping (Add'l)</TableHead>
              <TableHead className="w-20">Featured</TableHead>
              <TableHead className="w-40 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((item: any) => {
              if (item.isFamily) {
                // FAMILY ROW: Show coffee families with variant summary
                const family = item as ProductFamily & { isFamily: true }
                const baseProduct = family.base
                const variantCount = family.variants.length
                const formats = family.variants.map(v => v.formatCode).join(', ')
                const priceRange = family.variants.map(v => v.price)
                const minPrice = Math.min(...priceRange)
                const maxPrice = Math.max(...priceRange)
                const priceDisplay = minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
                
                return (
                  <TableRow key={family.familyKey} className="bg-blue-50 border-l-4 border-l-blue-400">
                    <TableCell>
                      <Checkbox
                        checked={family.variants.some(v => selectedSkus.includes(v.sku))}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            const newSkus = [...selectedSkus, ...family.variants.map(v => v.sku)]
                            setSelectedSkus([...new Set(newSkus)])
                          } else {
                            setSelectedSkus(prev => prev.filter(sku => !family.variants.some(v => v.sku === sku)))
                          }
                        }}
                        aria-label={`Select ${family.base.productName} family`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="default"
                          className="bg-blue-100 text-blue-800"
                        >
                          Family ({variantCount})
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold text-blue-900">{baseProduct.productName}</div>
                        <div className="text-sm text-blue-600">
                          {variantCount} variant{variantCount > 1 ? 's' : ''}: {formats}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CategoryDropdown 
                        item={family} 
                        onChange={handleFamilyCategoryChange}
                        isFamily={true}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {family.familyKey}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{priceDisplay}</TableCell>
                    <TableCell>
                      {baseProduct.shippingFirst ? formatPrice(baseProduct.shippingFirst) : "—"}
                    </TableCell>
                    <TableCell>
                      {baseProduct.shippingAdditional ? formatPrice(baseProduct.shippingAdditional) : "—"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={baseProduct.featured}
                        onCheckedChange={(checked) => {
                          // Update all variants in family
                          setStagedProducts(prev => 
                            prev.map(p => 
                              family.variants.some(v => v.sku === p.sku)
                                ? { ...p, featured: checked } 
                                : p
                            )
                          )
                        }}
                        disabled={isPending}
                        aria-label="Toggle family featured"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFamilyEdit(family)}
                          className="h-7 px-2 text-xs bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <Coffee className="h-3 w-3 mr-1" />
                          Edit Family
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => console.log('duplicate family', family.familyKey)}>
                              <Copy className="h-3 w-3 mr-2" />
                              Duplicate Family
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                if (confirm(`Delete entire ${baseProduct.productName} family (${variantCount} products)?`)) {
                                  setStagedProducts(prev => 
                                    prev.filter(p => !family.variants.some(v => v.sku === p.sku))
                                  )
                                }
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete Family
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              } else {
                // INDIVIDUAL PRODUCT ROW: Show non-coffee products normally
                const product = item as Product & { isFamily: false }
                
                return (
                  <TableRow key={product.sku} className={`${getCategoryStyle(product.category).row} transition-colors duration-200`}>
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
                    <TableCell>
                      <div className="space-y-1">
                        <Select
                          value={product.category || 'subscription'}
                          onValueChange={(newCategory) => handleCategoryChange(product.sku, newCategory)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="coffee">
                              <div className="flex items-center space-x-2">
                                <Coffee className="h-3 w-3" />
                                <span>Coffee</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="coffee-family">
                              <div className="flex items-center space-x-2">
                                <Coffee className="h-3 w-3" />
                                <span>Coffee Family</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="subscription">
                              <div className="flex items-center space-x-2">
                                <RefreshCw className="h-3 w-3" />
                                <span>Subscription</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="gift-set">
                              <div className="flex items-center space-x-2">
                                <Gift className="h-3 w-3" />
                                <span>Gift Set</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="equipment">
                              <div className="flex items-center space-x-2">
                                <Wrench className="h-3 w-3" />
                                <span>Equipment</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Badge 
                          variant={getCategoryVariant(product.category)}
                          className="text-xs px-1 py-0"
                        >
                          {getCategoryDisplayName(product.category)}
                        </Badge>
                      </div>
                    </TableCell>
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
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCategoryEdit(product)}
                          className="h-7 px-2 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          {getCategoryFormLabel(product.category)}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => console.log('duplicate', product.sku)}>
                              <Copy className="h-3 w-3 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingSku(product.sku)}>
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              }
            })}
          </TableBody>
        </Table>
      </div>
      {filteredProducts.length === 0 && <div className="text-center py-12 text-gray-500">No products found.</div>}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {activeFormType === 'coffee' && (
          <CoffeeProductForm
            product={editingProduct}
            onSubmit={handleUpdateProduct}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={isPending}
          />
        )}
        
        {activeFormType === 'subscription' && (
          <SubscriptionProductForm
            product={editingProduct}
            onSubmit={handleUpdateProduct}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={isPending}
          />
        )}
        
        {activeFormType === 'gift-set' && (
          <GiftBundleProductForm
            product={editingProduct}
            onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={isPending}
          />
        )}
        
        {activeFormType === 'general' && (
          <ProductForm
            product={editingProduct}
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
          />
        )}
      </Dialog>

      {/* Family Edit Dialog */}
      <Dialog open={isFamilyEditOpen} onOpenChange={setIsFamilyEditOpen}>
        {editingFamily && (
          <FamilyEditForm
            family={editingFamily}
            onSubmit={handleFamilyUpdate}
            onCancel={() => setIsFamilyEditOpen(false)}
            isSubmitting={isPending}
          />
        )}
      </Dialog>

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

      {/* Enhanced Debug Result Modal */}
      <DebugResultModal 
        result={debugResult}
        isOpen={showDebugModal}
        onClose={() => setShowDebugModal(false)}
      />
    </div>
  )
}
