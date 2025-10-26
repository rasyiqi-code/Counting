'use client';

import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { Plus, Search, Eye } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function PurchaseBillsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: bills, isLoading } = trpc.purchases.bill.list.useQuery({
    page,
    limit: 20,
    search,
  });

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Purchase Bills
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Faktur pembelian dari vendor</p>
        </div>
        <Link href="/purchases/bills/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Bill Baru
          </Button>
        </Link>
      </div>

      <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} />
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari bill..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading bills...</div>
          ) : bills && bills.data.length > 0 ? (
            <Table className="border border-border rounded-lg">
              <TableHeader className="border-b-2 border-border bg-muted/50">
                <TableRow>
                  <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">No. Bill</TableHead>
                  <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Tanggal</TableHead>
                  <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Vendor</TableHead>
                  <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Jatuh Tempo</TableHead>
                  <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold text-right">Total</TableHead>
                  <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold text-center">Status</TableHead>
                  <TableHead className="whitespace-nowrap py-2 px-2 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.data.map((bill: any) => (
                  <TableRow key={bill.id} className="hover:bg-accent/50 border-b border-border">
                    <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap font-mono font-medium">{bill.invoiceNo}</TableCell>
                    <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap">{formatDate(bill.date)}</TableCell>
                    <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap">{bill.contact?.name}</TableCell>
                    <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap">{formatDate(bill.dueDate)}</TableCell>
                    <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap text-right font-medium">{formatCurrency(bill.total.toString())}</TableCell>
                    <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        bill.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bill.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-1 px-2 whitespace-nowrap text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">Belum ada bill</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

