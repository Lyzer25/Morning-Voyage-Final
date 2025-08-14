import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { RefreshCw, Package, DollarSign, Truck, Loader2, Megaphone } from 'lucide-react';

interface SubscriptionProductFormProps {
  product?: Product;
  onSubmit: (productData: Product) => boolean;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const SubscriptionProductForm: React.FC<SubscriptionProductFormProps> = ({
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
    category: 'subscription',
    
    // Enhanced Subscription fields (supporting both naming conventions)
    billingInterval: product?.billingInterval || product?.subscriptionInterval || 'monthly',
    deliveryFrequency: product?.deliveryFrequency || 'monthly',
    trialPeriodDays: product?.trialPeriodDays || product?.trialDays || 0,
    maxDeliveries: product?.maxDeliveries || undefined,
    enableNotificationBanner: product?.enableNotificationBanner || product?.notificationEnabled || false,
    notificationMessage: product?.notificationMessage || product?.notification || '',
    
    // Status fields
    featured: product?.featured || false,
    status: product?.status || 'active',
    inStock: product?.inStock !== false,
    
    // Shipping configuration
    shippingFirst: product?.shippingFirst || undefined,
    shippingAdditional: product?.shippingAdditional || undefined
  });

  // Keep form data in sync when the product prop changes (fixes stale data when editing multiple products)
  useEffect(() => {
    setFormData({
      sku: product?.sku || '',
      productName: product?.productName || '',
      description: product?.description || '',
      price: product?.price || 0,
      originalPrice: product?.originalPrice || undefined,
      category: 'subscription',
      billingInterval: product?.billingInterval || product?.subscriptionInterval || 'monthly',
      deliveryFrequency: product?.deliveryFrequency || 'monthly',
      trialPeriodDays: product?.trialPeriodDays || product?.trialDays || 0,
      maxDeliveries: product?.maxDeliveries || undefined,
      enableNotificationBanner: product?.enableNotificationBanner || product?.notificationEnabled || false,
      notificationMessage: product?.notificationMessage || product?.notification || '',
      featured: product?.featured || false,
      status: product?.status || 'active',
      inStock: product?.inStock !== false,
      shippingFirst: product?.shippingFirst || undefined,
      shippingAdditional: product?.shippingAdditional || undefined
    });
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Subscription-specific validation
      if (!formData.billingInterval) {
        throw new Error('Billing interval is required');
      }
      
      if (formData.trialPeriodDays < 0 || formData.trialPeriodDays > 90) {
        throw new Error('Trial period days must be between 0 and 90');
      }
      
      const productData: Product = {
        ...formData,
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

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 text-blue-600" />
          <span>{product ? 'Edit Subscription Product' : 'Add New Subscription'}</span>
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
                placeholder="SUB-COFFEE-MONTHLY"
                required
              />
            </div>
            <div>
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData(prev => ({...prev, productName: e.target.value}))}
                placeholder="Monthly Coffee Subscription"
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
              placeholder="Get a new bag of our finest coffee delivered to your door every month."
              rows={3}
              required
            />
          </div>
        </div>

        {/* Subscription-Specific Section */}
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Subscription Configuration
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="billingInterval">Billing Interval *</Label>
              <Select
                value={formData.billingInterval}
                onValueChange={(value) => setFormData(prev => ({...prev, billingInterval: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select billing interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="deliveryFrequency">Delivery Frequency</Label>
              <Select
                value={formData.deliveryFrequency}
                onValueChange={(value) => setFormData(prev => ({...prev, deliveryFrequency: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trialPeriodDays">Trial Period (days)</Label>
              <Input
                id="trialPeriodDays"
                type="number"
                min="0"
                max="90"
                value={formData.trialPeriodDays}
                onChange={(e) => setFormData(prev => ({...prev, trialPeriodDays: parseInt(e.target.value) || 0}))}
                placeholder="7"
              />
              <p className="text-xs text-gray-500 mt-1">0 = No trial period</p>
            </div>
            
            <div>
              <Label htmlFor="maxDeliveries">Max Deliveries (optional)</Label>
              <Input
                id="maxDeliveries"
                type="number"
                min="1"
                value={formData.maxDeliveries || ''}
                onChange={(e) => setFormData(prev => ({...prev, maxDeliveries: e.target.value ? parseInt(e.target.value) : undefined}))}
                placeholder="12"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
            </div>
          </div>
        </div>

        {/* Promotional Section */}
        <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h3 className="font-semibold text-orange-800 flex items-center">
            <Megaphone className="h-4 w-4 mr-2" />
            Promotional Features
          </h3>
          
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="enableNotificationBanner"
              checked={formData.enableNotificationBanner}
              onCheckedChange={(checked) => setFormData(prev => ({...prev, enableNotificationBanner: Boolean(checked)}))}
            />
            <Label htmlFor="enableNotificationBanner" className="text-sm">
              Enable promotional notification banner
            </Label>
          </div>
          
          {formData.enableNotificationBanner && (
            <div>
              <Label htmlFor="notificationMessage">Notification Message</Label>
              <Input
                id="notificationMessage"
                value={formData.notificationMessage}
                onChange={(e) => setFormData(prev => ({...prev, notificationMessage: e.target.value}))}
                placeholder="$10 off your first month!"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">
                Will appear as an eye-catching banner on subscription cards (60 chars max)
              </p>
            </div>
          )}
        </div>

        {/* Pricing & Status Section */}
        <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-800 flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Pricing & Status
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Current Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({...prev, price: parseFloat(e.target.value) || 0}))}
                placeholder="49.99"
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
                placeholder="59.99"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData(prev => ({...prev, featured: Boolean(checked)}))}
              />
              <Label htmlFor="featured" className="text-sm">Featured Product</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={formData.inStock}
                onCheckedChange={(checked) => setFormData(prev => ({...prev, inStock: Boolean(checked)}))}
              />
              <Label htmlFor="inStock" className="text-sm">In Stock</Label>
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

        {/* Shipping Section */}
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 flex items-center">
            <Truck className="h-4 w-4 mr-2" />
            Shipping Configuration
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shippingFirst">First Item Shipping Cost</Label>
              <Input
                id="shippingFirst"
                type="number"
                step="0.01"
                value={formData.shippingFirst}
                onChange={(e) => setFormData(prev => ({...prev, shippingFirst: parseFloat(e.target.value) || 0}))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="shippingAdditional">Additional Item Shipping</Label>
              <Input
                id="shippingAdditional"
                type="number"
                step="0.01"
                value={formData.shippingAdditional}
                onChange={(e) => setFormData(prev => ({...prev, shippingAdditional: parseFloat(e.target.value) || 0}))}
                placeholder="0.00"
              />
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Subscription...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {product ? 'Update Subscription' : 'Add Subscription'}
              </>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}
