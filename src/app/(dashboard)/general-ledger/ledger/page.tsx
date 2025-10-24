'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function LedgerPage() {
  const [accountId, setAccountId] = useState('');
  
  const { data: accounts } = trpc.masterData.coa.list.useQuery({ limit: 100 });
  const { data: ledger, isLoading } = trpc.journal.getLedger.useQuery(
    { accountId },
    { enabled: !!accountId }
  );

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          Account Ledger
        </AnimatedGradientText>
        <p className="text-muted-foreground">Pergerakan per akun dengan running balance</p>
      </div>

      <Card className="mb-6 relative overflow-hidden">
        <BorderBeam size={250} duration={12} delay={0} />
        <CardHeader>
          <CardTitle>Pilih Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Account</Label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-md mt-1"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              <option value="">Pilih account...</option>
              {accounts?.data.map((acc: any) => (
                <option key={acc.id} value={acc.id}>
                  {acc.code} - {acc.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {accountId && (
        <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} delay={3} />
          <CardHeader>
            {ledger?.account && (
              <div>
                <CardTitle>{ledger.account.code} - {ledger.account.name}</CardTitle>
                <CardDescription>Account Type: {ledger.account.accountType}</CardDescription>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">Loading ledger...</div>
            ) : ledger && ledger.entries.length > 0 ? (
              <>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium">Opening Balance:</span>
                    <span className="font-bold">{formatCurrency(ledger.openingBalance.toString())}</span>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Journal No</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Kredit</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledger.entries.map((entry: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{formatDate(entry.date)}</TableCell>
                        <TableCell className="font-mono">{entry.journalNo}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell className="text-right">{Number(entry.debit) > 0 ? formatCurrency(entry.debit.toString()) : '-'}</TableCell>
                        <TableCell className="text-right">{Number(entry.credit) > 0 ? formatCurrency(entry.credit.toString()) : '-'}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(entry.balance.toString())}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium">Closing Balance:</span>
                    <span className="font-bold text-lg">{formatCurrency(ledger.closingBalance.toString())}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No entries for this account</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

