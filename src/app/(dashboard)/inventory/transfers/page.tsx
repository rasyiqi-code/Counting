'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Plus, Search, ArrowRight } from 'lucide-react';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function InventoryTransfersPage() {
  const [search, setSearch] = useState('');

  // TODO: Implement tRPC query for inventory transfers
  const transfers: any[] = [];
  const isLoading = false;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Inventory Transfers
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">
            Transfer stok antar gudang
          </p>
        </div>
        <Link href="/inventory/transfers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Transfer Baru
          </Button>
        </Link>
      </div>

      <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} />
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari transfer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-3 py-2 text-sm border border-gray-200 rounded-md">
                <option value="">Semua Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading transfers...
            </div>
          ) : transfers && transfers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Transfer</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Dari Gudang</TableHead>
                  <TableHead className="text-center">
                    <ArrowRight className="h-4 w-4 mx-auto" />
                  </TableHead>
                  <TableHead>Ke Gudang</TableHead>
                  <TableHead className="text-right">Total Item</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer: any) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-mono font-medium">
                      {transfer.transferNo}
                    </TableCell>
                    <TableCell>{formatDate(transfer.date)}</TableCell>
                    <TableCell>{transfer.fromWarehouse?.name || 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />
                    </TableCell>
                    <TableCell>{transfer.toWarehouse?.name || 'N/A'}</TableCell>
                    <TableCell className="text-right">{transfer.items?.length || 0}</TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transfer.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        transfer.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                        transfer.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        transfer.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transfer.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/inventory/transfers/${transfer.id}`}>
                        <Button variant="ghost" size="icon" title="View Details">
                          <Search className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <ArrowRight className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">Belum ada transfer stok</p>
              <Link href="/inventory/transfers/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Transfer Pertama
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {transfers && transfers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Transfers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transfers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {transfers.filter((t: any) => t.status === 'PENDING').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Transit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {transfers.filter((t: any) => t.status === 'IN_TRANSIT').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {transfers.filter((t: any) => t.status === 'COMPLETED').length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

