'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewStockAdjustmentPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [productId, setProductId] = useState('');
  const [quantityBefore, setQuantityBefore] = useState('');
  const [quantityAfter, setQuantityAfter] = useState('');
  const [reason, setReason] = useState('');

  const { data: products } = trpc.masterData.product.list.useQuery({ page: 1, limit: 100 });
  const createMutation = trpc.inventory.createAdjustment.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        productId,
        quantity: parseFloat(quantityAfter) - parseFloat(quantityBefore),
        reason,
        notes: '',
      });
      router.push('/inventory/adjustments');
    } catch (error) {
      console.error('Failed to create adjustment:', error);
    }
  };

  const difference = parseFloat(quantityAfter) - parseFloat(quantityBefore);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Buat Stock Adjustment</h1>
        <p className="text-muted-foreground">Penyesuaian stok barang</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Adjustment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="date">Tanggal Adjustment *</Label>
              <Input 
                type="date" 
                id="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                required 
              />
            </div>

            <div>
              <Label htmlFor="product">Produk *</Label>
              <select 
                id="product"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih produk...</option>
                {products?.data.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name} ({p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="qtyBefore">Stok Sebelum *</Label>
                <Input 
                  type="number"
                  id="qtyBefore" 
                  value={quantityBefore} 
                  onChange={(e) => setQuantityBefore(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required 
                />
              </div>
              <div>
                <Label htmlFor="qtyAfter">Stok Sesudah *</Label>
                <Input 
                  type="number"
                  id="qtyAfter" 
                  value={quantityAfter} 
                  onChange={(e) => setQuantityAfter(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required 
                />
              </div>
            </div>

            {quantityBefore && quantityAfter && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Selisih:</div>
                <div className={`text-lg font-semibold ${difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {difference > 0 ? '+' : ''}{difference} unit
                  {difference > 0 ? ' (Penambahan)' : difference < 0 ? ' (Pengurangan)' : ' (Tidak ada perubahan)'}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="reason">Alasan Adjustment *</Label>
              <select 
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih alasan...</option>
                <option value="Stock Opname">Stock Opname</option>
                <option value="Kerusakan">Kerusakan</option>
                <option value="Kadaluarsa">Kadaluarsa</option>
                <option value="Hilang">Hilang</option>
                <option value="Retur">Retur</option>
                <option value="Donasi">Donasi</option>
                <option value="Sample">Sample</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {reason === 'Lainnya' && (
              <div>
                <Label htmlFor="customReason">Alasan Lainnya</Label>
                <Input 
                  id="customReason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Tuliskan alasan penyesuaian..."
                />
              </div>
            )}

            <div className="flex gap-4 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Adjustment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
