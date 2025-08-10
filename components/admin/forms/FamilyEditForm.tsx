import { useState, useCallback, useMemo } from 'react';
import { Product, ProductImage } from '@/lib/types';
import { ProductFamily } from '@/lib/family-grouping';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Coffee, Package, DollarSign, Truck, Loader2, AlertTriangle, Check, Upload, Image as ImageIcon, X, Camera, Grid3X3 } from 'lucide-react';
import { uploadProductImages, validateImageFiles } from '@/lib/blob-storage';

interface FamilyEditFormProps {
  family: ProductFamily;
  onSubmit: (updatedProducts: Product[]) => boolean;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  variants?: string[];
}

export const FamilyEditForm: React.FC<FamilyEditFormProps> = ({
  family,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [editMode, setEditMode] = useState<'family' | 'individual'>('family');
  
  // Family-wide properties (shared across all variants)
  const [familyData, setFamilyData] = useState({
    productName: family.base.productName,
    description: family.base.description,
    roastLevel: family.base.roastLevel || 'medium',
    origin: family.base.origin || '',
    tastingNotes: Array.isArray(family.base.tastingNotes) 
      ? family.base.tastingNotes.join(', ') 
      : family.base.tastingNotes || '',
    featured: family.base.featured || false,
    status: family.base.status || 'active',
    category: 'coffee'
  });

  // Individual variant data
  const [variantData, setVariantData] = useState<{ [sku: string]: Product }>(() => {
    const variants: { [sku: string]: Product } = {};
    family.variants.forEach(variant => {
      variants[variant.sku] = { ...variant };
    });
    return variants;
  });

  // Image upload state management
  const [images, setImages] = useState<{
    thumbnail?: File | string
    main?: File | string  
    gallery: (File | string)[]
  }>({
    thumbnail: family.base.images?.find(img => img.type === 'thumbnail')?.url,
    main: family.base.images?.find(img => img.type === 'main')?.url,
    gallery: family.base.images?.filter(img => img.type === 'gallery').sort((a, b) => a.order - b.order).map(img => img.url) || []
  });

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false);

  // Validation system
  const validationIssues = useMemo((): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];
    const variants = Object.values(variantData);
    
    // Check for inconsistent family properties across variants
    const firstVariant = variants[0];
    if (!firstVariant) return issues;
    
    // Product name consistency
    const inconsistentNames = variants.filter(v => v.productName !== firstVariant.productName);
    if (inconsistentNames.length > 0) {
      issues.push({
        field: 'productName',
        message: 'Product names are inconsistent across variants',
        severity: 'error',
        variants: inconsistentNames.map(v => v.sku)
      });
    }
    
    // Roast level consistency
    const inconsistentRoast = variants.filter(v => v.roastLevel !== firstVariant.roastLevel);
    if (inconsistentRoast.length > 0) {
      issues.push({
        field: 'roastLevel',
        message: 'Roast levels should be consistent for family',
        severity: 'warning',
        variants: inconsistentRoast.map(v => v.sku)
      });
    }
    
    // Price range validation
    const prices = variants.map(v => v.price).filter(p => p > 0);
    if (prices.length > 1) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceVariation = (maxPrice - minPrice) / minPrice;
      
      if (priceVariation > 0.5) { // More than 50% price variation
        issues.push({
          field: 'price',
          message: `Large price variation detected (${((priceVariation * 100)).toFixed(0)}%)`,
          severity: 'warning'
        });
      }
    }
    
    // SKU uniqueness
    const skus = variants.map(v => v.sku);
    const duplicateSkus = skus.filter((sku, index) => skus.indexOf(sku) !== index);
    if (duplicateSkus.length > 0) {
      issues.push({
        field: 'sku',
        message: 'Duplicate SKUs detected',
        severity: 'error'
      });
    }
    
    return issues;
  }, [variantData]);

  // Apply family-wide changes to all variants
  const applyFamilyChangesToVariants = useCallback(() => {
    const processedTastingNotes = familyData.tastingNotes
      .split(',')
      .map(note => note.trim())
      .filter(note => note.length > 0);
      
    setVariantData(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(sku => {
        updated[sku] = {
          ...updated[sku],
          productName: familyData.productName,
          description: familyData.description,
          roastLevel: familyData.roastLevel,
          origin: familyData.origin,
          tastingNotes: processedTastingNotes,
          featured: familyData.featured,
          status: familyData.status,
          category: 'coffee',
          updatedAt: new Date()
        };
      });
      return updated;
    });
  }, [familyData]);

  // Update individual variant
  const updateVariant = useCallback((sku: string, updates: Partial<Product>) => {
    setVariantData(prev => ({
      ...prev,
      [sku]: {
        ...prev[sku],
        ...updates,
        updatedAt: new Date()
      }
    }));
  }, []);

  // Image upload handlers
  const handleImageUpload = useCallback(async (
    files: File[], 
    type: 'thumbnail' | 'main' | 'gallery'
  ) => {
    if (files.length === 0) return;

    // Validate files
    const validation = validateImageFiles(files);
    if (!validation.valid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));

      console.log(`📸 Starting ${type} image upload:`, files.length, 'files');

      // Upload to blob storage
      const uploadedImages = await uploadProductImages(files);
      
      console.log(`✅ ${type} images uploaded:`, uploadedImages.map(img => img.url));

      // Update image state based on type
      if (type === 'thumbnail' && uploadedImages[0]) {
        setImages(prev => ({ ...prev, thumbnail: uploadedImages[0].url }));
        toast.success('Thumbnail image uploaded successfully!');
      } else if (type === 'main' && uploadedImages[0]) {
        setImages(prev => ({ ...prev, main: uploadedImages[0].url }));
        toast.success('Main product image uploaded successfully!');
      } else if (type === 'gallery') {
        setImages(prev => ({ 
          ...prev, 
          gallery: [...prev.gallery, ...uploadedImages.map(img => img.url)] 
        }));
        toast.success(`${uploadedImages.length} gallery image(s) uploaded successfully!`);
      }

      setUploadProgress(prev => ({ ...prev, [type]: 100 }));
    } catch (error) {
      console.error(`❌ ${type} image upload failed:`, error);
      toast.error(`Failed to upload ${type} image(s): ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      }, 2000);
    }
  }, []);

  const removeImage = useCallback((type: 'thumbnail' | 'main' | 'gallery', index?: number) => {
    if (type === 'gallery' && typeof index === 'number') {
      setImages(prev => ({
        ...prev,
        gallery: prev.gallery.filter((_, i) => i !== index)
      }));
    } else {
      setImages(prev => ({ ...prev, [type]: undefined }));
    }
    toast.success(`${type === 'gallery' ? 'Gallery image' : type + ' image'} removed`);
  }, []);

  const reorderGalleryImages = useCallback((startIndex: number, endIndex: number) => {
    setImages(prev => {
      const newGallery = [...prev.gallery];
      const [removed] = newGallery.splice(startIndex, 1);
      newGallery.splice(endIndex, 0, removed);
      return { ...prev, gallery: newGallery };
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Check for validation errors
      const errors = validationIssues.filter(issue => issue.severity === 'error');
      if (errors.length > 0) {
        toast.error(`Cannot save: ${errors.length} validation error(s). Please fix them first.`);
        return;
      }
      
      // Apply family changes in family mode
      if (editMode === 'family') {
        applyFamilyChangesToVariants();
      }
      
      // Convert variant data to array
      let updatedProducts = Object.values(variantData);
      
      // Process and apply family images to all variants
      const familyImages: ProductImage[] = [];
      
      // Add thumbnail image
      if (images.thumbnail) {
        familyImages.push({
          id: crypto.randomUUID(),
          url: typeof images.thumbnail === 'string' ? images.thumbnail : images.thumbnail.name,
          alt: `${familyData.productName} thumbnail`,
          type: 'thumbnail',
          order: 0
        });
      }
      
      // Add main product image  
      if (images.main) {
        familyImages.push({
          id: crypto.randomUUID(),
          url: typeof images.main === 'string' ? images.main : images.main.name,
          alt: `${familyData.productName} main image`,
          type: 'main',
          order: 1
        });
      }
      
      // Add gallery images
      images.gallery.forEach((image, index) => {
        familyImages.push({
          id: crypto.randomUUID(),
          url: typeof image === 'string' ? image : image.name,
          alt: `${familyData.productName} gallery ${index + 1}`,
          type: 'gallery',
          order: index + 2
        });
      });
      
      // Apply family images to all variants
      if (familyImages.length > 0) {
        console.log('📸 Applying family images to all variants:', {
          imageCount: familyImages.length,
          variants: updatedProducts.length,
          images: familyImages.map(img => ({ type: img.type, url: img.url }))
        });
        
        updatedProducts = updatedProducts.map(product => ({
          ...product,
          images: familyImages,
          updatedAt: new Date()
        }));
      }
      
      // Validate required fields
      const missingData = updatedProducts.filter(p => !p.productName || !p.sku || p.price <= 0);
      if (missingData.length > 0) {
        toast.error(`Missing required data for ${missingData.length} variant(s)`);
        return;
      }
      
      console.log('🏗️ FamilyEditForm submitting family update:', {
        familyKey: family.familyKey,
        editMode,
        variantCount: updatedProducts.length,
        familyData,
        familyImages: familyImages.length,
        validationIssues: validationIssues.length,
        updatedProducts: updatedProducts.map(p => ({
          sku: p.sku,
          productName: p.productName,
          price: p.price,
          format: p.format,
          imageCount: p.images?.length || 0
        }))
      });
      
      const success = onSubmit(updatedProducts);
      if (success) {
        toast.success(`Family "${familyData.productName}" updated successfully with ${familyImages.length} shared images!`);
        onCancel();
      }
    } catch (error: any) {
      console.error('❌ FamilyEditForm submission error:', error);
      toast.error(error.message || 'Failed to update family');
    }
  };

  return (
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Coffee className="h-5 w-5 text-blue-600" />
          <span>Edit Coffee Family</span>
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Family Header - Blue Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-blue-900 flex items-center">
                <Coffee className="h-4 w-4 mr-2" />
                {familyData.productName || family.base.productName} Family
              </h3>
              <p className="text-sm text-blue-600">
                {family.variants.length} variants: {family.variants.map(v => v.formatCode).join(', ')}
              </p>
            </div>
            
            {/* Validation Status */}
            <div className="flex items-center gap-2">
              {validationIssues.length > 0 ? (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {validationIssues.filter(i => i.severity === 'error').length} errors, 
                  {validationIssues.filter(i => i.severity === 'warning').length} warnings
                </Badge>
              ) : (
                <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Valid
                </Badge>
              )}
            </div>
          </div>
          
          {/* Mode Toggle Buttons */}
          <div className="flex gap-2">
            <Button 
              type="button"
              variant={editMode === 'family' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditMode('family')}
              className={editMode === 'family' 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'border-blue-300 text-blue-700 hover:bg-blue-100'
              }
            >
              <Coffee className="h-3 w-3 mr-1" />
              Edit Entire Family
            </Button>
            <Button 
              type="button"
              variant={editMode === 'individual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditMode('individual')}
              className={editMode === 'individual' 
                ? 'bg-amber-600 text-white hover:bg-amber-700' 
                : 'border-amber-300 text-amber-700 hover:bg-amber-100'
              }
            >
              <Package className="h-3 w-3 mr-1" />
              Edit Individual Variants
            </Button>
          </div>
          
          <p className="text-xs text-blue-600 mt-2">
            {editMode === 'family' 
              ? 'Changes will apply to all variants in this family' 
              : 'Edit each variant independently. Family properties are synchronized.'
            }
          </p>
        </div>

        {/* Validation Issues Display */}
        {validationIssues.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Validation Issues
            </h4>
            <div className="space-y-2">
              {validationIssues.map((issue, index) => (
                <div 
                  key={index}
                  className={`text-sm p-2 rounded ${
                    issue.severity === 'error' 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                  }`}
                >
                  <strong>{issue.field}:</strong> {issue.message}
                  {issue.variants && (
                    <div className="text-xs mt-1">
                      Affected variants: {issue.variants.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Family Mode - Single Form for Shared Properties */}
        {editMode === 'family' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Coffee className="h-4 w-4 mr-2" />
                Family Properties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="family-productName">Product Name *</Label>
                  <Input
                    id="family-productName"
                    value={familyData.productName}
                    onChange={(e) => setFamilyData(prev => ({...prev, productName: e.target.value}))}
                    placeholder="Colombian Single Origin"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="family-roastLevel">Roast Level *</Label>
                  <Select
                    value={familyData.roastLevel}
                    onValueChange={(value) => setFamilyData(prev => ({...prev, roastLevel: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light Roast</SelectItem>
                      <SelectItem value="medium">Medium Roast</SelectItem>
                      <SelectItem value="medium-dark">Medium-Dark Roast</SelectItem>
                      <SelectItem value="dark">Dark Roast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="family-description">Description *</Label>
                <Textarea
                  id="family-description"
                  value={familyData.description}
                  onChange={(e) => setFamilyData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Rich, full-bodied coffee with notes of chocolate and caramel..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="family-origin">Origin</Label>
                  <Input
                    id="family-origin"
                    value={familyData.origin}
                    onChange={(e) => setFamilyData(prev => ({...prev, origin: e.target.value}))}
                    placeholder="Colombia, Guatemala, Ethiopia..."
                  />
                </div>
                <div>
                  <Label htmlFor="family-tastingNotes">Tasting Notes</Label>
                  <Input
                    id="family-tastingNotes"
                    value={familyData.tastingNotes}
                    onChange={(e) => setFamilyData(prev => ({...prev, tastingNotes: e.target.value}))}
                    placeholder="Chocolate, Caramel, Nuts (comma-separated)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="family-featured"
                    checked={familyData.featured}
                    onCheckedChange={(checked) => setFamilyData(prev => ({...prev, featured: Boolean(checked)}))}
                  />
                  <Label htmlFor="family-featured" className="text-sm">Featured Family</Label>
                </div>
                
                <div>
                  <Label htmlFor="family-status" className="text-sm">Status</Label>
                  <Select
                    value={familyData.status}
                    onValueChange={(value) => setFamilyData(prev => ({...prev, status: value as 'active' | 'draft' | 'archived'}))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Individual Mode - Grid of Variant Forms */}
        {editMode === 'individual' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {family.variants.map((variant) => {
                const variantState = variantData[variant.sku] || variant;
                
                return (
                  <Card key={variant.sku} className="relative">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={`${
                              variant.format === 'whole-bean' ? 'bg-amber-100 text-amber-800' :
                              variant.format === 'ground' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {variant.formatCode}
                          </Badge>
                          <span>{variant.weight}</span>
                        </div>
                        <span className="text-xs text-gray-500">{variant.sku}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Variant-Specific Fields */}
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">Format</Label>
                          <Select
                            value={variantState.format}
                            onValueChange={(value) => updateVariant(variant.sku, { format: value })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="whole-bean">Whole Bean</SelectItem>
                              <SelectItem value="ground">Ground</SelectItem>
                              <SelectItem value="instant">Instant</SelectItem>
                              <SelectItem value="pods">Pods</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs">Weight/Size</Label>
                          <Input
                            className="h-8 text-xs"
                            value={variantState.weight || ''}
                            onChange={(e) => updateVariant(variant.sku, { weight: e.target.value })}
                            placeholder="12oz, 1lb..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Price *</Label>
                            <Input
                              className="h-8 text-xs"
                              type="number"
                              step="0.01"
                              value={variantState.price || ''}
                              onChange={(e) => updateVariant(variant.sku, { price: parseFloat(e.target.value) || 0 })}
                              placeholder="19.99"
                              required
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Original</Label>
                            <Input
                              className="h-8 text-xs"
                              type="number"
                              step="0.01"
                              value={variantState.originalPrice || ''}
                              onChange={(e) => updateVariant(variant.sku, { 
                                originalPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                              })}
                              placeholder="24.99"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Ship (1st)</Label>
                            <Input
                              className="h-8 text-xs"
                              type="number"
                              step="0.01"
                              value={variantState.shippingFirst || ''}
                              onChange={(e) => updateVariant(variant.sku, { 
                                shippingFirst: e.target.value ? parseFloat(e.target.value) : undefined 
                              })}
                              placeholder="5.99"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Ship (Add'l)</Label>
                            <Input
                              className="h-8 text-xs"
                              type="number"
                              step="0.01"
                              value={variantState.shippingAdditional || ''}
                              onChange={(e) => updateVariant(variant.sku, { 
                                shippingAdditional: e.target.value ? parseFloat(e.target.value) : undefined 
                              })}
                              placeholder="2.99"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Shared Properties (Read-Only in Individual Mode) */}
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Shared Properties (edit in Family mode):</p>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600">Name: {familyData.productName}</p>
                          <p className="text-xs text-gray-600">Roast: {familyData.roastLevel}</p>
                          <p className="text-xs text-gray-600">Origin: {familyData.origin || 'Not set'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Sync Button for Individual Mode */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Family Property Synchronization</p>
                    <p className="text-xs text-blue-600">
                      Keep shared properties (name, roast, origin, tasting notes) consistent across all variants
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={applyFamilyChangesToVariants}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Coffee className="h-3 w-3 mr-1" />
                    Sync Properties
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* NEW: Family Image Upload System */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Camera className="h-4 w-4 mr-2" />
              Family Images
            </CardTitle>
            <p className="text-sm text-blue-600">
              Manage images for the entire family. These images will be used across all product variants.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Section 1: Thumbnail Image */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Thumbnail Image</Label>
              <p className="text-xs text-gray-600">Used in product grids and search results</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                {images.thumbnail ? (
                  <div className="relative">
                    <img 
                      src={typeof images.thumbnail === 'string' ? images.thumbnail : URL.createObjectURL(images.thumbnail)}
                      alt="Thumbnail preview"
                      className="w-32 h-32 object-cover rounded-md mx-auto"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage('thumbnail')}
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Grid3X3 className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) handleImageUpload(files.slice(0, 1), 'thumbnail');
                        }}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <Label
                        htmlFor="thumbnail-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Thumbnail
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Optimal for grid display</p>
                  </div>
                )}
                
                {uploadProgress.thumbnail > 0 && (
                  <div className="mt-2">
                    <Progress value={uploadProgress.thumbnail} className="w-full" />
                    <p className="text-xs text-gray-600 mt-1">Uploading... {uploadProgress.thumbnail}%</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Main Product Image */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Main Product Image</Label>
              <p className="text-xs text-gray-600">Hero image displayed on product detail page</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                {images.main ? (
                  <div className="relative">
                    <img 
                      src={typeof images.main === 'string' ? images.main : URL.createObjectURL(images.main)}
                      alt="Main product preview"
                      className="w-48 h-48 object-cover rounded-md mx-auto"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage('main')}
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-16 w-16 text-gray-400" />
                    <div className="mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) handleImageUpload(files.slice(0, 1), 'main');
                        }}
                        className="hidden"
                        id="main-upload"
                      />
                      <Label
                        htmlFor="main-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Choose Main Image
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">High-quality hero image</p>
                  </div>
                )}
                
                {uploadProgress.main > 0 && (
                  <div className="mt-2">
                    <Progress value={uploadProgress.main} className="w-full" />
                    <p className="text-xs text-gray-600 mt-1">Uploading... {uploadProgress.main}%</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Gallery Images */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Gallery Images</Label>
              <p className="text-xs text-gray-600">Additional photos for product page carousel (max 8)</p>
              
              {images.gallery.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {images.gallery.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage('gallery', index)}
                        className="absolute -top-2 -right-2 w-5 h-5 p-0 rounded-full"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                <div className="text-center">
                  <Grid3X3 className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          const remainingSlots = 8 - images.gallery.length;
                          const filesToUpload = files.slice(0, remainingSlots);
                          if (filesToUpload.length < files.length) {
                            toast.warning(`Only uploading ${filesToUpload.length} images. Gallery limit is 8 total.`);
                          }
                          handleImageUpload(filesToUpload, 'gallery');
                        }
                      }}
                      className="hidden"
                      id="gallery-upload"
                      disabled={images.gallery.length >= 8}
                    />
                    <Label
                      htmlFor="gallery-upload"
                      className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                        images.gallery.length >= 8 
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {images.gallery.length >= 8 ? 'Gallery Full' : 'Add Gallery Images'}
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {images.gallery.length}/8 images • Multiple selection supported
                  </p>
                </div>
                
                {uploadProgress.gallery > 0 && (
                  <div className="mt-2">
                    <Progress value={uploadProgress.gallery} className="w-full" />
                    <p className="text-xs text-gray-600 mt-1">Uploading gallery... {uploadProgress.gallery}%</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Status */}
            {isUploading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-blue-800">Uploading images...</span>
                </div>
              </div>
            )}
            
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || validationIssues.some(issue => issue.severity === 'error')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Family...
              </>
            ) : (
              <>
                <Coffee className="mr-2 h-4 w-4" />
                Update Family ({family.variants.length} variants)
              </>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};
