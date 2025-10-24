'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { Download } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function TaxReportsPage() {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: ppnReport, isLoading, refetch } = trpc.reports.tax.ppn.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          Tax Reports
        </AnimatedGradientText>
        <p className="text-muted-foreground">Laporan Pajak (PPN & PPh)</p>
      </div>

      <Card className="mb-6">
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
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
          </div>
        </CardContent>
      </Card>

      {ppnReport && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Laporan PPN (Pajak Pertambahan Nilai)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>PPN Masukan (Input)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(ppnReport.ppnInput.total.toString())}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>PPN Keluaran (Output)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(ppnReport.ppnOutput.total.toString())}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>PPN Kurang/(Lebih) Bayar</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${
                        Number(ppnReport.netPPN) > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(ppnReport.netPPN.toString())}
                      </div>
                      <div className="text-xs mt-1">
                        <span className={`px-2 py-1 rounded ${
                          ppnReport.status === 'KURANG_BAYAR' ? 'bg-red-100 text-red-800' :
                          ppnReport.status === 'LEBIH_BAYAR' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ppnReport.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

