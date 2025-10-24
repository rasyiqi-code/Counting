'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewVendorPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');

  const createMutation = trpc.masterData.contact.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        name,
        type: 'VENDOR' as any,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        npwp: taxId || undefined,
      });
      router.push('/master/vendors');
    } catch (error) {
      console.error('Failed to create vendor:', error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tambah Vendor Baru</h1>
        <p className="text-muted-foreground">Buat data vendor/supplier baru</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Vendor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Vendor *</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap atau perusahaan"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telepon</Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Alamat</Label>
              <textarea 
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Alamat lengkap"
              />
            </div>

            <div>
              <Label htmlFor="taxId">NPWP</Label>
              <Input 
                id="taxId" 
                value={taxId} 
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="00.000.000.0-000.000"
              />
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Vendor'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

