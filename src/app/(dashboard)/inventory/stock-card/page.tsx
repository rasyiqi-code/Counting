'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function StockCardPage() {
  const [productId, setProductId] = useState('');
  
  const { data: products } = trpc.masterData.product.list.useQuery({ limit: 100, type: 'GOODS' });
  const { data: stockCard, isLoading } = trpc.inventory.getStockCard.useQuery(
    { productId, warehouseId: 'default' },
    { enabled: !!productId }
  );

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          Stock Card
        </AnimatedGradientText>
        <p className="text-sm sm:text-base text-muted-foreground">Kartu stok per produk</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pilih Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Product</Label>
          <select
            className="w-full px-3 py-2 border border-gray-200 rounded-md mt-1"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Pilih produk...</option>
            {products?.data.map((p: any) => (
              <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {productId && stockCard && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{stockCard.product.sku} - {stockCard.product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Current Stock</div>
                  <div className="text-2xl font-bold">{stockCard.currentStock.toString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Stock Value</div>
                  <div className="text-2xl font-bold">{formatCurrency(stockCard.currentValue.toString())}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Average Cost</div>
                  <div className="text-2xl font-bold">{formatCurrency(stockCard.averageCost.toString())}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} delay={3} />
            <CardHeader>
              <CardTitle>Riwayat Pergerakan</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">Loading...</div>
              ) : stockCard.movements.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockCard.movements.map((m: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{formatDate(m.date)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            m.movementType === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {m.movementType}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{m.referenceNo || '-'}</TableCell>
                        <TableCell className="text-right">{m.quantity.toString()}</TableCell>
                        <TableCell className="text-right">{formatCurrency(m.unitCost.toString())}</TableCell>
                        <TableCell className="text-right">{formatCurrency(m.totalCost.toString())}</TableCell>
                        <TableCell className="text-right font-medium">{m.balance.toString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">Belum ada pergerakan stok</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

