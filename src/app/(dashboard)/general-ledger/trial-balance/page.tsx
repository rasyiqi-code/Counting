'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { Download, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function TrialBalancePage() {
  const [startDate, setStartDate] = useState(new Date(2024, 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(2024, 11, 31).toISOString().split('T')[0]);

  const { data: trialBalance, isLoading, refetch } = trpc.journal.getTrialBalance.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          Trial Balance
        </AnimatedGradientText>
        <p className="text-muted-foreground">Neraca Saldo</p>
      </div>

      {/* Period Selection */}
      <Card className="mb-6 relative overflow-hidden">
        <BorderBeam size={250} duration={12} delay={0} />
        <CardHeader>
          <CardTitle className="text-lg">Periode Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label>Dari Tanggal</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label>Sampai Tanggal</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={() => refetch()}>
              Generate Report
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Generating trial balance...
            </div>
          ) : trialBalance ? (
            <div>
              {/* Header */}
              <div className="text-center border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold">PT. Contoh Perusahaan</h2>
                <h3 className="text-lg font-semibold mt-2">NERACA SALDO</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Periode: {formatDate(startDate, 'dd MMMM yyyy')} s/d {formatDate(endDate, 'dd MMMM yyyy')}
                </p>
              </div>

              {/* Balance Status */}
              <div className={`flex items-center justify-center gap-3 py-3 px-4 rounded-lg mb-6 ${
                trialBalance.isBalanced 
                  ? 'bg-green-50 border-2 border-green-300' 
                  : 'bg-red-50 border-2 border-red-300'
              }`}>
                {trialBalance.isBalanced ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">
                      Trial Balance is BALANCED ✓
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-900">
                      Trial Balance is NOT BALANCED!
                    </span>
                  </>
                )}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Kode</TableHead>
                    <TableHead>Nama Akun</TableHead>
                    <TableHead className="w-[100px]">Tipe</TableHead>
                    <TableHead className="text-right w-[150px]">Debit</TableHead>
                    <TableHead className="text-right w-[150px]">Kredit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialBalance.accounts.map((account: any) => (
                    <TableRow key={account.accountId}>
                      <TableCell className="font-mono font-medium">
                        {account.accountCode}
                      </TableCell>
                      <TableCell>{account.accountName}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded ${
                          account.accountType === 'ASSET' ? 'bg-blue-100 text-blue-700' :
                          account.accountType === 'LIABILITY' ? 'bg-red-100 text-red-700' :
                          account.accountType === 'EQUITY' ? 'bg-purple-100 text-purple-700' :
                          account.accountType === 'REVENUE' ? 'bg-green-100 text-green-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {account.accountType}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(account.debit) > 0 ? formatCurrency(account.debit.toString()) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(account.credit) > 0 ? formatCurrency(account.credit.toString()) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Totals */}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={3} className="text-right">
                      TOTAL:
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(trialBalance.totalDebit.toString())}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(trialBalance.totalCredit.toString())}
                    </TableCell>
                  </TableRow>

                  {/* Difference */}
                  {!trialBalance.isBalanced && (
                    <TableRow className="bg-red-50">
                      <TableCell colSpan={3} className="text-right font-semibold text-red-800">
                        DIFFERENCE:
                      </TableCell>
                      <TableCell colSpan={2} className="text-right font-semibold text-red-800">
                        {formatCurrency(
                          Math.abs(Number(trialBalance.totalDebit) - Number(trialBalance.totalCredit)).toString()
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Summary */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Accounts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {trialBalance.accounts.length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Debit</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(trialBalance.totalDebit.toString())}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Kredit</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(trialBalance.totalCredit.toString())}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Pilih periode dan klik Generate Report
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

