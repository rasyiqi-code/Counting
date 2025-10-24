'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { FileText, Search, Download, Filter } from 'lucide-react';
import { formatDate } from '@/shared/utils/date';
import { useState } from 'react';

export default function AuditTrailPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const { data: auditLogs, isLoading } = trpc.settings.getAuditTrail.useQuery({
    page,
    limit: 20,
    search,
    action: actionFilter || undefined,
  });

  const exportMutation = trpc.settings.exportAuditTrail.useMutation();

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        endDate: new Date(),
      });
    } catch (error) {
      console.error('Failed to export audit trail:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground">Log aktivitas users</p>
        </div>
        <Button onClick={handleExport} disabled={exportMutation.isPending}>
          <Download className="h-4 w-4 mr-2" />
          {exportMutation.isPending ? 'Exporting...' : 'Export'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari aktivitas..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9" 
              />
            </div>
            <div className="relative max-w-sm">
              <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-9 py-2 text-sm"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading audit trail...</div>
          ) : auditLogs && auditLogs.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.data.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell>{log.user?.name || 'System'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.action === 'CREATE' ? 'bg-green-100 text-green-800' : 
                        log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' : 
                        log.action === 'DELETE' ? 'bg-red-100 text-red-800' : 
                        log.action === 'LOGIN' ? 'bg-purple-100 text-purple-800' : 
                        log.action === 'LOGOUT' ? 'bg-gray-100 text-gray-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>{log.entityType}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.details}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.ipAddress}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="mb-2">Belum ada audit trail</p>
              <p className="text-sm">Aktivitas users akan tercatat di sini</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
