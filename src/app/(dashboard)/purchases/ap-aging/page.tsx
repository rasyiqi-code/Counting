'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';

export default function APAgingPage() {
  const { data: apAging, isLoading } = trpc.purchases.reports.apAging.useQuery({});

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AP Aging Report</h1>
        <p className="text-muted-foreground">Laporan Umur Utang</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : apAging ? (
            <div className="grid grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Current</div>
                <div className="text-lg font-bold">{formatCurrency(apAging.summary.current)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">1-30 Days</div>
                <div className="text-lg font-bold text-yellow-600">{formatCurrency(apAging.summary.days1_30)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">31-60 Days</div>
                <div className="text-lg font-bold text-orange-600">{formatCurrency(apAging.summary.days31_60)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">61-90 Days</div>
                <div className="text-lg font-bold text-red-600">{formatCurrency(apAging.summary.days61_90)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Over 90</div>
                <div className="text-lg font-bold text-red-800">{formatCurrency(apAging.summary.over90)}</div>
              </div>
              <div className="text-center bg-red-50 rounded-lg p-2">
                <div className="text-xs text-red-700 mb-1">TOTAL</div>
                <div className="text-lg font-bold text-red-900">{formatCurrency(apAging.summary.total)}</div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {apAging && apAging.bills && (
        <Card>
          <CardHeader>
            <CardTitle>Detail Utang</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill No</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-center">Days Past Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apAging.bills.map((bill: any) => (
                  <TableRow key={bill.billNo}>
                    <TableCell className="font-mono">{bill.billNo}</TableCell>
                    <TableCell>{bill.vendor?.name}</TableCell>
                    <TableCell>{formatDate(bill.dueDate)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(bill.total.toString())}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(bill.balance)}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        bill.daysPastDue <= 30 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {bill.daysPastDue} days
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

