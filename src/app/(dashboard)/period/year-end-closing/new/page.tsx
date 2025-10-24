'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewYearEndClosingPage() {
  const router = useRouter();
  const [year, setYear] = useState(new Date().getFullYear());
  const [description, setDescription] = useState('');

  const createMutation = trpc.period.closing.createYearEnd.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        year,
        description: description || undefined,
      });
      router.push('/period/year-end-closing');
    } catch (error) {
      console.error('Failed to create year-end closing:', error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Buat Year-End Closing</h1>
        <p className="text-muted-foreground">Tutup buku untuk periode tahunan</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Year-End Closing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Label htmlFor="description">Deskripsi</Label>
              <textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Deskripsi year-end closing (opsional)"
              />
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">PENTING - Year-End Closing:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Semua revenue & expense accounts akan di-zero out</li>
                <li>• Net income akan di-transfer ke retained earnings</li>
                <li>• Semua monthly periods dalam tahun akan di-lock</li>
                <li>• Proses ini tidak dapat dibatalkan</li>
                <li>• Pastikan semua transaksi tahun {year} sudah benar</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Peringatan:</h4>
              <p className="text-sm text-yellow-700">
                Year-end closing adalah proses kritis yang akan mempengaruhi semua laporan keuangan. 
                Pastikan semua data sudah akurat sebelum melanjutkan.
              </p>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-red-600 hover:bg-red-700">
                {createMutation.isPending ? 'Memproses...' : 'Tutup Buku Tahunan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
