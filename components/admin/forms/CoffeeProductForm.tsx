import { useState } from 'react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Coffee, Package, DollarSign, Truck, Loader2 } from 'lucide-react';

interface CoffeeProductFormProps {
  product?: Product;
  onSubmit: (productData: Product) => boolean;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CoffeeProductForm: React.FC<CoffeeProductFormProps> = ({
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
    category: 'coffee',
    
    // Coffee-specific fields
    roastLevel: product?.roastLevel || 'medium',
    origin: product?.origin || '',
    format: product?.format || 'whole-bean',
    weight: product?.weight || '12oz',
    tastingNotes: Array.isArray(product?.tastingNotes) 
      ? product.tastingNotes.join(', ') 
      : product?.tastingNotes || '',
    
    // Status fields
    featured: product?.featured || false,
    status: product?.status || 'active',
    inStock: product?.inStock !== false, // Default to true
    
    // Shipping fields  
    shippingFirst: product?.shippingFirst || undefined,
    shippingAdditional: product?.shippingAdditional || undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Coffee-specific validation
      if (!formData.roastLevel) {
        throw new Error('Roast level is required for coffee products');
      }
      
      // Process tasting notes
      const processedTastingNotes = formData.tastingNotes
        .split(',')
        .map(note => note.trim())
        .filter(note => note.length > 0);
      
      const productData: Product = {
        ...formData,
        id: product?.id || crypto.randomUUID(),
        tastingNotes: processedTastingNotes,
        createdAt: product?.createdAt || new Date(),
        updatedAt: new Date(),
        images: product?.images || []
      };
      
      const success = onSubmit(productData);
      if (success) {
        onCancel(); // Close form on success
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Coffee className="h-5 w-5 text-amber-600" />
          <span>{product ? 'Edit Coffee Product' : 'Add New Coffee Product'}</span>
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
                placeholder="COFFEE-ORIGIN-SIZE-FORMAT"
                required
              />
            </div>
            <div>
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData(prev => ({...prev, productName: e.target.value}))}
                placeholder="Colombian Single Origin"
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
              placeholder="Rich, full-bodied coffee with notes of chocolate and caramel..."
              rows={3}
              required
            />
          </div>
        </div>

        {/* Coffee-Specific Section */}
        <div className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-amber-800 flex items-center">
            <Coffee className="h-4 w-4 mr-2" />
            Coffee Specifications
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="roastLevel">Roast Level *</Label>
              <Select
                value={formData.roastLevel}
                onValueChange={(value) => setFormData(prev => ({...prev, roastLevel: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select roast level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light Roast</SelectItem>
                  <SelectItem value="medium">Medium Roast</SelectItem>
                  <SelectItem value="medium-dark">Medium-Dark Roast</SelectItem>
                  <SelectItem value="dark">Dark Roast</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(e) => setFormData(prev => ({...prev, origin: e.target.value}))}
                placeholder="Colombia, Guatemala, Ethiopia..."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="format">Format *</Label>
              <Select
                value={formData.format}
                onValueChange={(value) => setFormData(prev => ({...prev, format: value}))}
              >
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
            
            <div>
              <Label htmlFor="weight">Weight/Size</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({...prev, weight: e.target.value}))}
                placeholder="12oz, 1lb, 2.5oz..."
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="tastingNotes">Tasting Notes</Label>
            <Input
              id="tastingNotes"
              value={formData.tastingNotes}
              onChange={(e) => setFormData(prev => ({...prev, tastingNotes: e.target.value}))}
              placeholder="Chocolate, Caramel, Nuts (comma-separated)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter tasting notes separated by commas
            </p>
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
              <Label htmlFor="price">Current Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({...prev, price: parseFloat(e.target.value) || 0}))}
                placeholder="19.99"
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
                placeholder="24.99"
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
                value={formData.shippingFirst || ''}
                onChange={(e) => setFormData(prev => ({...prev, shippingFirst: e.target.value ? parseFloat(e.target.value) : undefined}))}
                placeholder="5.99"
              />
            </div>
            <div>
              <Label htmlFor="shippingAdditional">Additional Item Shipping</Label>
              <Input
                id="shippingAdditional"
                type="number"
                step="0.01"
                value={formData.shippingAdditional || ''}
                onChange={(e) => setFormData(prev => ({...prev, shippingAdditional: e.target.value ? parseFloat(e.target.value) : undefined}))}
                placeholder="2.99"
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
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Coffee Product...
              </>
            ) : (
              <>
                <Coffee className="mr-2 h-4 w-4" />
                {product ? 'Update Coffee Product' : 'Add Coffee Product'}
              </>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}
