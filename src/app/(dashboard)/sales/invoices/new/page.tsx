'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

export default function NewInvoicePage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]);
  const [contactId, setContactId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Array<{productId: string, quantity: number, price: number}>>([
    { productId: '', quantity: 1, price: 0 }
  ]);

  const { data: customers } = trpc.masterData.contact.list.useQuery({ type: 'CUSTOMER', page: 1, limit: 100 });
  const { data: products } = trpc.masterData.product.list.useQuery({ page: 1, limit: 100 });
  const createMutation = trpc.sales.invoice.create.useMutation();

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        date: new Date(date),
        dueDate: new Date(dueDate),
        contactId,
        notes,
        items: items.map(item => ({
          ...item,
          unitPrice: item.price
        })),
      });
      router.push('/sales/invoices');
    } catch (error) {
      console.error('Failed to create invoice:', error);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Buat Invoice Baru</h1>
        <p className="text-muted-foreground">Tambah invoice penjualan baru</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Invoice</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Tanggal Invoice</Label>
                  <Input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="dueDate">Jatuh Tempo</Label>
                  <Input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                </div>
              </div>
              <div>
                <Label htmlFor="customer">Customer</Label>
                <select 
                  id="customer" 
                  value={contactId} 
                  onChange={(e) => setContactId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  required
                >
                  <option value="">Pilih customer...</option>
                  {customers?.data.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Item Invoice</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-5">
                      <Label>Produk</Label>
                      <select 
                        value={item.productId}
                        onChange={(e) => {
                          updateItem(index, 'productId', e.target.value);
                          const product = products?.data.find((p: any) => p.id === e.target.value);
                          if (product) updateItem(index, 'price', product.salePrice);
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Pilih produk...</option>
                        {products?.data.map((p: any) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <Label>Qty</Label>
                      <Input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                        min="1"
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <Label>Harga</Label>
                      <Input 
                        type="number" 
                        value={item.price} 
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                        min="0"
                        required
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {(item.quantity * item.price).toLocaleString('id-ID')}
                      </span>
                      {items.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t flex justify-end">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Total</div>
                  <div className="text-2xl font-bold">Rp {subtotal.toLocaleString('id-ID')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Catatan tambahan (opsional)..."
              />
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan Invoice'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

