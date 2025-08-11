import { useState } from 'react';
import { Product, BundleItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Gift, Package, Plus, Trash2, DollarSign, Loader2 } from 'lucide-react';

interface GiftBundleProductFormProps {
  product?: Product;
  onSubmit: (productData: Product) => boolean;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const GiftBundleProductForm: React.FC<GiftBundleProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    sku: product?.sku || '',
    productName: product?.productName || '',
    description: product?.description || '',
    price: product?.price || 0,
    originalPrice: product?.originalPrice || undefined,
    category: 'gift-set',
    
    // Gift Bundle specific fields
    bundleType: product?.bundleType || 'custom-selection',
    bundleDescription: product?.bundleDescription || '',
    giftMessage: product?.giftMessage || '',
    packagingType: product?.packagingType || 'standard',
    seasonalAvailability: product?.seasonalAvailability || '',
    
    // Status fields
    featured: product?.featured || false,
    status: product?.status || 'active',
    inStock: product?.inStock !== false,
    
    // Shipping configuration
    shippingFirst: product?.shippingFirst || undefined,
    shippingAdditional: product?.shippingAdditional || undefined
  });

  const [bundleContents, setBundleContents] = useState<BundleItem[]>(
    product?.bundleContents || [{ sku: '', productName: '', quantity: 1, unitPrice: 0, notes: '' }]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Gift bundle validation
      if (bundleContents.length === 0 || !bundleContents.some(item => item.sku)) {
        throw new Error('Bundle must contain at least one item with a valid SKU');
      }
      
      // Validate bundle items
      const validItems = bundleContents.filter(item => item.sku && item.quantity > 0);
      if (validItems.length === 0) {
        throw new Error('Bundle must contain at least one valid item');
      }
      
      const productData: Product = {
        ...formData,
        bundleContents: validItems,
        id: product?.id || crypto.randomUUID(),
        createdAt: product?.createdAt || new Date(),
        updatedAt: new Date(),
        images: product?.images || []
      };
      
      const success = onSubmit(productData);
      if (success) {
        onCancel();
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const addBundleItem = () => {
    setBundleContents(prev => [...prev, { sku: '', productName: '', quantity: 1, unitPrice: 0, notes: '' }]);
  };

  const removeBundleItem = (index: number) => {
    if (bundleContents.length > 1) {
      setBundleContents(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateBundleItem = (index: number, field: keyof BundleItem, value: any) => {
    setBundleContents(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const calculateBundleTotal = () => {
    return bundleContents.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const calculateSavings = () => {
    const bundleTotal = calculateBundleTotal();
    const bundlePrice = formData.price || 0;
    return Math.max(0, bundleTotal - bundlePrice);
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Gift className="h-5 w-5 text-green-600" />
          <span>{product ? 'Edit Gift Bundle' : 'Add New Gift Bundle'}</span>
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({...prev, sku: e.target.value}))}
                placeholder="GIFT-STARTER-PACK"
                required
              />
            </div>
            <div>
              <Label htmlFor="productName">Bundle Name *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData(prev => ({...prev, productName: e.target.value}))}
                placeholder="Coffee Lover's Starter Pack"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              placeholder="Perfect introduction to our finest coffees with everything needed to get started."
              rows={3}
              required
            />
          </div>
        </div>

        {/* Bundle Configuration Section */}
        <div className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-amber-800 flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Bundle Configuration
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="bundleType">Bundle Type</Label>
              <Select
                value={formData.bundleType}
                onValueChange={(value) => setFormData(prev => ({...prev, bundleType: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bundle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter-pack">Starter Pack</SelectItem>
                  <SelectItem value="premium-bundle">Premium Bundle</SelectItem>
                  <SelectItem value="custom-selection">Custom Selection</SelectItem>
                  <SelectItem value="seasonal-gift">Seasonal Gift</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="packagingType">Packaging Type</Label>
              <Select
                value={formData.packagingType}
                onValueChange={(value) => setFormData(prev => ({...prev, packagingType: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select packaging" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Packaging</SelectItem>
                  <SelectItem value="premium">Premium Packaging</SelectItem>
                  <SelectItem value="gift-box">Gift Box</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bundle Contents Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Bundle Contents</Label>
              <Button type="button" variant="outline" size="sm" onClick={addBundleItem}>
                <Plus className="h-3 w-3 mr-1" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {bundleContents.map((item, index) => (
                <Card key={index} className="border border-amber-200">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                      <div className="space-y-1">
                        <Label className="text-xs">Product SKU *</Label>
                        <Input
                          value={item.sku}
                          onChange={(e) => updateBundleItem(index, 'sku', e.target.value)}
                          placeholder="COFFEE-COLOMBIA-12OZ-WB"
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Product Name</Label>
                        <Input
                          value={item.productName}
                          onChange={(e) => updateBundleItem(index, 'productName', e.target.value)}
                          placeholder="Colombia Single Origin"
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateBundleItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Unit Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateBundleItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Notes</Label>
                        <Input
                          value={item.notes || ''}
                          onChange={(e) => updateBundleItem(index, 'notes', e.target.value)}
                          placeholder="Optional notes"
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBundleItem(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={bundleContents.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-2">
                      Subtotal: ${(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Bundle Pricing Summary */}
            <div className="p-4 bg-amber-100 rounded border border-amber-300">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-amber-900">Bundle Contents Total:</span>
                  <span className="font-bold text-amber-900">${calculateBundleTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-amber-900">Bundle Price:</span>
                  <span className="font-bold text-amber-900">${(formData.price || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-amber-400 pt-2">
                  <span className="font-bold text-amber-900">Customer Savings:</span>
                  <span className="font-bold text-green-700">${calculateSavings().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gift Features Section */}
        <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-900 flex items-center">
            <Gift className="h-4 w-4 mr-2" />
            Gift Features
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="giftMessage">Gift Message Template</Label>
              <Textarea
                id="giftMessage"
                value={formData.giftMessage}
                onChange={(e) => setFormData(prev => ({...prev, giftMessage: e.target.value}))}
                placeholder="Perfect gift for coffee lovers! Includes our finest selections..."
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="seasonalAvailability">Seasonal Availability</Label>
              <Input
                id="seasonalAvailability"
                value={formData.seasonalAvailability}
                onChange={(e) => setFormData(prev => ({...prev, seasonalAvailability: e.target.value}))}
                placeholder="e.g., Holiday Season, Year-round, Spring Collection"
              />
            </div>
            
            <div>
              <Label htmlFor="bundleDescription">Special Bundle Description</Label>
              <Textarea
                id="bundleDescription"
                value={formData.bundleDescription}
                onChange={(e) => setFormData(prev => ({...prev, bundleDescription: e.target.value}))}
                placeholder="Additional description specific to this bundle configuration..."
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Pricing & Status Section */}
        <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-800 flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Pricing & Status
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Bundle Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({...prev, price: parseFloat(e.target.value) || 0}))}
                placeholder="89.99"
                required
              />
            </div>
            <div>
              <Label htmlFor="originalPrice">Original Price (optional)</Label>
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                value={formData.originalPrice || ''}
                onChange={(e) => setFormData(prev => ({...prev, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined}))}
                placeholder="109.99"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData(prev => ({...prev, featured: Boolean(checked)}))}
              />
              <Label htmlFor="featured" className="text-sm">Featured Bundle</Label>
            </div>
            
            <div>
              <Label htmlFor="status" className="text-sm">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({...prev, status: value as 'active' | 'draft' | 'archived'}))}
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
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Gift Bundle...
              </>
            ) : (
              <>
                <Gift className="mr-2 h-4 w-4" />
                {product ? 'Update Gift Bundle' : 'Add Gift Bundle'}
              </>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};
