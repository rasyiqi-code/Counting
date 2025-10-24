'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { Plus, Search, Eye, Building2 } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function AssetsRegisterPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: assets, isLoading } = trpc.fixedAssets.list.useQuery({
    page,
    limit: 20,
  });

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Assets Register
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Daftar aset tetap perusahaan</p>
        </div>
        <Link href="/fixed-assets/register/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Asset
          </Button>
        </Link>
      </div>

      <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} />
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari asset..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9" 
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading assets...</div>
          ) : assets && assets.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Code</TableHead>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Book Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.data.map((asset: any) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-mono">{asset.assetCode}</TableCell>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>{asset.category}</TableCell>
                    <TableCell>{formatDate(asset.purchaseDate)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(asset.cost.toString())}</TableCell>
                    <TableCell className="text-right">{formatCurrency(asset.bookValue.toString())}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        asset.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                        asset.status === 'DISPOSED' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {asset.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="mb-2">Belum ada asset</p>
              <p className="text-sm">Klik "Tambah Asset" untuk menambah aset tetap</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
