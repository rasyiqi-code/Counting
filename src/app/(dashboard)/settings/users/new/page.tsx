'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { Users, Save } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER' as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
  });

  const createMutation = trpc.settings.createUser.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Password dan konfirmasi password tidak sama');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      router.push('/settings/users');
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New User</h1>
        <p className="text-muted-foreground">Buat user baru untuk sistem</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-green-600" />
              <CardTitle>User Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">Role *</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="USER">User - Basic access</option>
                <option value="ADMIN">Admin - Full access</option>
                <option value="SUPER_ADMIN">Super Admin - System access</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Role Permissions:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>User:</strong> Basic access to modules</li>
                <li>• <strong>Admin:</strong> Full access to all modules</li>
                <li>• <strong>Super Admin:</strong> System administration access</li>
              </ul>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
