'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { ResponsiveTable } from '@/shared/ui/responsive-table';
import { trpc } from '@/lib/trpc/client';
import { Plus, Search, ChevronRight, ChevronDown, Edit, Sparkles, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

interface AccountNode {
  id: string;
  code: string;
  name: string;
  accountType: string;
  balance: string;
  isActive: boolean;
  children?: AccountNode[];
}

function AccountTableRow({ account, level = 0, isNew = false }: { account: AccountNode; level?: number; isNew?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = account.children && account.children.length > 0;

  return (
    <>
      <TableRow className="hover:bg-accent/50 border-b border-border">
        <TableCell className="font-mono text-sm font-medium min-w-[100px] whitespace-nowrap py-1 px-2 border-r border-border">
          <div className="flex items-center gap-1">
            <div 
              className="cursor-pointer flex-shrink-0"
              onClick={() => hasChildren && setIsExpanded(!isExpanded)}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )
              ) : (
                <div className="w-4" />
              )}
            </div>
            <span style={{ paddingLeft: `${level * 1.5}rem` }} className="whitespace-nowrap">
              {account.code}
            </span>
          </div>
        </TableCell>
        <TableCell className="min-w-[200px] whitespace-nowrap py-1 px-2 border-r border-border">
          <div className="flex items-center gap-2">
            <span style={{ paddingLeft: `${level * 1.5}rem` }} className="text-sm truncate">
              {account.name}
            </span>
            {isNew && (
              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse">
                <Sparkles className="h-3 w-3" />
                NEW
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="text-right min-w-[120px] whitespace-nowrap py-1 px-2 border-r border-border">
          <span className="text-sm font-medium">
            {formatCurrency(account.balance)}
          </span>
        </TableCell>
        <TableCell className="text-center min-w-[100px] whitespace-nowrap py-1 px-2 border-r border-border">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
            account.accountType === 'ASSET' ? 'bg-blue-100 text-blue-700' :
            account.accountType === 'LIABILITY' ? 'bg-red-100 text-red-700' :
            account.accountType === 'EQUITY' ? 'bg-purple-100 text-purple-700' :
            account.accountType === 'REVENUE' ? 'bg-green-100 text-green-700' :
            account.accountType === 'COGS' ? 'bg-orange-100 text-orange-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {account.accountType}
          </span>
        </TableCell>
        <TableCell className="text-center min-w-[80px] whitespace-nowrap py-1 px-2">
          <Link href={`/master/coa/${account.id}/edit`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
        </TableCell>
      </TableRow>

      {hasChildren && isExpanded && (
        <>
          {account.children!.map((child) => (
            <AccountTableRow key={child.id} account={child} level={level + 1} isNew={false} />
          ))}
        </>
      )}
    </>
  );
}

export default function ChartOfAccountsPage() {
  const [search, setSearch] = useState('');
  const [newAccounts, setNewAccounts] = useState<Set<string>>(new Set());
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupSuccess, setCleanupSuccess] = useState(false);
  const { data: tree, isLoading, refetch } = trpc.masterData.coa.getTree.useQuery({ showInactive: false });

  // Listen for new account creation
  useEffect(() => {
    const handleNewAccount = (event: CustomEvent) => {
      const accountData = event.detail;
      if (accountData && accountData.id) {
        setNewAccounts(prev => new Set([...prev, accountData.id]));
        
        // Remove "NEW" indicator after 10 seconds
        setTimeout(() => {
          setNewAccounts(prev => {
            const newSet = new Set(prev);
            newSet.delete(accountData.id);
            return newSet;
          });
        }, 10000);
      }
    };

    window.addEventListener('coa-account-created', handleNewAccount as EventListener);
    
    return () => {
      window.removeEventListener('coa-account-created', handleNewAccount as EventListener);
    };
  }, []);

  // Listen for AI suggestion apply event
  useEffect(() => {
    const handleApplySuggestion = (event: CustomEvent) => {
      const suggestion = event.detail;
      // Redirect to create account page with pre-filled data
      const params = new URLSearchParams({
        code: suggestion.code,
        name: suggestion.name,
        accountType: suggestion.accountType,
        category: suggestion.category,
        description: suggestion.description,
        parentCode: suggestion.parentCode || '',
      });
      window.location.href = `/master/coa/new?${params.toString()}`;
    };

    window.addEventListener('coa-ai-apply-suggestion', handleApplySuggestion as EventListener);
    
    return () => {
      window.removeEventListener('coa-ai-apply-suggestion', handleApplySuggestion as EventListener);
    };
  }, []);

  // Deteksi duplikat
  const detectDuplicates = async () => {
    try {
      const response = await fetch('/api/coa/cleanup-duplicates');
      const data = await response.json();
      
      if (data.success) {
        setDuplicates(data.duplicates);
        setShowDuplicates(true);
      }
    } catch (error) {
      console.error('Error detecting duplicates:', error);
    }
  };

  // Cleanup duplikat
  const cleanupDuplicates = async () => {
    try {
      setIsCleaning(true);
      
      // Pilih akun yang akan disimpan (yang pertama dari setiap grup duplikat)
      const keepIds = duplicates.map(group => group.accounts[0].id);
      
      const response = await fetch('/api/coa/cleanup-duplicates', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keepIds }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCleanupSuccess(true);
        setShowDuplicates(false);
        setDuplicates([]);
        refetch(); // Refresh data
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setCleanupSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error cleaning duplicates:', error);
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Chart of Accounts
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Kelola bagan akun perusahaan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={detectDuplicates}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Cek Duplikat
          </Button>
          <Link href="/master/coa/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Akun
            </Button>
          </Link>
        </div>
      </div>


      <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} />
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari akun..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading chart of accounts...
            </div>
          ) : tree && tree.length > 0 ? (
            <ResponsiveTable>
              <Table className="border border-border rounded-lg">
                <TableHeader>
                  <TableRow className="border-b-2 border-border bg-muted/50">
                    <TableHead className="min-w-[100px] whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Kode</TableHead>
                    <TableHead className="min-w-[200px] whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Nama Akun</TableHead>
                    <TableHead className="text-right min-w-[120px] whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Saldo</TableHead>
                    <TableHead className="text-center min-w-[100px] whitespace-nowrap py-2 px-2 border-r border-border font-semibold">Tipe</TableHead>
                    <TableHead className="text-center min-w-[80px] whitespace-nowrap py-2 px-2 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tree.map((account: AccountNode) => (
                    <AccountTableRow 
                      key={account.id} 
                      account={account} 
                      isNew={newAccounts.has(account.id)} 
                    />
                  ))}
                </TableBody>
              </Table>
            </ResponsiveTable>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Belum ada chart of accounts</p>
              <Link href="/master/coa/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Akun Pertama
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Message */}
      {cleanupSuccess && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="text-green-800 font-semibold">Cleanup Berhasil!</h3>
              <p className="text-green-700 text-sm">Data duplikat telah berhasil dihapus</p>
            </div>
          </div>
        </div>
      )}

      {/* Duplicates Display */}
      {showDuplicates && duplicates.length > 0 && (
        <Card className="mt-6 border-red-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-800">Data Duplikat Ditemukan</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowDuplicates(false)}>
                  Tutup
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={cleanupDuplicates}
                  disabled={isCleaning}
                >
                  {isCleaning ? (
                    <>
                      <Trash2 className="h-4 w-4 mr-2 animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus Duplikat
                    </>
                  )}
                </Button>
              </div>
            </div>
            <CardDescription className="text-red-700">
              Ditemukan {duplicates.length} grup duplikat dengan total {duplicates.reduce((sum, group) => sum + group.count, 0)} akun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {duplicates.map((group, index) => (
                <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-red-800">
                      Grup {index + 1}: {group.accounts[0].code} - {group.accounts[0].name}
                    </h4>
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                      {group.count} duplikat
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.accounts.map((account: any, accountIndex: number) => (
                      <div key={account.id} className={`flex items-center justify-between p-2 rounded ${
                        accountIndex === 0 ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm">{account.code}</span>
                          <span className="text-sm">{account.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            account.accountType === 'ASSET' ? 'bg-blue-100 text-blue-700' :
                            account.accountType === 'LIABILITY' ? 'bg-red-100 text-red-700' :
                            account.accountType === 'EQUITY' ? 'bg-purple-100 text-purple-700' :
                            account.accountType === 'REVENUE' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {account.accountType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {accountIndex === 0 && (
                            <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                              AKAN DISIMPAN
                            </span>
                          )}
                          {accountIndex > 0 && (
                            <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                              AKAN DIHAPUS
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Duplicates Message */}
      {showDuplicates && duplicates.length === 0 && (
        <Card className="mt-6 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="text-green-800 font-semibold">Tidak Ada Duplikat</h3>
                <p className="text-green-700 text-sm">Semua akun unik, tidak ada data duplikat ditemukan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tree?.length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Asset</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {tree?.filter((a: AccountNode) => a.accountType === 'ASSET').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Liability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {tree?.filter((a: AccountNode) => a.accountType === 'LIABILITY').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Equity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {tree?.filter((a: AccountNode) => a.accountType === 'EQUITY').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tree?.filter((a: AccountNode) => a.accountType === 'REVENUE').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Expense</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {tree?.filter((a: AccountNode) => a.accountType === 'EXPENSE' || a.accountType === 'COGS').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

