'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/shared/utils/currency';

const DISPOSAL_TYPES = [
  { value: 'SALE', label: 'Sale' },
  { value: 'SCRAP', label: 'Scrap' },
  { value: 'DONATION', label: 'Donation' },
  { value: 'LOSS', label: 'Loss' },
];

export default function NewDisposalPage() {
  const router = useRouter();
  const [assetId, setAssetId] = useState('');
  const [disposalDate, setDisposalDate] = useState(new Date().toISOString().split('T')[0]);
  const [disposalType, setDisposalType] = useState('');
  const [proceeds, setProceeds] = useState('');
  const [description, setDescription] = useState('');

  const { data: assets } = trpc.fixedAssets.list.useQuery({
    page: 1,
    limit: 100,
    status: 'ACTIVE'
  });

  // TODO: Implement disposal procedure
  const createMutation = { 
    mutateAsync: async (data: any) => {},
    isPending: false
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        assetId,
        disposalDate: new Date(disposalDate),
        disposalType: disposalType as any,
        proceeds: parseFloat(proceeds),
        description: description || undefined,
      });
      router.push('/fixed-assets/disposal');
    } catch (error) {
      console.error('Failed to create disposal:', error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Buat Asset Disposal</h1>
        <p className="text-muted-foreground">Pelepasan aset tetap</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Disposal</CardTitle>
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
                    {asset.assetCode} - {asset.name} (Book Value: {formatCurrency(asset.bookValue.toString())})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="disposalDate">Tanggal Disposal *</Label>
                <Input 
                  type="date" 
                  id="disposalDate" 
                  value={disposalDate} 
                  onChange={(e) => setDisposalDate(e.target.value)}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="disposalType">Tipe Disposal *</Label>
                <select 
                  id="disposalType"
                  value={disposalType}
                  onChange={(e) => setDisposalType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Pilih tipe...</option>
                  {DISPOSAL_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="proceeds">Proceeds *</Label>
              <Input 
                type="number"
                id="proceeds" 
                value={proceeds} 
                onChange={(e) => setProceeds(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                required 
              />
              <p className="text-xs text-muted-foreground mt-1">
                Jumlah yang diterima dari disposal (0 jika tidak ada)
              </p>
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Deskripsi disposal (opsional)"
              />
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Perhatian:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Asset akan diubah status menjadi DISPOSED</li>
                <li>• Journal entry akan otomatis dibuat untuk gain/loss</li>
                <li>• Book value akan dibandingkan dengan proceeds</li>
              </ul>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Disposal'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
