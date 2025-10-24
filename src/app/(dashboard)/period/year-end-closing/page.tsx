'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { Lock, Search, Eye, Calendar } from 'lucide-react';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function YearEndClosingPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: periods, isLoading } = trpc.period.closing.list.useQuery({
    page,
    limit: 20,
    search,
    type: 'YEAR_END',
  });

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Year-End Closing
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Tutup buku tahunan</p>
        </div>
        <Link href="/period/year-end-closing/new">
          <Button>
            <Lock className="h-4 w-4 mr-2" />
            Buat Year-End Closing
          </Button>
        </Link>
      </div>

      <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} />
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari periode..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9" 
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading periods...</div>
          ) : periods && periods.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tahun</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Closed At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.data.map((period: any) => (
                  <TableRow key={period.id}>
                    <TableCell className="font-medium">{period.year}</TableCell>
                    <TableCell>{formatDate(period.startDate)}</TableCell>
                    <TableCell>{formatDate(period.endDate)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        period.status === 'CLOSED' ? 'bg-red-100 text-red-800' : 
                        period.status === 'OPEN' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {period.status}
                      </span>
                    </TableCell>
                    <TableCell>{period.closedAt ? formatDate(period.closedAt) : '-'}</TableCell>
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
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="mb-2">Belum ada year-end closing</p>
              <p className="text-sm">Klik "Buat Year-End Closing" untuk tutup buku tahunan</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
