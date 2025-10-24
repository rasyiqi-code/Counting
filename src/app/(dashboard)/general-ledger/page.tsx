'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { BookOpen, FileText, Scale } from 'lucide-react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function GeneralLedgerPage() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          Buku Besar (General Ledger)
        </AnimatedGradientText>
        <p className="text-sm sm:text-base text-muted-foreground">
          Pusat dari semua transaksi akuntansi - Journal Entry, Ledger, Trial Balance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Link href="/general-ledger/journals">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer relative overflow-hidden">
            <BorderBeam size={250} duration={12} delay={0} />
            <CardHeader>
              <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Journals</CardTitle>
              <CardDescription>Lihat dan buat jurnal transaksi</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">Buka →</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/general-ledger/ledger">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer relative overflow-hidden">
            <BorderBeam size={250} duration={12} delay={1.5} />
            <CardHeader>
              <FileText className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Account Ledger</CardTitle>
              <CardDescription>Lihat pergerakan per akun</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">Buka →</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/general-ledger/trial-balance">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer relative overflow-hidden">
            <BorderBeam size={250} duration={12} delay={3} />
            <CardHeader>
              <Scale className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Trial Balance</CardTitle>
              <CardDescription>Neraca saldo (verifikasi balanced)</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">Buka →</Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="mt-6 sm:mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 relative overflow-hidden">
        <BorderBeam size={300} duration={15} delay={5} />
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-green-900 mb-1">
                Double Entry System Active
              </h4>
              <p className="text-sm text-green-800">
                Semua transaksi dijamin balanced. Setiap jurnal akan otomatis memvalidasi bahwa 
                total debit sama dengan total kredit sebelum disimpan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

