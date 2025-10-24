'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ACCOUNT_TYPES = [
  { value: 'ASSET', label: 'Asset' },
  { value: 'LIABILITY', label: 'Liability' },
  { value: 'EQUITY', label: 'Equity' },
  { value: 'REVENUE', label: 'Revenue' },
  { value: 'EXPENSE', label: 'Expense' },
];

export default function NewCoaPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [parentId, setParentId] = useState('');

  const { data: accounts } = trpc.masterData.coa.list.useQuery({ page: 1, limit: 500 });
  const createMutation = trpc.masterData.coa.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        code,
        name,
        accountType: type as any,
        category: '',
        description: '',
        parentId: parentId || undefined,
      });
      router.push('/master/coa');
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tambah Akun Baru</h1>
        <p className="text-muted-foreground">Buat akun Chart of Accounts baru</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="code">Kode Akun *</Label>
              <Input 
                id="code" 
                value={code} 
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 1-10101"
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Nama Akun *</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kas"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Tipe Akun *</Label>
              <select 
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih tipe...</option>
                {ACCOUNT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="parent">Parent Account (Opsional)</Label>
              <select 
                id="parent"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Tidak ada parent (akun utama)</option>
                {accounts?.data
                  .filter((a: any) => a.type === type)
                  .map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Akun'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

