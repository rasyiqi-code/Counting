'use client';

import { Card, CardContent, CardDescription, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { Plus, Search, Eye, Mail, Phone } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function VendorsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: vendors, isLoading } = trpc.masterData.contact.list.useQuery({
    type: 'VENDOR',
    search,
    page,
    limit: 20,
  });

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Vendors / Suppliers
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Kelola data pemasok</p>
        </div>
        <Link href="/master/vendors/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Vendor
          </Button>
        </Link>
      </div>

      <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} />
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading vendors...
            </div>
          ) : vendors && vendors.data.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Bank Info</TableHead>
                    <TableHead className="text-center">Payment Terms</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.data.map((vendor: any) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-mono font-medium">
                        {vendor.code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{vendor.name}</div>
                          {vendor.npwp && (
                            <div className="text-xs text-muted-foreground">
                              NPWP: {vendor.npwp}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {vendor.email && (
                            <div className="flex items-center gap-1 text-xs">
                              <Mail className="h-3 w-3" />
                              {vendor.email}
                            </div>
                          )}
                          {vendor.phone && (
                            <div className="flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3" />
                              {vendor.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {vendor.bankName && (
                          <div className="text-sm">
                            <div className="font-medium">{vendor.bankName}</div>
                            <div className="text-xs text-muted-foreground">
                              {vendor.bankAccountNumber}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {vendor.paymentTerms ? `${vendor.paymentTerms} hari` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/master/vendors/${vendor.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, vendors.pagination.total)} of {vendors.pagination.total} vendors
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= vendors.pagination.pages}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Belum ada vendor</p>
              <Link href="/master/vendors/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Vendor Pertama
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

