"use client"

import { useState, useMemo } from 'react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { 
  ChevronDown, 
  ChevronRight, 
  Coffee, 
  Users, 
  Edit, 
  Copy, 
  Trash2, 
  MoreHorizontal,
  Package,
  DollarSign
} from 'lucide-react';
import { 
  VariantFamily, 
  groupProductsIntoFamilies, 
  generateVariantSuggestions 
} from '@/lib/variant-grouping';

interface VariantManagerProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onEditFamily: (family: VariantFamily) => void;
  onDeleteProduct: (sku: string) => void;
  onDuplicateProduct: (product: Product) => void;
}

export const VariantManager: React.FC<VariantManagerProps> = ({
  products,
  onEditProduct,
  onEditFamily,
  onDeleteProduct,
  onDuplicateProduct
}) => {
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());

  // Group products into families
  const families = useMemo(() => {
    return groupProductsIntoFamilies(products);
  }, [products]);

  const toggleFamily = (familyId: string) => {
    const newExpanded = new Set(expandedFamilies);
    if (newExpanded.has(familyId)) {
      newExpanded.delete(familyId);
    } else {
      newExpanded.add(familyId);
    }
    setExpandedFamilies(newExpanded);
  };

  const handleBulkAction = (family: VariantFamily, action: string) => {
    switch (action) {
      case 'edit-family':
        onEditFamily(family);
        break;
      case 'feature-all':
        // Would need to implement bulk feature toggle
        toast.success(`Featured all ${family.name} variants`);
        break;
      case 'unfeature-all':
        toast.success(`Unfeatured all ${family.name} variants`);
        break;
      default:
        break;
    }
  };

  if (families.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No products found. Import a CSV or add products manually.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Product Families</h3>
          <p className="text-sm text-gray-600">
            {families.length} families, {products.length} total products
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const allIds = families.map(f => f.id);
            setExpandedFamilies(expandedFamilies.size === families.length ? new Set() : new Set(allIds));
          }}
        >
          {expandedFamilies.size === families.length ? 'Collapse All' : 'Expand All'}
        </Button>
      </div>

      <div className="space-y-3">
        {families.map((family) => (
          <FamilyCard
            key={family.id}
            family={family}
            isExpanded={expandedFamilies.has(family.id)}
            onToggle={() => toggleFamily(family.id)}
            onEditProduct={onEditProduct}
            onEditFamily={onEditFamily}
            onDeleteProduct={onDeleteProduct}
            onDuplicateProduct={onDuplicateProduct}
            onBulkAction={handleBulkAction}
          />
        ))}
      </div>
    </div>
  );
};

interface FamilyCardProps {
  family: VariantFamily;
  isExpanded: boolean;
  onToggle: () => void;
  onEditProduct: (product: Product) => void;
  onEditFamily: (family: VariantFamily) => void;
  onDeleteProduct: (sku: string) => void;
  onDuplicateProduct: (product: Product) => void;
  onBulkAction: (family: VariantFamily, action: string) => void;
}

const FamilyCard: React.FC<FamilyCardProps> = ({
  family,
  isExpanded,
  onToggle,
  onEditProduct,
  onEditFamily,
  onDeleteProduct,
  onDuplicateProduct,
  onBulkAction
}) => {
  const isVariantFamily = family.products.length > 1;
  const suggestions = generateVariantSuggestions(family);
  const avgPrice = family.products.reduce((sum, p) => sum + p.price, 0) / family.products.length;

  return (
    <Card className={`transition-all duration-200 ${isVariantFamily ? 'border-purple-200 bg-purple-50/30' : ''}`}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isVariantFamily ? (
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                  />
                ) : (
                  <Package className="h-4 w-4 text-gray-400" />
                )}
                
                <div className="flex items-center space-x-2">
                  {isVariantFamily ? (
                    <Users className="h-4 w-4 text-purple-600" />
                  ) : (
                    <Coffee className="h-4 w-4 text-amber-600" />
                  )}
                  <h4 className="font-medium capitalize">
                    {family.name}
                  </h4>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isVariantFamily && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      {family.products.length} variants
                    </Badge>
                  )}
                  
                  {family.sharedProperties.roastLevel && (
                    <Badge variant="outline" className="capitalize">
                      {family.sharedProperties.roastLevel} roast
                    </Badge>
                  )}
                  
                  {family.sharedProperties.origin && (
                    <Badge variant="outline">
                      {family.sharedProperties.origin}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-green-600">
                  ${avgPrice.toFixed(2)} avg
                </span>
                
                {isVariantFamily && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onBulkAction(family, 'edit-family')}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Family Properties
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onBulkAction(family, 'feature-all')}>
                        <Users className="mr-2 h-4 w-4" />
                        Feature All Variants
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onBulkAction(family, 'unfeature-all')}>
                        <Users className="mr-2 h-4 w-4" />
                        Unfeature All Variants
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Variant Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {family.products.map((product) => (
                <ProductVariantCard
                  key={product.id}
                  product={product}
                  onEdit={() => onEditProduct(product)}
                  onDelete={() => onDeleteProduct(product.sku)}
                  onDuplicate={() => onDuplicateProduct(product)}
                />
              ))}
            </div>

            {/* Missing Variants Suggestions */}
            {isVariantFamily && suggestions.missingCombinations.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-2">Missing Variants</h5>
                <div className="flex flex-wrap gap-2">
                  {suggestions.missingCombinations.map((combo, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="bg-blue-100 border-blue-300 text-blue-800 cursor-pointer hover:bg-blue-200"
                      onClick={() => {
                        // Would create new variant with suggested SKU
                        toast.info(`Would create: ${combo.suggestedSku}`);
                      }}
                    >
                      + {combo.size} {combo.format}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Click to create missing variants
                </p>
              </div>
            )}

            {/* Shared Properties Display */}
            {isVariantFamily && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-800 mb-2">Shared Properties</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Origin:</span> {family.sharedProperties.origin || 'Mixed'}
                  </div>
                  <div>
                    <span className="font-medium">Roast Level:</span> {family.sharedProperties.roastLevel || 'Mixed'}
                  </div>
                  {family.sharedProperties.tastingNotes && (
                    <div className="col-span-2">
                      <span className="font-medium">Tasting Notes:</span> {family.sharedProperties.tastingNotes || 'None'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

interface ProductVariantCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const ProductVariantCard: React.FC<ProductVariantCardProps> = ({
  product,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow border-gray-200">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h6 className="font-medium text-sm">{product.sku}</h6>
            <p className="text-xs text-gray-600">
              {product.weight} • {product.format?.replace('-', ' ')}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-3 w-3" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="mr-2 h-3 w-3" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="mr-2 h-3 w-3" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-semibold text-green-600">${product.price.toFixed(2)}</span>
          <div className="flex space-x-1">
            {product.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
            {product.status === 'draft' && <Badge variant="outline" className="text-xs">Draft</Badge>}
            {!product.inStock && <Badge variant="destructive" className="text-xs">Out of Stock</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
