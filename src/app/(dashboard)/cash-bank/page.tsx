'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { DollarSign, TrendingDown, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';

export default function CashBankPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Kas & Bank</h1>
        <p className="text-muted-foreground">
          Kelola penerimaan & pengeluaran kas/bank, transfer antar rekening
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <DollarSign className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Other Income</CardTitle>
            <CardDescription>Penerimaan lain-lain (non-sales)</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/cash-bank/other-income">
              <Button className="w-full">Kelola Other Income</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <TrendingDown className="h-8 w-8 text-red-600 mb-2" />
            <CardTitle>Other Expense</CardTitle>
            <CardDescription>Pengeluaran lain-lain</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/cash-bank/other-expense">
              <Button className="w-full">Kelola Other Expense</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <ArrowLeftRight className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Bank Transfer</CardTitle>
            <CardDescription>Transfer antar rekening</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/cash-bank/bank-transfer">
              <Button className="w-full">Kelola Bank Transfer</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <p className="text-sm text-green-800">
            <strong>Backend API ready!</strong> Semua functionality untuk Other Income, Other Expense, 
            dan Bank Transfer sudah tersedia via tRPC. UI forms bisa dibuat dengan follow pattern yang sama.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

