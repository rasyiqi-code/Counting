'use client';

import { Card, CardContent, CardDescription, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { Plus, Search, Eye, Package } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  const { data: products, isLoading } = trpc.masterData.product.list.useQuery({
    search,
    type: typeFilter || undefined,
    page,
    limit: 20,
  });

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Products & Services
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Kelola barang dan jasa</p>
        </div>
        <Link href="/master/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Product
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
                placeholder="Cari product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              className="px-3 py-2 text-sm border border-gray-200 rounded-md"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Semua Tipe</option>
              <option value="GOODS">Barang</option>
              <option value="SERVICE">Jasa</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading products...
            </div>
          ) : products && products.data.length > 0 ? (
            <>
              <Table className="border border-border rounded-lg">
                <TableHeader className="border-b-2 border-border bg-muted/50">
                  <TableRow>
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">SKU</TableHead>
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Nama</TableHead>
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Tipe</TableHead>
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Kategori</TableHead>
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold text-right">Harga Jual</TableHead>
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold text-right">Harga Beli</TableHead>
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold text-center">Unit</TableHead>
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold text-center">Stock</TableHead>
                    <TableHead className="whitespace-nowrap py-2 px-2 font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.data.map((product: any) => (
                    <TableRow key={product.id} className="hover:bg-accent/50 border-b border-border">
                      <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap font-mono font-medium">
                        {product.sku}
                      </TableCell>
                      <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          product.type === 'GOODS' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {product.type === 'GOODS' ? 'Barang' : 'Jasa'}
                        </span>
                      </TableCell>
                      <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap text-sm text-muted-foreground">
                        {product.category || '-'}
                      </TableCell>
                      <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap text-right font-medium">
                        {formatCurrency(product.salePrice.toString())}
                      </TableCell>
                      <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap text-right text-muted-foreground">
                        {formatCurrency(product.purchasePrice.toString())}
                      </TableCell>
                      <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap text-center text-sm">
                        {product.unit}
                      </TableCell>
                      <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap text-center">
                        {product.trackInventory ? (
                          <span className="text-sm font-medium text-blue-600">
                            Tracked
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="py-1 px-2 whitespace-nowrap text-right">
                        <Link href={`/master/products/${product.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, products.pagination.total)} of {products.pagination.total} products
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
                    disabled={page >= products.pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Belum ada product</p>
              <Link href="/master/products/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Product Pertama
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {products && products.data.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.pagination.total}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Barang (Goods)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {products.data.filter((p: any) => p.type === 'GOODS').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Jasa (Services)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {products.data.filter((p: any) => p.type === 'SERVICE').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>With Inventory Tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {products.data.filter((p: any) => p.trackInventory).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

