'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { Plus, Trash2, Save } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/shared/utils/currency';
import { Decimal } from 'decimal.js';

interface JournalEntry {
  accountId: string;
  accountCode?: string;
  accountName?: string;
  debit: string;
  credit: string;
  description: string;
}

export default function NewJournalPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([
    { accountId: '', debit: '0', credit: '0', description: '' },
    { accountId: '', debit: '0', credit: '0', description: '' },
  ]);

  const { data: accounts } = trpc.masterData.coa.list.useQuery({ limit: 100 });
  const createJournal = trpc.journal.create.useMutation({
    onSuccess: () => {
      router.push('/general-ledger/journals');
    },
  });

  const addEntry = () => {
    setEntries([...entries, { accountId: '', debit: '0', credit: '0', description: '' }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const updateEntry = (index: number, field: keyof JournalEntry, value: string) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    
    // If account changed, update account info
    if (field === 'accountId' && value) {
      const account = accounts?.data.find((a: any) => a.id === value);
      if (account) {
        newEntries[index].accountCode = account.code;
        newEntries[index].accountName = account.name;
      }
    }
    
    setEntries(newEntries);
  };

  const calculateTotals = () => {
    let totalDebit = 0;
    let totalCredit = 0;

    for (const entry of entries) {
      totalDebit = totalDebit + Number(entry.debit || 0);
      totalCredit = totalCredit + Number(entry.credit || 0);
    }

    return { totalDebit, totalCredit, difference: totalDebit - totalCredit };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totals = calculateTotals();
    if (totals.difference !== 0) {
      alert('Journal tidak balanced! Debit harus sama dengan Kredit.');
      return;
    }

    if (!description) {
      alert('Description harus diisi!');
      return;
    }

    const validEntries = entries.filter(e => e.accountId && (parseFloat(e.debit) > 0 || parseFloat(e.credit) > 0));
    
    if (validEntries.length < 2) {
      alert('Minimal 2 entries diperlukan!');
      return;
    }

    try {
      await createJournal.mutateAsync({
        date: new Date(date),
        description,
        referenceNo: referenceNo || undefined,
        entries: validEntries.map(e => ({
          accountId: e.accountId,
          debit: parseFloat(e.debit),
          credit: parseFloat(e.credit),
          description: e.description || undefined,
        })),
      });
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const totals = calculateTotals();
  const isBalanced = totals.difference === 0;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Buat Jurnal Umum</h1>
        <p className="text-muted-foreground">Double entry journal entry</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informasi Jurnal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Tanggal *</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>No. Referensi</Label>
                <Input
                  placeholder="Optional"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <Label>Status</Label>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">
                    DRAFT
                  </span>
                </div>
              </div>
              <div className="col-span-3">
                <Label>Deskripsi *</Label>
                <Input
                  placeholder="Contoh: Modal awal perusahaan"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Journal Entries</CardTitle>
                <CardDescription>Minimal 2 entries, debit harus sama dengan kredit</CardDescription>
              </div>
              <Button type="button" onClick={addEntry} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Entry
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 pb-2 border-b font-medium text-sm text-muted-foreground">
                <div className="col-span-3">Account</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2 text-right">Debit</div>
                <div className="col-span-2 text-right">Kredit</div>
                <div className="col-span-2"></div>
              </div>

              {/* Entries */}
              {entries.map((entry, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-3">
                    <select
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md"
                      value={entry.accountId}
                      onChange={(e) => updateEntry(index, 'accountId', e.target.value)}
                      required
                    >
                      <option value="">Pilih Account...</option>
                      {accounts?.data.map((acc: any) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.code} - {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <Input
                      placeholder="Keterangan..."
                      value={entry.description}
                      onChange={(e) => updateEntry(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      value={entry.debit}
                      onChange={(e) => {
                        updateEntry(index, 'debit', e.target.value);
                        if (parseFloat(e.target.value) > 0) {
                          updateEntry(index, 'credit', '0');
                        }
                      }}
                      className="text-right"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      value={entry.credit}
                      onChange={(e) => {
                        updateEntry(index, 'credit', e.target.value);
                        if (parseFloat(e.target.value) > 0) {
                          updateEntry(index, 'debit', '0');
                        }
                      }}
                      className="text-right"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    {entries.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEntry(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-12 gap-3 font-medium">
                <div className="col-span-6 text-right">TOTAL:</div>
                <div className="col-span-2 text-right">
                  {formatCurrency(totals.totalDebit.toString())}
                </div>
                <div className="col-span-2 text-right">
                  {formatCurrency(totals.totalCredit.toString())}
                </div>
                <div className="col-span-2"></div>
              </div>
              
              <div className="grid grid-cols-12 gap-3 mt-2">
                <div className="col-span-6 text-right text-sm text-muted-foreground">
                  Difference:
                </div>
                <div className="col-span-4 text-right">
                  <span className={`font-semibold ${
                    isBalanced ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(totals.difference).toString())}
                  </span>
                </div>
                <div className="col-span-2"></div>
              </div>

              <div className="flex items-center justify-center mt-4 pt-4 border-t">
                {isBalanced ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-semibold">Balanced ✓</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="font-semibold">Not Balanced - Debit must equal Kredit</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/general-ledger/journals')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isBalanced || createJournal.isPending}
          >
            {createJournal.isPending ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Journal
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

