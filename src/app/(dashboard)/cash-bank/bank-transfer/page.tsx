'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { Plus, Search, Eye, ArrowLeftRight } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function BankTransferPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // TODO: Implement bank transfer list procedure
  const transfers = { data: [], pagination: { total: 0 } };
  const isLoading = false;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Bank Transfer
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Transfer antar rekening</p>
        </div>
        <Link href="/cash-bank/bank-transfer/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Bank Transfer
          </Button>
        </Link>
      </div>

      <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} />
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari bank transfer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9" 
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading bank transfers...</div>
          ) : transfers && transfers.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Transfer</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Dari Akun</TableHead>
                  <TableHead>Ke Akun</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.data.map((transfer: any) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-mono">{transfer.transferNo}</TableCell>
                    <TableCell>{formatDate(transfer.date)}</TableCell>
                    <TableCell>{transfer.fromAccount?.name}</TableCell>
                    <TableCell>{transfer.toAccount?.name}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(transfer.amount.toString())}</TableCell>
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
              <ArrowLeftRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="mb-2">Belum ada bank transfer</p>
              <p className="text-sm">Klik "Buat Bank Transfer" untuk transfer antar rekening</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
