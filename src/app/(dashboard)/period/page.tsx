'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Calendar, Lock } from 'lucide-react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function PeriodPage() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          Tutup Buku (Period Closing)
        </AnimatedGradientText>
        <p className="text-sm sm:text-base text-muted-foreground">
          Tutup buku bulanan dan tahunan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="hover:shadow-lg transition-all hover:scale-105 relative overflow-hidden">
          <BorderBeam size={250} duration={12} delay={0} />
          <CardHeader>
            <Calendar className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Monthly Closing</CardTitle>
            <CardDescription>Tutup buku bulanan</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Lock periode bulanan untuk mencegah perubahan transaksi.
            </p>
            <Link href="/period/monthly-closing">
              <Button className="w-full">Kelola Monthly Closing</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:scale-105 relative overflow-hidden">
          <BorderBeam size={250} duration={12} delay={1.5} />
          <CardHeader>
            <Lock className="h-8 w-8 text-red-600 mb-2" />
            <CardTitle>Year-End Closing</CardTitle>
            <CardDescription>Tutup buku tahunan</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Zero out revenue & expense accounts, transfer to retained earnings.
            </p>
            <Link href="/period/year-end-closing">
              <Button className="w-full">Kelola Year-End Closing</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 sm:mt-8 bg-orange-50 border-orange-200 relative overflow-hidden">
        <BorderBeam size={300} duration={15} delay={3} />
        <CardContent className="pt-6">
          <p className="text-sm text-orange-800">
            <strong>Backend complete!</strong> Period closing service sudah implement monthly & year-end closing 
            dengan auto-transfer net income to retained earnings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

