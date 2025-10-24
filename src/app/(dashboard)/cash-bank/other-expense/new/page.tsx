'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewOtherExpensePage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');

  const { data: accounts } = trpc.masterData.coa.list.useQuery({ 
    page: 1, 
    limit: 100 
  });

  const expenseAccounts = accounts?.data.filter((a: any) => 
    a.accountType === 'EXPENSE' || a.name.toLowerCase().includes('expense') || a.name.toLowerCase().includes('biaya')
  ) || [];

  const createMutation = trpc.cashBank.recordExpense.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        date: new Date(date),
        description,
        amount: parseFloat(amount),
        bankAccountId: accountId,
        expenseAccountId: accountId,
        referenceNo: notes || '',
      });
      router.push('/cash-bank/other-expense');
    } catch (error) {
      console.error('Failed to create other expense:', error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tambah Other Expense</h1>
        <p className="text-muted-foreground">Catat pengeluaran lain-lain</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Other Expense</CardTitle>
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
              <Label htmlFor="description">Deskripsi *</Label>
              <Input 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Biaya Admin, Biaya Lain-lain, dll"
                required 
              />
            </div>

            <div>
              <Label htmlFor="amount">Jumlah *</Label>
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
              <Label htmlFor="account">Akun Biaya *</Label>
              <select 
                id="account"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih akun...</option>
                {expenseAccounts.map((acc: any) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
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
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Other Expense'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
