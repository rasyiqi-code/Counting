'use client';

import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function PurchasePaymentsPage() {
  const [page, setPage] = useState(1);

  const { data: payments, isLoading } = trpc.purchases.payment.list.useQuery({ page, limit: 20 });

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Make Payments
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Pembayaran ke vendor</p>
        </div>
        <Link href="/purchases/payments/new">
          <Button><Plus className="h-4 w-4 mr-2" />Bayar Utang</Button>
        </Link>
      </div>

      <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} />
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : payments && payments.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Payment</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.data.map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono">{payment.paymentNo}</TableCell>
                    <TableCell>{formatDate(payment.date)}</TableCell>
                    <TableCell>{payment.contact?.name}</TableCell>
                    <TableCell>{payment.bankAccount?.name}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(payment.amount.toString())}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">Belum ada payment</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

