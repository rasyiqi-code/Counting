'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { Users, Search, Plus, Eye, Edit, Shield } from 'lucide-react';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';
import Link from 'next/link';

export default function UsersManagementPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: users, isLoading } = trpc.settings.listUsers.useQuery({
    page,
    limit: 20,
    search,
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Kelola users & roles</p>
        </div>
        <Link href="/settings/users/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9" 
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading users...</div>
          ) : users && users.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.data.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' : 
                        user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 
                        user.role === 'USER' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.isActive ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.role !== 'SUPER_ADMIN' && (
                          <Button variant="ghost" size="icon" className="text-blue-600">
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="mb-2">Belum ada users</p>
              <p className="text-sm">Klik "Add User" untuk menambah user baru</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
