'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { Plus, Search, Eye, Download, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function SalesInvoicesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  
  const { data: invoices, isLoading, error } = trpc.sales.invoice.list.useQuery({
    page,
    limit: 20,
    search,
  });

  // Show error state
  if (error) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Invoices</h2>
          <p className="text-muted-foreground mb-6">
            {error.message || 'An error occurred while loading sales invoices'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Sales Invoices
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Kelola faktur penjualan</p>
        </div>
        <Link href="/sales/invoices/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Invoice Baru
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
                placeholder="Cari invoice..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-3 py-2 text-sm border border-gray-200 rounded-md">
                <option value="">Semua Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="PARTIAL_PAID">Partial Paid</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading invoices...
            </div>
          ) : invoices && invoices.data.length > 0 ? (
            <>
              <Table className="border border-border rounded-lg">
                <TableHeader>
                  <TableRow className="border-b-2 border-border bg-muted/50">
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">No. Invoice</TableHead>
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Tanggal</TableHead>
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Customer</TableHead>
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Jatuh Tempo</TableHead>
                    <TableHead className="text-right whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Total</TableHead>
                    <TableHead className="text-right whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Terbayar</TableHead>
                    <TableHead className="text-center whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Status</TableHead>
                    <TableHead className="text-center whitespace-nowrap py-2 px-2 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.data.map((invoice: any) => (
                    <TableRow key={invoice.id} className="hover:bg-accent/50 border-b border-border">
                      <TableCell className="font-mono font-medium py-1 px-2 border-r border-border whitespace-nowrap">
                        {invoice.invoiceNo}
                      </TableCell>
                      <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap">
                        {formatDate(invoice.date)}
                      </TableCell>
                      <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap">
                        <div>
                          <div className="font-medium truncate">{invoice.contact?.name}</div>
                          <div className="text-xs text-muted-foreground">{invoice.contact?.code}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap">
                        {formatDate(invoice.dueDate)}
                      </TableCell>
                      <TableCell className="text-right font-medium py-1 px-2 border-r border-border whitespace-nowrap">
                        {formatCurrency(invoice.total.toString())}
                      </TableCell>
                      <TableCell className="text-right py-1 px-2 border-r border-border whitespace-nowrap">
                        {formatCurrency(invoice.paidAmount.toString())}
                      </TableCell>
                      <TableCell className="text-center py-1 px-2 border-r border-border whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                          invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'PARTIAL_PAID' ? 'bg-blue-100 text-blue-800' :
                          invoice.status === 'SENT' ? 'bg-yellow-100 text-yellow-800' :
                          invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-1 px-2 whitespace-nowrap">
                        <div className="flex justify-center gap-1">
                          <Link href={`/sales/invoices/${invoice.id}`}>
                            <Button variant="ghost" size="icon" title="View Details" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="Download PDF"
                            className="h-8 w-8"
                            onClick={() => {
                              console.log('Download invoice:', invoice.id);
                              alert('Download PDF functionality will be implemented soon');
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, invoices.pagination.total)} of {invoices.pagination.total} invoices
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
                    disabled={page >= invoices.pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Belum ada invoice</p>
              <Link href="/sales/invoices/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Invoice Pertama
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {invoices && invoices.data.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invoices.pagination.total}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Amount</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  invoices.data.reduce((sum: number, inv: any) => 
                    sum + parseFloat(inv.total.toString()), 0
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Paid</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {invoices.data.filter((inv: any) => inv.status === 'PAID').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Unpaid</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {invoices.data.filter((inv: any) => inv.status !== 'PAID').length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

