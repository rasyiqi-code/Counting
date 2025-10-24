'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, Edit, Package, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useParams, useRouter } from 'next/navigation';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { data: product, isLoading, error } = trpc.masterData.product.getById.useQuery({
    id: productId,
  });

  if (isLoading) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12 text-muted-foreground">
          Loading product details...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
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
            {product.name}
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">
            SKU: {product.sku}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Link href={`/master/products/${productId}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="relative overflow-hidden">
            <BorderBeam size={250} duration={12} />
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Basic product details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Product Name</p>
                    <p className="text-sm text-muted-foreground">{product.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">SKU: {product.sku}</Badge>
                </div>
              </div>

              {product.description && (
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm text-muted-foreground">{product.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground">{product.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Unit</p>
                  <p className="text-sm text-muted-foreground">{product.unit || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={product.isActive ? 'default' : 'secondary'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {product.trackInventory && (
                  <Badge variant="outline">Inventory Tracked</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Info */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
              <CardDescription>Cost and selling prices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Sale Price</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(product.salePrice?.toString() || '0')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Purchase Price</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {formatCurrency(product.purchasePrice?.toString() || '0')}
                    </p>
                  </div>
                </div>
              </div>

              {product.salePrice && product.purchasePrice && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      Margin: {formatCurrency((Number(product.salePrice) - Number(product.purchasePrice)).toString())}
                    </Badge>
                    <Badge variant="secondary">
                      Margin %: {(((Number(product.salePrice) - Number(product.purchasePrice)) / Number(product.purchasePrice)) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory Info */}
          {product.trackInventory && (
            <Card>
              <CardHeader>
                <CardTitle>Inventory Information</CardTitle>
                <CardDescription>Stock management details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Current Stock</p>
                    <p className="text-lg font-semibold">0</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Minimum Stock</p>
                    <p className="text-sm text-muted-foreground">{product.minStock?.toString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Maximum Stock</p>
                    <p className="text-sm text-muted-foreground">{product.maxStock?.toString() || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Stock Method</p>
                  <p className="text-sm text-muted-foreground">{product.stockMethod || 'N/A'}</p>
                </div>

                {product.minStock && 0 <= Number(product.minStock.toString()) && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Low stock alert! Current stock (0) is at or below minimum ({product.minStock.toString()})
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for this product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/sales/invoices/new?productId=${productId}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Create Sales Invoice
                </Button>
              </Link>
              <Link href={`/purchases/bills/new?productId=${productId}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Create Purchase Bill
                </Button>
              </Link>
              <Link href={`/inventory/adjustments/new?productId=${productId}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Stock Adjustment
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Product Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Product Statistics</CardTitle>
              <CardDescription>Usage and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Sold</span>
                  <span className="font-semibold">0 units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Purchased</span>
                  <span className="font-semibold">0 units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Sale</span>
                  <span className="text-sm text-muted-foreground">Never</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Purchase</span>
                  <span className="text-sm text-muted-foreground">Never</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
