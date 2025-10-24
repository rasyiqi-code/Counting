'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { Plus, Search, Eye, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function DisposalPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // TODO: Implement disposal list procedure
  const disposals = { data: [], pagination: { total: 0 } };
  const isLoading = false;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Asset Disposal
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Pelepasan aset tetap</p>
        </div>
        <Link href="/fixed-assets/disposal/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Disposal
          </Button>
        </Link>
      </div>

      <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} />
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari disposal..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9" 
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading disposals...</div>
          ) : disposals && disposals.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Disposal Date</TableHead>
                  <TableHead>Disposal Type</TableHead>
                  <TableHead className="text-right">Proceeds</TableHead>
                  <TableHead className="text-right">Book Value</TableHead>
                  <TableHead className="text-right">Gain/Loss</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disposals.data.map((disposal: any) => (
                  <TableRow key={disposal.id}>
                    <TableCell className="font-medium">{disposal.asset?.name}</TableCell>
                    <TableCell>{formatDate(disposal.disposalDate)}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                        {disposal.disposalType}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(disposal.proceeds.toString())}</TableCell>
                    <TableCell className="text-right">{formatCurrency(disposal.bookValue.toString())}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-medium ${
                        disposal.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {disposal.gainLoss >= 0 ? '+' : ''}{formatCurrency(disposal.gainLoss.toString())}
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
              <Trash2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="mb-2">Belum ada disposal</p>
              <p className="text-sm">Klik "Buat Disposal" untuk pelepasan aset</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
