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

export default function CashFlowPage() {
  const [startDate, setStartDate] = useState(new Date(2024, 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(2024, 11, 31).toISOString().split('T')[0]);

  const { data: report, isLoading, refetch } = trpc.reports.financial.cashFlow.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          Cash Flow Statement
        </AnimatedGradientText>
        <p className="text-muted-foreground">Laporan Arus Kas</p>
      </div>

      <Card className="mb-6 relative overflow-hidden">
        <BorderBeam size={250} duration={12} delay={0} />
        <CardHeader>
          <CardTitle className="text-lg">Periode Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label>Dari Tanggal</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex-1">
              <Label>Sampai Tanggal</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button onClick={() => refetch()}>Generate Report</Button>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export PDF</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} delay={3} />
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : report ? (
            <div>
              <div className="text-center border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold">PT. Contoh Perusahaan</h2>
                <h3 className="text-lg font-semibold mt-2">LAPORAN ARUS KAS</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Periode: {formatDate(startDate, 'dd MMMM yyyy')} s/d {formatDate(endDate, 'dd MMMM yyyy')}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold mb-2">Arus Kas dari Aktivitas Operasi</h4>
                  <div className="pl-4">
                    {report.operating.lines.map((line: any, idx: number) => (
                      <div key={idx} className="flex justify-between py-1">
                        <span className="text-sm">{line.description}</span>
                        <span className="font-medium">{formatCurrency(line.amount.toString())}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 mt-2 border-t font-semibold">
                      <span>Total Operasi</span>
                      <span>{formatCurrency(report.operating.total.toString())}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Arus Kas dari Aktivitas Investasi</h4>
                  <div className="pl-4">
                    {report.investing.lines.map((line: any, idx: number) => (
                      <div key={idx} className="flex justify-between py-1">
                        <span className="text-sm">{line.description}</span>
                        <span className="font-medium">{formatCurrency(line.amount.toString())}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 mt-2 border-t font-semibold">
                      <span>Total Investasi</span>
                      <span>{formatCurrency(report.investing.total.toString())}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Arus Kas dari Aktivitas Pendanaan</h4>
                  <div className="pl-4">
                    {report.financing.lines.map((line: any, idx: number) => (
                      <div key={idx} className="flex justify-between py-1">
                        <span className="text-sm">{line.description}</span>
                        <span className="font-medium">{formatCurrency(line.amount.toString())}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 mt-2 border-t font-semibold">
                      <span>Total Pendanaan</span>
                      <span>{formatCurrency(report.financing.total.toString())}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 pt-4 space-y-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Kenaikan (Penurunan) Kas</span>
                    <span className={Number(report.netCashFlow) > 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(report.netCashFlow.toString())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kas Awal Periode</span>
                    <span className="font-medium">{formatCurrency(report.beginningCash.toString())}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-blue-50 rounded-lg px-3 font-bold text-lg">
                    <span>Kas Akhir Periode</span>
                    <span>{formatCurrency(report.endingCash.toString())}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

