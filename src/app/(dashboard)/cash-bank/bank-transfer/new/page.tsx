'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewBankTransferPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const { data: accounts } = trpc.masterData.coa.list.useQuery({ 
    page: 1, 
    limit: 100 
  });

  const bankAccounts = accounts?.data.filter((a: any) => 
    a.code.startsWith('1-101') || a.name.toLowerCase().includes('bank') || a.name.toLowerCase().includes('kas')
  ) || [];

  const createMutation = trpc.cashBank.recordTransfer.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        date: new Date(date),
        fromBankAccountId: fromAccountId,
        toBankAccountId: toAccountId,
        amount: parseFloat(amount),
        description: description || '',
        referenceNo: notes || '',
      });
      router.push('/cash-bank/bank-transfer');
    } catch (error) {
      console.error('Failed to create bank transfer:', error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Buat Bank Transfer</h1>
        <p className="text-muted-foreground">Transfer antar rekening</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Bank Transfer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="date">Tanggal *</Label>
              <Input 
                type="date" 
                id="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                required 
              />
            </div>

            <div>
              <Label htmlFor="fromAccount">Dari Akun *</Label>
              <select 
                id="fromAccount"
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih akun sumber...</option>
                {bankAccounts.map((acc: any) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="toAccount">Ke Akun *</Label>
              <select 
                id="toAccount"
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih akun tujuan...</option>
                {bankAccounts.filter((acc: any) => acc.id !== fromAccountId).map((acc: any) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="amount">Jumlah Transfer *</Label>
              <Input 
                type="number"
                id="amount" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                required 
              />
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Input 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Transfer untuk operasional"
              />
            </div>

            <div>
              <Label htmlFor="notes">Catatan</Label>
              <textarea 
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Catatan tambahan (opsional)"
              />
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Bank Transfer'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
