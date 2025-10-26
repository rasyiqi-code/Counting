'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { DollarSign, TrendingDown, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function CashBankPage() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          Kas & Bank
        </AnimatedGradientText>
        <p className="text-sm sm:text-base text-muted-foreground">
          Kelola penerimaan & pengeluaran kas/bank, transfer antar rekening
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Link href="/cash-bank/other-income">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer relative overflow-hidden">
            <BorderBeam size={250} duration={12} delay={0} />
            <CardHeader>
              <DollarSign className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Other Income</CardTitle>
              <CardDescription>Penerimaan lain-lain (non-sales)</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Kelola Other Income</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/cash-bank/other-expense">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer relative overflow-hidden">
            <BorderBeam size={250} duration={12} delay={1.5} />
            <CardHeader>
              <TrendingDown className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>Other Expense</CardTitle>
              <CardDescription>Pengeluaran lain-lain</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Kelola Other Expense</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/cash-bank/bank-transfer">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer relative overflow-hidden">
            <BorderBeam size={250} duration={12} delay={3} />
            <CardHeader>
              <ArrowLeftRight className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Bank Transfer</CardTitle>
              <CardDescription>Transfer antar rekening</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Kelola Bank Transfer</Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="mt-6 sm:mt-8 bg-green-50 border-green-200 relative overflow-hidden">
        <BorderBeam size={300} duration={15} delay={4.5} />
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

