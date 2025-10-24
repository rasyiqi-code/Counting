'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewSalesPaymentPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [notes, setNotes] = useState('');

  const { data: invoices } = trpc.sales.invoice.list.useQuery({ 
    page: 1, 
    limit: 100,
    status: 'UNPAID' 
  });
  
  const { data: accounts } = trpc.masterData.coa.list.useQuery({ 
    page: 1, 
    limit: 100 
  });

  const bankAccounts = accounts?.data.filter((a: any) => 
    a.code.startsWith('1-101') || a.name.toLowerCase().includes('bank') || a.name.toLowerCase().includes('kas')
  ) || [];

  // TODO: Implement payment procedure
  const createMutation = { 
    mutateAsync: async (data: any) => {},
    isPending: false
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        date: new Date(date),
        invoiceId,
        amount: parseFloat(amount),
        bankAccountId,
        notes: notes || undefined,
      });
      router.push('/sales/payments');
    } catch (error) {
      console.error('Failed to create payment:', error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Terima Pembayaran</h1>
        <p className="text-muted-foreground">Catat pembayaran dari customer</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="date">Tanggal Pembayaran *</Label>
              <Input 
                type="date" 
                id="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                required 
              />
            </div>

            <div>
              <Label htmlFor="invoice">Invoice *</Label>
              <select 
                id="invoice"
                value={invoiceId}
                onChange={(e) => {
                  setInvoiceId(e.target.value);
                  const inv = invoices?.data.find((i: any) => i.id === e.target.value);
                  if (inv) setAmount(inv.total.toString());
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih invoice...</option>
                {invoices?.data.map((inv: any) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNo} - {inv.contact?.name} - Rp {inv.total.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="amount">Jumlah Pembayaran *</Label>
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
              <Label htmlFor="bank">Akun Bank/Kas *</Label>
              <select 
                id="bank"
                value={bankAccountId}
                onChange={(e) => setBankAccountId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih akun...</option>
                {bankAccounts.map((acc: any) => (
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
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Pembayaran'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

