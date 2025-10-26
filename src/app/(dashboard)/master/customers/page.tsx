'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
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

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: customers, isLoading } = trpc.masterData.contact.list.useQuery({
    type: 'CUSTOMER',
    search,
    page,
    limit: 20,
  });

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Customers
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Kelola data pelanggan</p>
        </div>
        <Link href="/master/customers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Customer
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
                placeholder="Cari customer..."
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
              Loading customers...
            </div>
          ) : customers && customers.data.length > 0 ? (
            <>
              <Table className="border border-border rounded-lg">
                <TableHeader>
                  <TableRow className="border-b-2 border-border bg-muted/50">
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Kode</TableHead>
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Nama</TableHead>
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Kontak</TableHead>
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Alamat</TableHead>
                    <TableHead className="text-right whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Credit Limit</TableHead>
                    <TableHead className="text-center whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Payment Terms</TableHead>
                    <TableHead className="text-center whitespace-nowrap py-2 px-2 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.data.map((customer: any) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-mono font-medium">
                        {customer.code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          {customer.npwp && (
                            <div className="text-xs text-muted-foreground">
                              NPWP: {customer.npwp}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center gap-1 text-xs">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {customer.address || '-'}
                        {customer.city && `, ${customer.city}`}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {customer.creditLimit 
                          ? formatCurrency(customer.creditLimit.toString())
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-center">
                        {customer.paymentTerms ? `${customer.paymentTerms} hari` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link href={`/master/customers/${customer.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, customers.pagination.total)} of {customers.pagination.total} customers
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= customers.pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Belum ada customer</p>
              <Link href="/master/customers/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Customer Pertama
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {customers && customers.data.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.pagination.total}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Dengan NPWP</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {customers.data.filter((c: any) => c.npwp).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Dengan Email</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {customers.data.filter((c: any) => c.email).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {customers.data.filter((c: any) => c.isActive).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

