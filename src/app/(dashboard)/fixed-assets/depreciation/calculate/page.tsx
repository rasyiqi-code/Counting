'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CalculateDepreciationPage() {
  const router = useRouter();
  const [assetId, setAssetId] = useState('');
  const [period, setPeriod] = useState(new Date().toISOString().split('T')[0].substring(0, 7)); // YYYY-MM format

  const { data: assets } = trpc.fixedAssets.list.useQuery({
    page: 1,
    limit: 100,
    status: 'ACTIVE'
  });

  // TODO: Implement depreciation calculation procedure
  const createMutation = { 
    mutateAsync: async (data: any) => {},
    isPending: false
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        assetId,
        period: new Date(period + '-01'),
      });
      router.push('/fixed-assets/depreciation');
    } catch (error) {
      console.error('Failed to calculate depreciation:', error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Hitung Penyusutan</h1>
        <p className="text-muted-foreground">Kalkulasi penyusutan untuk periode tertentu</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Parameter Perhitungan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="asset">Asset *</Label>
              <select 
                id="asset"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih asset...</option>
                {assets?.data.map((asset: any) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.assetCode} - {asset.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="period">Periode (YYYY-MM) *</Label>
              <Input 
                type="month" 
                id="period" 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
                required 
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Informasi:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Penyusutan akan dihitung berdasarkan metode yang sudah ditentukan</li>
                <li>• Journal entry akan otomatis dibuat</li>
                <li>• Book value asset akan diperbarui</li>
              </ul>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Menghitung...' : 'Hitung Penyusutan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
