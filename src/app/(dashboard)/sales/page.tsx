'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { FileText, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function SalesPage() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          Penjualan (Accounts Receivable)
        </AnimatedGradientText>
        <p className="text-sm sm:text-base text-muted-foreground">
          Kelola faktur penjualan, pembayaran dari customer, dan laporan piutang
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Link href="/sales/invoices">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer relative overflow-hidden">
            <BorderBeam size={250} duration={12} delay={0} />
            <CardHeader>
              <FileText className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Sales Invoices</CardTitle>
              <CardDescription>Buat dan kelola faktur penjualan</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">Buka →</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/sales/payments">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer relative overflow-hidden">
            <BorderBeam size={250} duration={12} delay={1.5} />
            <CardHeader>
              <DollarSign className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Receive Payments</CardTitle>
              <CardDescription>Catat pembayaran dari customer</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">Buka →</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/sales/ar-aging">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer relative overflow-hidden">
            <BorderBeam size={250} duration={12} delay={3} />
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>AR Aging</CardTitle>
              <CardDescription>Laporan umur piutang</CardDescription>
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

