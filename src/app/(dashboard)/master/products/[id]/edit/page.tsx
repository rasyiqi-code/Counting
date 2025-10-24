'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [unit, setUnit] = useState('');
  const [trackInventory, setTrackInventory] = useState(false);
  const [stockMethod, setStockMethod] = useState('');
  const [minStock, setMinStock] = useState('');
  const [maxStock, setMaxStock] = useState('');
  const [taxable, setTaxable] = useState(false);

  const { data: product, isLoading, error } = trpc.masterData.product.getById.useQuery({
    id: productId,
  });

  const updateMutation = trpc.masterData.product.update.useMutation();

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSku(product.sku || '');
      setDescription(product.description || '');
      setCategory(product.category || '');
      setSalePrice(product.salePrice?.toString() || '');
      setPurchasePrice(product.purchasePrice?.toString() || '');
      setUnit(product.unit || '');
      setTrackInventory(product.trackInventory || false);
      setStockMethod(product.stockMethod || '');
      setMinStock(product.minStock?.toString() || '');
      setMaxStock(product.maxStock?.toString() || '');
      setTaxable(product.taxable || false);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id: productId,
        name,
        sku,
        description: description || undefined,
        category: category || undefined,
        salePrice: salePrice ? parseFloat(salePrice) : undefined,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
        unit: unit || undefined,
        trackInventory,
        stockMethod: stockMethod as any || undefined,
        minStock: minStock ? parseFloat(minStock) : undefined,
        maxStock: maxStock ? parseFloat(maxStock) : undefined,
        taxable,
      });
      router.push(`/master/products/${productId}`);
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12 text-muted-foreground">
          Loading product details...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">The product you're trying to edit doesn't exist.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Edit Product
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">
            Edit product information for {product.name}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="relative overflow-hidden">
          <BorderBeam size={250} duration={12} />
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update basic product details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Enter SKU"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Enter category"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., pcs, kg, box"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <BorderBeam size={250} duration={12} delay={3} />
          <CardHeader>
            <CardTitle>Pricing Information</CardTitle>
            <CardDescription>Set product prices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {salePrice && purchasePrice && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Margin</p>
                <p className="text-2xl font-bold">
                  {((parseFloat(salePrice) - parseFloat(purchasePrice)) / parseFloat(purchasePrice) * 100).toFixed(2)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <BorderBeam size={250} duration={12} delay={6} />
          <CardHeader>
            <CardTitle>Inventory Management</CardTitle>
            <CardDescription>Configure inventory settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="trackInventory"
                checked={trackInventory}
                onCheckedChange={(checked) => setTrackInventory(checked as boolean)}
              />
              <Label htmlFor="trackInventory" className="cursor-pointer">
                Track inventory for this product
              </Label>
            </div>

            {trackInventory && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="stockMethod">Stock Method</Label>
                  <Select value={stockMethod} onValueChange={setStockMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stock method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIFO">FIFO (First In First Out)</SelectItem>
                      <SelectItem value="AVERAGE">Average Cost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="minStock">Minimum Stock</Label>
                    <Input
                      id="minStock"
                      type="number"
                      step="0.01"
                      value={minStock}
                      onChange={(e) => setMinStock(e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxStock">Maximum Stock</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      step="0.01"
                      value={maxStock}
                      onChange={(e) => setMaxStock(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Settings</CardTitle>
            <CardDescription>Configure tax options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="taxable"
                checked={taxable}
                onCheckedChange={(checked) => setTaxable(checked as boolean)}
              />
              <Label htmlFor="taxable" className="cursor-pointer">
                This product is taxable
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
