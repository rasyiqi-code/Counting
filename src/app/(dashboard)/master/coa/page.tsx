'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { trpc } from '@/lib/trpc/client';
import { Plus, Search, ChevronRight, ChevronDown, Edit } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { useState } from 'react';
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

function AccountTreeNode({ account, level = 0 }: { account: AccountNode; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = account.children && account.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-accent rounded-md group"
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
      >
        <div 
          className="flex items-center gap-2 flex-1 cursor-pointer"
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
          
          <span className="font-mono text-sm font-medium min-w-[100px]">
            {account.code}
          </span>
          
          <span className="flex-1 text-sm">
            {account.name}
          </span>
          
          <span className="text-sm text-muted-foreground min-w-[120px] text-right">
            {formatCurrency(account.balance)}
          </span>

          <span className={`text-xs px-2 py-0.5 rounded ${
            account.accountType === 'ASSET' ? 'bg-blue-100 text-blue-700' :
            account.accountType === 'LIABILITY' ? 'bg-red-100 text-red-700' :
            account.accountType === 'EQUITY' ? 'bg-purple-100 text-purple-700' :
            account.accountType === 'REVENUE' ? 'bg-green-100 text-green-700' :
            account.accountType === 'COGS' ? 'bg-orange-100 text-orange-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {account.accountType}
          </span>
        </div>

        <Link href={`/master/coa/${account.id}/edit`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {account.children!.map((child) => (
            <AccountTreeNode key={child.id} account={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChartOfAccountsPage() {
  const [search, setSearch] = useState('');
  const { data: tree, isLoading } = trpc.masterData.coa.getTree.useQuery({ showInactive: false });

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Chart of Accounts
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">Kelola bagan akun perusahaan</p>
        </div>
        <Link href="/master/coa/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Akun
          </Button>
        </Link>
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
            <div className="space-y-1">
              <div className="flex items-center gap-2 py-2 px-3 bg-muted/50 rounded-md mb-2 font-medium text-sm">
                <div className="w-4" />
                <span className="min-w-[100px]">Kode</span>
                <span className="flex-1">Nama Akun</span>
                <span className="min-w-[120px] text-right">Saldo</span>
                <span className="w-24 text-center">Tipe</span>
                <span className="w-12 text-center">Actions</span>
              </div>
              
              {tree.map((account: AccountNode) => (
                <AccountTreeNode key={account.id} account={account} />
              ))}
            </div>
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

