'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function ARAgingPage() {
  const { data: arAging, isLoading } = trpc.sales.reports.arAging.useQuery({});

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          AR Aging Report
        </AnimatedGradientText>
        <p className="text-sm sm:text-base text-muted-foreground">Laporan Umur Piutang</p>
      </div>

      <Card className="mb-6 relative overflow-hidden">
        <BorderBeam size={250} duration={12} delay={0} />
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : arAging ? (
            <div className="grid grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Current</div>
                <div className="text-lg font-bold">{formatCurrency(arAging.summary.current)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">1-30 Days</div>
                <div className="text-lg font-bold text-yellow-600">{formatCurrency(arAging.summary.days1_30)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">31-60 Days</div>
                <div className="text-lg font-bold text-orange-600">{formatCurrency(arAging.summary.days31_60)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">61-90 Days</div>
                <div className="text-lg font-bold text-red-600">{formatCurrency(arAging.summary.days61_90)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Over 90</div>
                <div className="text-lg font-bold text-red-800">{formatCurrency(arAging.summary.over90)}</div>
              </div>
              <div className="text-center bg-blue-50 rounded-lg p-2">
                <div className="text-xs text-blue-700 mb-1">TOTAL</div>
                <div className="text-lg font-bold text-blue-900">{formatCurrency(arAging.summary.total)}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No data</div>
          )}
        </CardContent>
      </Card>

      {arAging && arAging.invoices && (
        <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} delay={3} />
          <CardHeader>
            <CardTitle>Detail Piutang</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-center">Days Past Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {arAging.invoices.map((inv: any) => (
                  <TableRow key={inv.invoiceNo}>
                    <TableCell className="font-mono">{inv.invoiceNo}</TableCell>
                    <TableCell>{inv.customer?.name}</TableCell>
                    <TableCell>{formatDate(inv.dueDate)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(inv.total.toString())}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(inv.balance)}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        inv.daysPastDue === 0 ? 'bg-green-100 text-green-800' :
                        inv.daysPastDue <= 30 ? 'bg-yellow-100 text-yellow-800' :
                        inv.daysPastDue <= 60 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {inv.daysPastDue} days
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

