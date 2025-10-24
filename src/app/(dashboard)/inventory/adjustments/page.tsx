'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { Plus, Search, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function StockAdjustmentsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Get stock adjustments from database
  const { data: adjustments, isLoading } = trpc.inventory.listAdjustments.useQuery({
    page,
    limit: 20,
    search,
  });

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Stock Adjustments
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Penyesuaian stok (increase/decrease)</p>
        </div>
        <Link href="/inventory/adjustments/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Adjustment
          </Button>
        </Link>
      </div>

      <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} />
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari adjustment..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9" 
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading adjustments...</div>
          ) : adjustments && adjustments.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Adjustment</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Qty Sebelum</TableHead>
                  <TableHead>Qty Sesudah</TableHead>
                  <TableHead>Selisih</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.data.map((adj: any) => {
                  const quantityBefore = adj.quantityBefore || 0;
                  const quantityAfter = adj.quantityAfter || 0;
                  const difference = quantityAfter - quantityBefore;
                  const isIncrease = difference > 0;
                  
                  return (
                    <TableRow key={adj.id}>
                      <TableCell className="font-mono">{adj.referenceNo}</TableCell>
                      <TableCell>{formatDate(adj.date)}</TableCell>
                      <TableCell>{adj.product?.name}</TableCell>
                      <TableCell className="text-right">{quantityBefore}</TableCell>
                      <TableCell className="text-right">{quantityAfter}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          {isIncrease ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <span className={isIncrease ? 'text-green-600' : 'text-red-600'}>
                            {isIncrease ? '+' : ''}{difference}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{adj.notes}</TableCell>
                      <TableCell>
                        <Link href={`/inventory/adjustments/${adj.id}`}>
                          <Button variant="ghost" size="icon" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-2">Belum ada adjustment</p>
              <p className="text-sm">Klik "Buat Adjustment" untuk menambah penyesuaian stok</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {adjustments && adjustments.data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Adjustments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adjustments.data.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Stock Increases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {adjustments.data.filter((adj: any) => (adj.quantityAfter || 0) > (adj.quantityBefore || 0)).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Stock Decreases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {adjustments.data.filter((adj: any) => (adj.quantityAfter || 0) < (adj.quantityBefore || 0)).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Difference</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {adjustments.data.reduce((sum: number, adj: any) => {
                  const before = adj.quantityBefore || 0;
                  const after = adj.quantityAfter || 0;
                  return sum + (after - before);
                }, 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

