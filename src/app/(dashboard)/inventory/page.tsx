'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Package, ClipboardList, TrendingUp, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Persediaan (Inventory)</h1>
        <p className="text-muted-foreground">
          Kelola stok barang, adjustment, dan valuasi persediaan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/inventory/stock-card">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Package className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Stock Card</CardTitle>
              <CardDescription>Kartu stok per produk</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full text-sm">Buka →</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/inventory/adjustments">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <ClipboardList className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle className="text-lg">Adjustments</CardTitle>
              <CardDescription>Penyesuaian stok</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full text-sm">Buka →</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/inventory/transfers">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <ArrowLeftRight className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Transfers</CardTitle>
              <CardDescription>Transfer antar gudang</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full text-sm">Buka →</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/inventory/valuation">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Valuation</CardTitle>
              <CardDescription>Nilai persediaan</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full text-sm">Buka →</Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Stock Valuation Methods
              </h4>
              <p className="text-sm text-blue-800">
                Sistem support FIFO (First In First Out) dan Average costing method. 
                Setiap stock adjustment otomatis generate journal untuk update nilai persediaan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

