'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Building2, Calculator, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function FixedAssetsPage() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          Aset Tetap (Fixed Assets)
        </AnimatedGradientText>
        <p className="text-sm sm:text-base text-muted-foreground">
          Kelola aset tetap, penyusutan, dan pelepasan aset
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Link href="/fixed-assets/register">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer relative overflow-hidden">
            <BorderBeam size={250} duration={12} delay={0} />
            <CardHeader>
              <Building2 className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Assets Register</CardTitle>
              <CardDescription>Daftar aset tetap perusahaan</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Kelola Assets Register</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fixed-assets/depreciation">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer relative overflow-hidden">
            <BorderBeam size={250} duration={12} delay={1.5} />
            <CardHeader>
              <Calculator className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Depreciation</CardTitle>
              <CardDescription>Kalkulasi penyusutan</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Kelola Depreciation</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fixed-assets/disposal">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer relative overflow-hidden">
            <BorderBeam size={250} duration={12} delay={3} />
            <CardHeader>
              <Trash2 className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>Disposal</CardTitle>
              <CardDescription>Pelepasan aset</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Kelola Disposal</Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="mt-6 sm:mt-8 bg-purple-50 border-purple-200 relative overflow-hidden">
        <BorderBeam size={300} duration={15} delay={4.5} />
        <CardContent className="pt-6">
          <p className="text-sm text-purple-800">
            <strong>Backend complete!</strong> Support Straight Line & Declining Balance depreciation. 
            Monthly depreciation auto-generate journal entries.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

