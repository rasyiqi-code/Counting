'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { FileText, PieChart, TrendingUp, Receipt } from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Laporan Keuangan</h1>
        <p className="text-muted-foreground">
          Generate laporan keuangan, pajak, dan analisis
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Laporan Keuangan Utama</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/reports/income-statement">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <FileText className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Income Statement</CardTitle>
                <CardDescription>Laporan Laba Rugi</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">Buka →</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reports/balance-sheet">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <PieChart className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Balance Sheet</CardTitle>
                <CardDescription>Neraca / Posisi Keuangan</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">Buka →</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reports/cash-flow">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Cash Flow</CardTitle>
                <CardDescription>Laporan Arus Kas</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">Buka →</Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Laporan Pajak</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/reports/tax">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Receipt className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle>Tax Reports</CardTitle>
                <CardDescription>Laporan PPN & PPh</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">Buka →</Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

