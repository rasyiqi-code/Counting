'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewMonthlyClosingPage() {
  const router = useRouter();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [description, setDescription] = useState('');

  const createMutation = trpc.period.closing.createMonthly.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        year,
        month,
        description: description || undefined,
      });
      router.push('/period/monthly-closing');
    } catch (error) {
      console.error('Failed to create monthly closing:', error);
    }
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Buat Monthly Closing</h1>
        <p className="text-muted-foreground">Tutup buku untuk periode bulanan</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Monthly Closing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Tahun *</Label>
                <Input 
                  type="number"
                  id="year" 
                  value={year} 
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  min="2020"
                  max="2030"
                  required 
                />
              </div>
              <div>
                <Label htmlFor="month">Bulan *</Label>
                <select 
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  {monthNames.map((name, index) => (
                    <option key={index + 1} value={index + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Deskripsi monthly closing (opsional)"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Informasi:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Periode akan dikunci untuk mencegah perubahan transaksi</li>
                <li>• Semua journal entries dalam periode akan di-lock</li>
                <li>• Proses ini tidak dapat dibatalkan</li>
              </ul>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Memproses...' : 'Tutup Buku Bulanan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
