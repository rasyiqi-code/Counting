'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Building2, Calculator, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function FixedAssetsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Aset Tetap (Fixed Assets)</h1>
        <p className="text-muted-foreground">
          Kelola aset tetap, penyusutan, dan pelepasan aset
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <Building2 className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Assets Register</CardTitle>
            <CardDescription>Daftar aset tetap perusahaan</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/fixed-assets/register">
              <Button className="w-full">Kelola Assets Register</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <Calculator className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Depreciation</CardTitle>
            <CardDescription>Kalkulasi penyusutan</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/fixed-assets/depreciation">
              <Button className="w-full">Kelola Depreciation</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <Trash2 className="h-8 w-8 text-red-600 mb-2" />
            <CardTitle>Disposal</CardTitle>
            <CardDescription>Pelepasan aset</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/fixed-assets/disposal">
              <Button className="w-full">Kelola Disposal</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 bg-purple-50 border-purple-200">
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

