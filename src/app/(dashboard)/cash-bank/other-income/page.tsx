'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { Plus, Search, Eye, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function OtherIncomePage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // TODO: Implement other income list procedure
  const incomes = { data: [], pagination: { total: 0 } };
  const isLoading = false;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Other Income
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Penerimaan lain-lain (non-sales)</p>
        </div>
        <Link href="/cash-bank/other-income/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Other Income
          </Button>
        </Link>
      </div>

      <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} />
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari other income..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9" 
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading other income...</div>
          ) : incomes && incomes.data.length > 0 ? (
            <Table className="border border-border rounded-lg">
              <TableHeader className="border-b-2 border-border bg-muted/50">
                <TableRow>
                  <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">No. Transaksi</TableHead>
                  <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Tanggal</TableHead>
                  <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Deskripsi</TableHead>
                  <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Akun</TableHead>
                  <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold text-right">Amount</TableHead>
                  <TableHead className="whitespace-nowrap py-2 px-2 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.data.map((income: any) => (
                  <TableRow key={income.id} className="hover:bg-accent/50 border-b border-border">
                    <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap font-mono">{income.transactionNo}</TableCell>
                    <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap">{formatDate(income.date)}</TableCell>
                    <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap">{income.description}</TableCell>
                    <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap">{income.account?.name}</TableCell>
                    <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap text-right font-medium">{formatCurrency(income.amount.toString())}</TableCell>
                    <TableCell className="py-1 px-2 whitespace-nowrap">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="mb-2">Belum ada other income</p>
              <p className="text-sm">Klik "Tambah Other Income" untuk menambah penerimaan</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
