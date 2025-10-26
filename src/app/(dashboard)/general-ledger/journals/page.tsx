'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { Plus, Search, Eye, FileCheck } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function JournalsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data: journals, isLoading } = trpc.journal.list.useQuery({
    page,
    limit: 20,
    search,
    status: status || undefined,
  });

  const postJournal = trpc.journal.post.useMutation({
    onSuccess: () => {
      // Refresh list
    },
  });

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Journals
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Daftar semua jurnal transaksi</p>
        </div>
        <Link href="/general-ledger/journals/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Jurnal Baru
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
                placeholder="Cari journal..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select 
              className="px-3 py-2 text-sm border border-gray-200 rounded-md"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="DRAFT">Draft</option>
              <option value="POSTED">Posted</option>
              <option value="VOID">Void</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading journals...
            </div>
          ) : journals && journals.data.length > 0 ? (
            <>
              <Table className="border border-border rounded-lg">
                <TableHeader>
                  <TableRow className="border-b-2 border-border bg-muted/50">
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">No. Journal</TableHead>
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Tanggal</TableHead>
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Deskripsi</TableHead>
                    <TableHead className="whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Ref. No</TableHead>
                    <TableHead className="text-right whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Debit</TableHead>
                    <TableHead className="text-right whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Kredit</TableHead>
                    <TableHead className="text-center whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Status</TableHead>
                    <TableHead className="text-center whitespace-nowrap py-2 px-2 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {journals.data.map((journal: any) => (
                    <TableRow key={journal.id} className="hover:bg-accent/50 border-b border-border">
                      <TableCell className="font-mono font-medium py-1 px-2 border-r border-border whitespace-nowrap">
                        {journal.journalNo}
                      </TableCell>
                      <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap">
                        {formatDate(journal.date)}
                      </TableCell>
                      <TableCell className="py-1 px-2 border-r border-border whitespace-nowrap">
                        <div>
                          <div className="font-medium truncate">{journal.description}</div>
                          {journal.sourceType && (
                            <div className="text-xs text-muted-foreground">
                              Source: {journal.sourceType}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground py-1 px-2 border-r border-border whitespace-nowrap">
                        {journal.referenceNo || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium py-1 px-2 border-r border-border whitespace-nowrap">
                        {formatCurrency(journal.totalDebit.toString())}
                      </TableCell>
                      <TableCell className="text-right font-medium py-1 px-2 border-r border-border whitespace-nowrap">
                        {formatCurrency(journal.totalCredit.toString())}
                      </TableCell>
                      <TableCell className="text-center py-1 px-2 border-r border-border whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                          journal.status === 'POSTED' ? 'bg-green-100 text-green-800' :
                          journal.status === 'VOID' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {journal.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-1 px-2 whitespace-nowrap">
                        <div className="flex justify-center gap-1">
                          <Link href={`/general-ledger/journals/${journal.id}`}>
                            <Button variant="ghost" size="icon" title="View Details" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {journal.status === 'DRAFT' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Post Journal"
                              className="h-8 w-8"
                              onClick={() => postJournal.mutate({ journalId: journal.id })}
                            >
                              <FileCheck className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, journals.pagination.total)} of {journals.pagination.total} journals
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
                    disabled={page >= journals.pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Belum ada journal</p>
              <Link href="/general-ledger/journals/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Journal Pertama
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {journals && journals.data.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Journals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {journals.pagination.total}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Posted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {journals.data.filter((j: any) => j.status === 'POSTED').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Draft</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {journals.data.filter((j: any) => j.status === 'DRAFT').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>This Month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {journals.data.filter((j: any) => {
                  const jDate = new Date(j.date);
                  const now = new Date();
                  return jDate.getMonth() === now.getMonth() && jDate.getFullYear() === now.getFullYear();
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

