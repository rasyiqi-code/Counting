'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { Plus, Search, Eye, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function OtherExpensePage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // TODO: Implement other expense list procedure
  const expenses = { data: [], pagination: { total: 0 } };
  const isLoading = false;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Other Expense
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Pengeluaran lain-lain</p>
        </div>
        <Link href="/cash-bank/other-expense/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Other Expense
          </Button>
        </Link>
      </div>

      <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} />
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari other expense..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9" 
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading other expense...</div>
          ) : expenses && expenses.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Transaksi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Akun</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.data.map((expense: any) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-mono">{expense.transactionNo}</TableCell>
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.account?.name}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(expense.amount.toString())}</TableCell>
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
              <p className="mb-2">Belum ada other expense</p>
              <p className="text-sm">Klik "Tambah Other Expense" untuk menambah pengeluaran</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
