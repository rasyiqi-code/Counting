'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, Edit, TrendingUp, TrendingDown, Package, Calendar, FileText } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function StockAdjustmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const adjustmentId = params.id as string;

  const { data: adjustment, isLoading, error } = trpc.inventory.getAdjustmentById.useQuery({
    id: adjustmentId,
  });

  if (isLoading) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12 text-muted-foreground">
          Loading adjustment details...
        </div>
      </div>
    );
  }

  if (error || !adjustment) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Adjustment Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The adjustment you're looking for doesn't exist.
          </p>
          <Link href="/inventory/adjustments">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Adjustments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const quantityBefore = adjustment.quantityBefore || 0;
  const quantityAfter = adjustment.quantityAfter || 0;
  const difference = quantityAfter - quantityBefore;
  const isIncrease = difference > 0;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/inventory/adjustments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
              Stock Adjustment Details
            </AnimatedGradientText>
            <p className="text-sm sm:text-base text-muted-foreground">
              {adjustment.referenceNo}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/inventory/adjustments/${adjustmentId}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Adjustment Information */}
          <Card className="relative overflow-hidden">
            <BorderBeam size={300} duration={15} />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Adjustment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reference Number</label>
                  <p className="font-mono text-lg">{adjustment.referenceNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="text-lg">{formatDate(adjustment.date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product</label>
                  <p className="text-lg">{adjustment.product?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">SKU</label>
                  <p className="font-mono text-lg">{adjustment.product?.sku}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantity Changes */}
          <Card className="relative overflow-hidden">
            <BorderBeam size={300} duration={15} />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isIncrease ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
                Quantity Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground">Before</label>
                  <p className="text-2xl font-bold">{quantityBefore}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground">After</label>
                  <p className="text-2xl font-bold">{quantityAfter}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground">Difference</label>
                  <p className={`text-2xl font-bold ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                    {isIncrease ? '+' : ''}{difference}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {adjustment.notes && (
            <Card className="relative overflow-hidden">
              <BorderBeam size={300} duration={15} />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{adjustment.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card className="relative overflow-hidden">
            <BorderBeam size={300} duration={15} />
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={isIncrease ? "default" : "destructive"}>
                  {isIncrease ? 'Stock Increase' : 'Stock Decrease'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="relative overflow-hidden">
            <BorderBeam size={300} duration={15} />
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/inventory/adjustments/${adjustmentId}/edit`} className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Adjustment
                </Button>
              </Link>
              <Link href="/inventory/stock-card" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  View Stock Card
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card className="relative overflow-hidden">
            <BorderBeam size={300} duration={15} />
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="font-medium">{adjustment.product?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">SKU</label>
                <p className="font-mono text-sm">{adjustment.product?.sku}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unit</label>
                <p className="text-sm">{adjustment.product?.unit || 'pcs'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
