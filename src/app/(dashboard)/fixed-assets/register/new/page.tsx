'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ASSET_CATEGORIES = [
  'BUILDING',
  'VEHICLE',
  'EQUIPMENT',
  'FURNITURE',
  'COMPUTER',
  'MACHINERY',
  'OTHER'
];

const DEPRECIATION_METHODS = [
  { value: 'STRAIGHT_LINE', label: 'Straight Line' },
  { value: 'DECLINING_BALANCE', label: 'Declining Balance' },
];

export default function NewAssetPage() {
  const router = useRouter();
  const [assetCode, setAssetCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [cost, setCost] = useState('');
  const [salvageValue, setSalvageValue] = useState('');
  const [usefulLife, setUsefulLife] = useState('');
  const [depreciationMethod, setDepreciationMethod] = useState('');
  const [description, setDescription] = useState('');

  const { data: accounts } = trpc.masterData.coa.list.useQuery({ 
    page: 1, 
    limit: 100 
  });

  const assetAccounts = accounts?.data.filter((a: any) => 
    a.accountType === 'ASSET' && a.category === 'FIXED_ASSET'
  ) || [];

  const createMutation = trpc.fixedAssets.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        name,
        category: category as any,
        purchaseDate: new Date(purchaseDate),
        purchasePrice: parseFloat(cost),
        usefulLife: parseInt(usefulLife),
        depreciationMethod: depreciationMethod as any,
        assetAccountId: assetAccounts[0]?.id || '',
        depreciationExpenseAccountId: assetAccounts[0]?.id || '',
        accumulatedDepreciationAccountId: assetAccounts[0]?.id || '',
        description: description || '',
        residualValue: parseFloat(salvageValue),
      });
      router.push('/fixed-assets/register');
    } catch (error) {
      console.error('Failed to create asset:', error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tambah Asset Tetap</h1>
        <p className="text-muted-foreground">Daftarkan aset tetap baru</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Asset</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assetCode">Kode Asset *</Label>
                  <Input 
                    id="assetCode" 
                    value={assetCode} 
                    onChange={(e) => setAssetCode(e.target.value)}
                    placeholder="e.g. AST-001"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <select 
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Pilih kategori...</option>
                    {ASSET_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Nama Asset *</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Laptop Dell Inspiron"
                  required 
                />
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <textarea 
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Deskripsi detail asset (opsional)"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Pembelian</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchaseDate">Tanggal Pembelian *</Label>
                  <Input 
                    type="date" 
                    id="purchaseDate" 
                    value={purchaseDate} 
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Harga Beli *</Label>
                  <Input 
                    type="number"
                    id="cost" 
                    value={cost} 
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Penyusutan</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="salvageValue">Nilai Sisa *</Label>
                  <Input 
                    type="number"
                    id="salvageValue" 
                    value={salvageValue} 
                    onChange={(e) => setSalvageValue(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="usefulLife">Masa Manfaat (Tahun) *</Label>
                  <Input 
                    type="number"
                    id="usefulLife" 
                    value={usefulLife} 
                    onChange={(e) => setUsefulLife(e.target.value)}
                    placeholder="5"
                    min="1"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="depreciationMethod">Metode Penyusutan *</Label>
                  <select 
                    id="depreciationMethod"
                    value={depreciationMethod}
                    onChange={(e) => setDepreciationMethod(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Pilih metode...</option>
                    {DEPRECIATION_METHODS.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan Asset'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
