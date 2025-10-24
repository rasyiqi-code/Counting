'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { Calculator, Search, Eye, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function DepreciationPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // TODO: Implement depreciation list procedure
  const depreciations = { data: [], pagination: { total: 0 } };
  const isLoading = false;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Depreciation
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Kalkulasi penyusutan aset tetap</p>
        </div>
        <Link href="/fixed-assets/depreciation/calculate">
          <Button>
            <Calculator className="h-4 w-4 mr-2" />
            Hitung Penyusutan
          </Button>
        </Link>
      </div>

      <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} />
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari depreciation..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9" 
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading depreciation...</div>
          ) : depreciations && depreciations.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead className="text-right">Depreciation Amount</TableHead>
                  <TableHead className="text-right">Accumulated</TableHead>
                  <TableHead className="text-right">Book Value</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depreciations.data.map((dep: any) => (
                  <TableRow key={dep.id}>
                    <TableCell className="font-medium">{dep.asset?.name}</TableCell>
                    <TableCell>{formatDate(dep.period)}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        {dep.method}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(dep.amount.toString())}</TableCell>
                    <TableCell className="text-right">{formatCurrency(dep.accumulatedDepreciation.toString())}</TableCell>
                    <TableCell className="text-right">{formatCurrency(dep.bookValue.toString())}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="mb-2">Belum ada depreciation</p>
              <p className="text-sm">Klik "Hitung Penyusutan" untuk menghitung penyusutan aset</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
