'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [unit, setUnit] = useState('');

  const createMutation = trpc.masterData.product.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        sku: code,
        name,
        description: description || undefined,
        salePrice: parseFloat(price),
        purchasePrice: cost ? parseFloat(cost) : 0,
        unit: unit || '',
        type: 'GOODS' as any,
      });
      router.push('/master/products');
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tambah Produk Baru</h1>
        <p className="text-muted-foreground">Buat produk atau jasa baru</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Produk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Kode Produk *</Label>
                <Input 
                  id="code" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="PRD-001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit">Satuan *</Label>
                <Input 
                  id="unit" 
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="pcs, kg, unit"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="name">Nama Produk *</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama produk/jasa"
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
                placeholder="Deskripsi produk (opsional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Harga Jual *</Label>
                <Input 
                  id="price" 
                  type="number"
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cost">Harga Pokok</Label>
                <Input 
                  id="cost" 
                  type="number"
                  value={cost} 
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Produk'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

