'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { FileText, DollarSign, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function PurchasesPage() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          Pembelian (Accounts Payable)
        </AnimatedGradientText>
        <p className="text-sm sm:text-base text-muted-foreground">
          Kelola faktur pembelian, pembayaran ke vendor, dan laporan utang
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Link href="/purchases/bills">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer relative overflow-hidden">
            <BorderBeam size={250} duration={12} delay={0} />
            <CardHeader>
              <FileText className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>Purchase Bills</CardTitle>
              <CardDescription>Kelola tagihan dari vendor</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">Buka →</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/purchases/payments">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer relative overflow-hidden">
            <BorderBeam size={250} duration={12} delay={1.5} />
            <CardHeader>
              <DollarSign className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Make Payments</CardTitle>
              <CardDescription>Bayar utang ke vendor</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">Buka →</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/purchases/ap-aging">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer relative overflow-hidden">
            <BorderBeam size={250} duration={12} delay={3} />
            <CardHeader>
              <TrendingDown className="h-8 w-8 text-indigo-600 mb-2" />
              <CardTitle>AP Aging</CardTitle>
              <CardDescription>Laporan umur utang</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">Buka →</Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

