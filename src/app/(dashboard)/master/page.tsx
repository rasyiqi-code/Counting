'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Database, Users, Package, Building, Receipt } from 'lucide-react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

const masterDataModules = [
  {
    title: 'Chart of Accounts',
    description: 'Kelola bagan akun perusahaan',
    icon: Database,
    href: '/master/coa',
    color: 'blue',
  },
  {
    title: 'Customers',
    description: 'Kelola data pelanggan',
    icon: Users,
    href: '/master/customers',
    color: 'green',
  },
  {
    title: 'Vendors',
    description: 'Kelola data pemasok',
    icon: Building,
    href: '/master/vendors',
    color: 'purple',
  },
  {
    title: 'Products & Services',
    description: 'Kelola barang dan jasa',
    icon: Package,
    href: '/master/products',
    color: 'orange',
  },
  {
    title: 'Bank Accounts',
    description: 'Kelola rekening bank & kas',
    icon: Receipt,
    href: '/master/bank-accounts',
    color: 'indigo',
  },
];

export default function MasterDataPage() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          Master Data
        </AnimatedGradientText>
        <p className="text-sm sm:text-base text-muted-foreground">
          Kelola data master perusahaan - Chart of Accounts, Kontak, dan Produk
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {masterDataModules.map((module, index) => (
          <Link key={module.href} href={module.href}>
            <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer group relative overflow-hidden">
              <BorderBeam size={250} duration={12 + index * 2} delay={index * 1.5} />
              <CardHeader>
                <div className={`inline-flex p-3 rounded-lg bg-${module.color}-100 group-hover:bg-${module.color}-200 transition-colors w-fit`}>
                  <module.icon className={`h-6 w-6 text-${module.color}-600`} />
                </div>
                <CardTitle className="mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full group-hover:bg-accent">
                  Buka →
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Info */}
      <Card className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 relative overflow-hidden">
        <BorderBeam size={300} duration={15} delay={7} />
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Master Data Foundation
              </h4>
              <p className="text-sm text-blue-800">
                Master Data adalah fondasi sistem akuntansi. Pastikan Chart of Accounts, Customers, 
                Vendors, dan Products sudah diinput dengan benar sebelum membuat transaksi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

