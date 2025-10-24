'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { Download } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function BalanceSheetPage() {
  const [asOfDate, setAsOfDate] = useState(new Date(2024, 11, 31).toISOString().split('T')[0]);

  const { data: report, isLoading, refetch } = trpc.reports.financial.balanceSheet.useQuery({
    startDate: new Date(2024, 0, 1),
    endDate: new Date(asOfDate),
  });

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          Balance Sheet
        </AnimatedGradientText>
        <p className="text-sm sm:text-base text-muted-foreground">Neraca / Laporan Posisi Keuangan</p>
      </div>

      {/* Date Selection */}
      <Card className="mb-6 relative overflow-hidden">
        <BorderBeam size={250} duration={12} delay={0} />
        <CardHeader>
          <CardTitle className="text-lg">As Of Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-sm">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
            </div>
            <Button onClick={() => refetch()}>
              Generate Report
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Assets */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading...
              </div>
            ) : report ? (
              <div>
                {/* Header */}
                <div className="text-center border-b pb-4 mb-6">
                  <h2 className="text-xl font-bold">PT. Contoh Perusahaan</h2>
                  <h3 className="font-semibold mt-1">NERACA</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per {formatDate(asOfDate, 'dd MMMM yyyy')}
                  </p>
                </div>

                {/* Current Assets */}
                <div className="mb-6">
                  <h4 className="font-bold text-sm mb-3 text-blue-800 uppercase">Aset Lancar</h4>
                  {report.assets.current.map((line: any) => (
                    <div key={line.accountId} className="flex justify-between py-1.5 px-2 hover:bg-accent rounded">
                      <span className="text-sm">
                        <span className="font-mono text-xs text-muted-foreground mr-2">{line.accountCode}</span>
                        {line.accountName}
                      </span>
                      <span className="text-sm font-medium">
                        {formatCurrency(line.amount.toString())}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 px-2 mt-2 border-t font-semibold text-sm">
                    <span>Total Aset Lancar</span>
                    <span>
                      {formatCurrency(
                        report.assets.current.reduce((sum: any, line: any) => 
                          sum + line.amount, 0
                        ).toString()
                      )}
                    </span>
                  </div>
                </div>

                {/* Fixed Assets */}
                <div className="mb-6">
                  <h4 className="font-bold text-sm mb-3 text-blue-800 uppercase">Aset Tetap</h4>
                  {report.assets.fixed.map((line: any) => (
                    <div key={line.accountId} className="flex justify-between py-1.5 px-2 hover:bg-accent rounded">
                      <span className="text-sm">
                        <span className="font-mono text-xs text-muted-foreground mr-2">{line.accountCode}</span>
                        {line.accountName}
                      </span>
                      <span className="text-sm font-medium">
                        {formatCurrency(line.amount.toString())}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 px-2 mt-2 border-t font-semibold text-sm">
                    <span>Total Aset Tetap</span>
                    <span>
                      {formatCurrency(
                        report.assets.fixed.reduce((sum: any, line: any) => 
                          sum + line.amount, 0
                        ).toString()
                      )}
                    </span>
                  </div>
                </div>

                {/* Total Assets */}
                <div className="flex justify-between py-3 px-3 bg-blue-600 text-white rounded-lg font-bold">
                  <span>TOTAL ASET</span>
                  <span>
                    {formatCurrency(report.assets.total.toString())}
                  </span>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Right Column - Liabilities & Equity */}
        <Card>
          <CardContent className="pt-6">
            {report && (
              <div>
                {/* Header Spacer */}
                <div className="h-[116px]"></div>

                {/* Current Liabilities */}
                <div className="mb-6">
                  <h4 className="font-bold text-sm mb-3 text-red-800 uppercase">Liabilitas Lancar</h4>
                  {report.liabilities.current.map((line: any) => (
                    <div key={line.accountId} className="flex justify-between py-1.5 px-2 hover:bg-accent rounded">
                      <span className="text-sm">
                        <span className="font-mono text-xs text-muted-foreground mr-2">{line.accountCode}</span>
                        {line.accountName}
                      </span>
                      <span className="text-sm font-medium">
                        {formatCurrency(line.amount.toString())}
                      </span>
                    </div>
                  ))}
                  {report.liabilities.current.length > 0 && (
                    <div className="flex justify-between py-2 px-2 mt-2 border-t font-semibold text-sm">
                      <span>Total Liabilitas Lancar</span>
                      <span>
                        {formatCurrency(
                          report.liabilities.current.reduce((sum: any, line: any) => 
                            sum + line.amount, 0
                          ).toString()
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Long-term Liabilities */}
                {report.liabilities.longTerm.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-sm mb-3 text-red-800 uppercase">Liabilitas Jangka Panjang</h4>
                    {report.liabilities.longTerm.map((line: any) => (
                      <div key={line.accountId} className="flex justify-between py-1.5 px-2 hover:bg-accent rounded">
                        <span className="text-sm">
                          <span className="font-mono text-xs text-muted-foreground mr-2">{line.accountCode}</span>
                          {line.accountName}
                        </span>
                        <span className="text-sm font-medium">
                          {formatCurrency(line.amount.toString())}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total Liabilities */}
                <div className="flex justify-between py-2 px-2 mb-6 border-y font-semibold">
                  <span>TOTAL LIABILITAS</span>
                  <span>
                    {formatCurrency(report.liabilities.total.toString())}
                  </span>
                </div>

                {/* Equity */}
                <div className="mb-6">
                  <h4 className="font-bold text-sm mb-3 text-purple-800 uppercase">Ekuitas</h4>
                  {report.equity.lines.map((line: any) => (
                    <div key={line.accountId} className="flex justify-between py-1.5 px-2 hover:bg-accent rounded">
                      <span className="text-sm">
                        <span className="font-mono text-xs text-muted-foreground mr-2">{line.accountCode}</span>
                        {line.accountName}
                      </span>
                      <span className="text-sm font-medium">
                        {formatCurrency(line.amount.toString())}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 px-2 mt-2 border-t font-semibold text-sm">
                    <span>Total Ekuitas</span>
                    <span>
                      {formatCurrency(report.equity.total.toString())}
                    </span>
                  </div>
                </div>

                {/* Total Liabilities & Equity */}
                <div className="flex justify-between py-3 px-3 bg-purple-600 text-white rounded-lg font-bold">
                  <span>TOTAL LIABILITAS & EKUITAS</span>
                  <span>
                    {formatCurrency(report.totalLiabilitiesAndEquity.toString())}
                  </span>
                </div>

                {/* Validation */}
                <div className="mt-4 text-center">
                  {Number(report.assets.total) === Number(report.totalLiabilitiesAndEquity) ? (
                    <div className="text-green-600 font-semibold text-sm">
                      ✓ Balance Sheet is Balanced
                    </div>
                  ) : (
                    <div className="text-red-600 font-semibold text-sm">
                      ✗ Balance Sheet is NOT Balanced
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

