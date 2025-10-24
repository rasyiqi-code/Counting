'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { trpc } from '@/lib/trpc/client';
import { Plus, Search, Eye, Edit, CreditCard, Building } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function BankAccountsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Get bank accounts from database
  const { data: bankAccounts, isLoading } = trpc.cashBank.listBankAccounts.useQuery({
    page,
    limit: 20,
    search,
  });

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'CHECKING':
        return 'bg-blue-100 text-blue-800';
      case 'SAVINGS':
        return 'bg-green-100 text-green-800';
      case 'CREDIT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'CHECKING':
        return 'Giro';
      case 'SAVINGS':
        return 'Tabungan';
      case 'CREDIT':
        return 'Kredit';
      default:
        return type;
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Bank Accounts
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Kelola rekening bank perusahaan</p>
        </div>
        <Link href="/master/bank-accounts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Bank Account
          </Button>
        </Link>
      </div>

      <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} />
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari bank account..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9" 
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading bank accounts...</div>
          ) : bankAccounts && bankAccounts.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bankAccounts.data.map((bankAccount: any) => (
                  <TableRow key={bankAccount.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{bankAccount.name}</p>
                          <p className="text-sm text-muted-foreground">{bankAccount.account?.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{bankAccount.bankName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{bankAccount.accountNumber}</TableCell>
                    <TableCell>
                      <Badge className={getAccountTypeColor(bankAccount.accountType)}>
                        {getAccountTypeLabel(bankAccount.accountType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(Number(bankAccount.balance?.toString() || 0))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={bankAccount.isActive ? "default" : "secondary"}>
                        {bankAccount.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/master/bank-accounts/${bankAccount.id}`}>
                          <Button variant="ghost" size="icon" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/master/bank-accounts/${bankAccount.id}/edit`}>
                          <Button variant="ghost" size="icon" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-2">Belum ada bank account</p>
              <p className="text-sm">Klik "Tambah Bank Account" untuk menambah rekening bank</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {bankAccounts && bankAccounts.data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bankAccounts.data.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {bankAccounts.data.filter((account: any) => account.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(
                  bankAccounts.data.reduce((sum: number, account: any) => 
                    sum + Number(account.balance?.toString() || 0), 0
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Checking Accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {bankAccounts.data.filter((account: any) => account.accountType === 'CHECKING').length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
