'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { ArrowLeft, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

interface TransferItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
}

export default function NewInventoryTransferPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<TransferItem[]>([]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(),
        productId: '',
        productName: '',
        quantity: 1,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: string, value: any) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement tRPC mutation
    alert('Transfer functionality will be implemented soon');
    
    // router.push('/inventory/transfers');
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <Link href="/inventory/transfers">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          Transfer Stok Baru
        </AnimatedGradientText>
        <p className="text-sm sm:text-base text-muted-foreground">
          Transfer stok antar gudang
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transfer Information */}
        <Card className="relative overflow-hidden">
          <BorderBeam size={250} duration={12} />
          <CardHeader>
            <CardTitle>Informasi Transfer</CardTitle>
            <CardDescription>Detail transfer stok</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal Transfer *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceNo">No. Referensi</Label>
                <Input
                  id="referenceNo"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="Opsional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromWarehouse">Dari Gudang *</Label>
                <select
                  id="fromWarehouse"
                  value={fromWarehouse}
                  onChange={(e) => setFromWarehouse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  required
                >
                  <option value="">Pilih gudang asal</option>
                  <option value="main">Gudang Utama</option>
                  <option value="retail">Gudang Retail</option>
                  <option value="warehouse-a">Gudang A</option>
                  <option value="warehouse-b">Gudang B</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toWarehouse">Ke Gudang *</Label>
                <select
                  id="toWarehouse"
                  value={toWarehouse}
                  onChange={(e) => setToWarehouse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  required
                >
                  <option value="">Pilih gudang tujuan</option>
                  <option value="main">Gudang Utama</option>
                  <option value="retail">Gudang Retail</option>
                  <option value="warehouse-a">Gudang A</option>
                  <option value="warehouse-b">Gudang B</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Catatan</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md min-h-[80px]"
                  placeholder="Catatan tambahan untuk transfer ini"
                />
              </div>
            </div>

            {fromWarehouse && toWarehouse && (
              <div className="flex items-center justify-center gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Dari</p>
                  <p className="font-semibold">{fromWarehouse}</p>
                </div>
                <ArrowRight className="h-6 w-6 text-primary" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Ke</p>
                  <p className="font-semibold">{toWarehouse}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transfer Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Item Transfer</CardTitle>
                <CardDescription>Produk yang akan ditransfer</CardDescription>
              </div>
              <Button type="button" onClick={handleAddItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk *</TableHead>
                    <TableHead className="text-right">Qty *</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <select
                          value={item.productId}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'productId', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-md"
                          required
                        >
                          <option value="">Pilih produk</option>
                          <option value="prod-1">Product 1 - Laptop Gaming</option>
                          <option value="prod-2">Product 2 - Mouse Wireless</option>
                          <option value="prod-3">Product 3 - Keyboard Mechanical</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              'quantity',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="text-right"
                          required
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4">Belum ada item transfer</p>
                <Button type="button" onClick={handleAddItem} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Item Pertama
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/inventory/transfers">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={items.length === 0}>
            Simpan Transfer
          </Button>
        </div>
      </form>
    </div>
  );
}

