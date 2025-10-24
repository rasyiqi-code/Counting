'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { Download, Printer } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function IncomeStatementPage() {
  const [startDate, setStartDate] = useState(new Date(2024, 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(2024, 11, 31).toISOString().split('T')[0]);

  const { data: report, isLoading, refetch } = trpc.reports.financial.incomeStatement.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          Income Statement
        </AnimatedGradientText>
        <p className="text-sm sm:text-base text-muted-foreground">Laporan Laba Rugi</p>
      </div>

      {/* Period Selection */}
      <Card className="mb-6 relative overflow-hidden">
        <BorderBeam size={250} duration={12} delay={0} />
        <CardHeader>
          <CardTitle className="text-lg">Periode Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label>Dari Tanggal</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label>Sampai Tanggal</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={() => refetch()}>
              Generate Report
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report */}
      <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} delay={3} />
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Generating report...
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold">PT. Contoh Perusahaan</h2>
                <h3 className="text-lg font-semibold mt-2">LAPORAN LABA RUGI</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Periode: {formatDate(startDate, 'dd MMMM yyyy')} s/d {formatDate(endDate, 'dd MMMM yyyy')}
                </p>
              </div>

              {/* Revenue */}
              <div>
                <h4 className="font-bold text-lg mb-3">PENDAPATAN</h4>
                {report.revenue.map((line: any) => (
                  <div key={line.accountId} className="flex justify-between py-1.5 px-2 hover:bg-accent rounded">
                    <span className="text-sm">
                      <span className="font-mono text-muted-foreground mr-2">{line.accountCode}</span>
                      {line.accountName}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium w-32 text-right">
                        {formatCurrency(line.amount.toString())}
                      </span>
                      <span className="text-xs text-muted-foreground w-16 text-right">
                        {line.percentage?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between py-2 px-2 mt-2 border-t border-gray-200 font-semibold">
                  <span>TOTAL PENDAPATAN</span>
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-right">
                      {formatCurrency(report.totalRevenue.toString())}
                    </span>
                    <span className="w-16 text-right text-xs">100.0%</span>
                  </div>
                </div>
              </div>

              {/* COGS */}
              <div>
                <h4 className="font-bold text-lg mb-3">HARGA POKOK PENJUALAN</h4>
                {report.cogs.map((line: any) => (
                  <div key={line.accountId} className="flex justify-between py-1.5 px-2 hover:bg-accent rounded">
                    <span className="text-sm">
                      <span className="font-mono text-muted-foreground mr-2">{line.accountCode}</span>
                      {line.accountName}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium w-32 text-right">
                        {formatCurrency(line.amount.toString())}
                      </span>
                      <span className="text-xs text-muted-foreground w-16 text-right">
                        {line.percentage?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between py-2 px-2 mt-2 border-t border-gray-200 font-semibold">
                  <span>TOTAL HPP</span>
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-right">
                      ({formatCurrency(report.totalCOGS.toString())})
                    </span>
                    <span className="w-16 text-right text-xs">
                      {Number(report.totalRevenue) > 0 ? ((Number(report.totalCOGS) / Number(report.totalRevenue)) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Gross Profit */}
              <div className="flex justify-between py-3 px-2 bg-blue-50 rounded-lg font-bold text-lg">
                <span>LABA KOTOR</span>
                <div className="flex items-center gap-4">
                  <span className="w-32 text-right">
                    {formatCurrency(report.grossProfit.toString())}
                  </span>
                  <span className="w-16 text-right text-sm">
                    {report.grossProfitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Expenses */}
              <div>
                <h4 className="font-bold text-lg mb-3">BIAYA OPERASIONAL</h4>
                {report.expenses.map((line: any) => (
                  <div key={line.accountId} className="flex justify-between py-1.5 px-2 hover:bg-accent rounded">
                    <span className="text-sm">
                      <span className="font-mono text-muted-foreground mr-2">{line.accountCode}</span>
                      {line.accountName}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium w-32 text-right">
                        {formatCurrency(line.amount.toString())}
                      </span>
                      <span className="text-xs text-muted-foreground w-16 text-right">
                        {line.percentage?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between py-2 px-2 mt-2 border-t border-gray-200 font-semibold">
                  <span>TOTAL BIAYA</span>
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-right">
                      ({formatCurrency(report.totalExpenses.toString())})
                    </span>
                    <span className="w-16 text-right text-xs">
                      {Number(report.totalRevenue) > 0 ? ((Number(report.totalExpenses) / Number(report.totalRevenue)) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Income */}
              <div className={`flex justify-between py-4 px-4 rounded-lg font-bold text-xl ${
                Number(report.netIncome) > 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                <span>LABA (RUGI) BERSIH</span>
                <div className="flex items-center gap-4">
                  <span className="w-32 text-right">
                    {formatCurrency(report.netIncome.toString())}
                  </span>
                  <span className="w-16 text-right text-base">
                    {report.netProfitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Pilih periode dan klik Generate Report
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

