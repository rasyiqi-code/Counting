'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function EditStockAdjustmentPage() {
  const params = useParams();
  const router = useRouter();
  const adjustmentId = params.id as string;

  const [formData, setFormData] = useState({
    date: '',
    referenceNo: '',
    productId: '',
    quantity: '',
    notes: '',
  });

  const { data: adjustment, isLoading } = trpc.inventory.getAdjustmentById.useQuery({
    id: adjustmentId,
  });

  const { data: products } = trpc.masterData.product.list.useQuery({
    page: 1,
    limit: 100,
  });

  const updateMutation = trpc.inventory.updateAdjustment.useMutation({
    onSuccess: () => {
      toast.success('Adjustment updated successfully');
      router.push(`/inventory/adjustments/${adjustmentId}`);
    },
    onError: (error) => {
      toast.error(`Failed to update adjustment: ${error.message}`);
    },
  });

  useEffect(() => {
    if (adjustment) {
      setFormData({
        date: adjustment.date ? new Date(adjustment.date).toISOString().split('T')[0] : '',
        referenceNo: adjustment.referenceNo || '',
        productId: adjustment.productId || '',
        quantity: adjustment.quantity ? adjustment.quantity.toString() : '',
        notes: adjustment.notes || '',
      });
    }
  }, [adjustment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: adjustmentId,
        date: new Date(formData.date),
        referenceNo: formData.referenceNo,
        productId: formData.productId,
        quantity: parseFloat(formData.quantity),
        notes: formData.notes,
      });
    } catch (error) {
      console.error('Error updating adjustment:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12 text-muted-foreground">
          Loading adjustment details...
        </div>
      </div>
    );
  }

  if (!adjustment) {
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

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/inventory/adjustments/${adjustmentId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
              Edit Stock Adjustment
            </AnimatedGradientText>
            <p className="text-sm sm:text-base text-muted-foreground">
              {adjustment.referenceNo}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="relative overflow-hidden">
              <BorderBeam size={300} duration={15} />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Adjustment Details
                </CardTitle>
                <CardDescription>
                  Update the stock adjustment information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referenceNo">Reference Number *</Label>
                    <Input
                      id="referenceNo"
                      value={formData.referenceNo}
                      onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                      placeholder="ADJ-0001"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productId">Product *</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) => setFormData({ ...formData, productId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.data.map((product: any) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity Adjustment *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Enter quantity (positive for increase, negative for decrease)"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Use positive numbers for stock increases, negative numbers for stock decreases
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Enter adjustment reason or notes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Values */}
            <Card className="relative overflow-hidden">
              <BorderBeam size={300} duration={15} />
              <CardHeader>
                <CardTitle>Current Values</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product</label>
                  <p className="font-medium">{adjustment.product?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Quantity</label>
                  <p className="font-mono text-lg">{adjustment.quantity?.toString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="text-sm">{adjustment.date ? new Date(adjustment.date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="relative overflow-hidden">
              <BorderBeam size={300} duration={15} />
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Link href={`/inventory/adjustments/${adjustmentId}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
