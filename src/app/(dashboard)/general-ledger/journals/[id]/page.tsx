'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, Edit, FileCheck, RotateCcw, X } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function JournalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const journalId = params.id as string;

  const { data: journal, isLoading, error } = trpc.journal.getById.useQuery({
    id: journalId,
  });

  const postJournal = trpc.journal.post.useMutation({
    onSuccess: () => {
      toast.success('Journal posted successfully');
      // Refresh the page data
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`Failed to post journal: ${error.message}`);
    },
  });

  const voidJournal = trpc.journal.void.useMutation({
    onSuccess: () => {
      toast.success('Journal voided successfully');
      // Refresh the page data
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`Failed to void journal: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12 text-muted-foreground">
          Loading journal details...
        </div>
      </div>
    );
  }

  if (error || !journal) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Journal Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The journal you're looking for doesn't exist.
          </p>
          <Link href="/general-ledger/journals">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Journals
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalDebit = journal.entries.reduce((sum, entry) => {
    return sum + Number(entry.debit.toString());
  }, 0);

  const totalCredit = journal.entries.reduce((sum, entry) => {
    return sum + Number(entry.credit.toString());
  }, 0);

  const isBalanced = totalDebit === totalCredit;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/general-ledger/journals">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
              Journal Details
            </AnimatedGradientText>
            <p className="text-sm sm:text-base text-muted-foreground">
              {journal.journalNo}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {journal.status === 'DRAFT' && (
            <>
              <Link href={`/general-ledger/journals/${journalId}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button
                onClick={() => postJournal.mutate({ journalId })}
                disabled={postJournal.isPending || !isBalanced}
                title={!isBalanced ? "Journal is not balanced" : "Post journal"}
              >
                <FileCheck className="h-4 w-4 mr-2" />
                {postJournal.isPending ? 'Posting...' : 'Post'}
              </Button>
            </>
          )}
          {journal.status === 'POSTED' && (
            <Button
              variant="destructive"
              onClick={() => voidJournal.mutate({ journalId })}
              disabled={voidJournal.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              {voidJournal.isPending ? 'Voiding...' : 'Void'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Journal Information */}
          <Card className="relative overflow-hidden">
            <BorderBeam size={300} duration={15} />
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Journal Information</span>
                <Badge 
                  variant={
                    journal.status === 'POSTED' ? 'default' :
                    journal.status === 'VOID' ? 'destructive' :
                    'secondary'
                  }
                >
                  {journal.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Journal Number</label>
                  <p className="font-mono text-lg">{journal.journalNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="text-lg">{formatDate(journal.date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reference Number</label>
                  <p className="text-lg">{journal.referenceNo || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Source Type</label>
                  <p className="text-lg">{journal.sourceType || '-'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-lg">{journal.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Journal Entries */}
          <Card className="relative overflow-hidden">
            <BorderBeam size={300} duration={15} />
            <CardHeader>
              <CardTitle>Journal Entries</CardTitle>
              <CardDescription>
                {journal.entries.length} entries • Total Debit: {formatCurrency(totalDebit)} • Total Credit: {formatCurrency(totalCredit)}
                {!isBalanced && (
                  <span className="text-red-600 ml-2">⚠️ Not Balanced</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {journal.entries.map((entry: any, index: number) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground w-8">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{entry.account.name}</p>
                          <p className="text-sm text-muted-foreground">{entry.account.code}</p>
                        </div>
                      </div>
                      {entry.description && (
                        <p className="text-sm text-muted-foreground mt-1 ml-11">
                          {entry.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-4 text-right">
                      <div className="w-24">
                        <p className="text-sm text-muted-foreground">Debit</p>
                        <p className="font-mono font-medium">
                          {Number(entry.debit.toString()) > 0 ? formatCurrency(Number(entry.debit.toString())) : '-'}
                        </p>
                      </div>
                      <div className="w-24">
                        <p className="text-sm text-muted-foreground">Credit</p>
                        <p className="font-mono font-medium">
                          {Number(entry.credit.toString()) > 0 ? formatCurrency(Number(entry.credit.toString())) : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Totals */}
          <Card className="relative overflow-hidden">
            <BorderBeam size={300} duration={15} />
            <CardHeader>
              <CardTitle>Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Debit:</span>
                <span className="font-mono font-medium">{formatCurrency(totalDebit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Credit:</span>
                <span className="font-mono font-medium">{formatCurrency(totalCredit)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difference:</span>
                  <span className={`font-mono font-medium ${totalDebit === totalCredit ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalDebit - totalCredit)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="relative overflow-hidden">
            <BorderBeam size={300} duration={15} />
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {journal.status === 'DRAFT' && (
                <>
                  <Link href={`/general-ledger/journals/${journalId}/edit`} className="w-full">
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Journal
                    </Button>
                  </Link>
                  <Button
                    className="w-full justify-start"
                    onClick={() => postJournal.mutate({ journalId })}
                    disabled={postJournal.isPending || !isBalanced}
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    {postJournal.isPending ? 'Posting...' : 'Post Journal'}
                  </Button>
                </>
              )}
              {journal.status === 'POSTED' && (
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => voidJournal.mutate({ journalId })}
                  disabled={voidJournal.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  {voidJournal.isPending ? 'Voiding...' : 'Void Journal'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Journal Info */}
          <Card className="relative overflow-hidden">
            <BorderBeam size={300} duration={15} />
            <CardHeader>
              <CardTitle>Journal Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created By</label>
                <p className="text-sm">{journal.createdBy?.name || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="text-sm">{formatDate(journal.createdAt)}</p>
              </div>
              {journal.updatedBy && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Updated By</label>
                  <p className="text-sm">{journal.updatedBy.name}</p>
                </div>
              )}
              {journal.updatedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                  <p className="text-sm">{formatDate(journal.updatedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
