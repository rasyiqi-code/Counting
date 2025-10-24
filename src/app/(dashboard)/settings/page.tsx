'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Building, Users, FileText } from 'lucide-react';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function SettingsPage() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          Pengaturan (Settings)
        </AnimatedGradientText>
        <p className="text-sm sm:text-base text-muted-foreground">
          Kelola informasi perusahaan, users, dan audit trail
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="hover:shadow-lg transition-shadow relative overflow-hidden">
          <BorderBeam size={200} duration={12} delay={0} />
          <CardHeader>
            <Building className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Company Info</CardTitle>
            <CardDescription>Informasi perusahaan</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/company">
              <Button className="w-full">Kelola Company Info</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow relative overflow-hidden">
          <BorderBeam size={200} duration={12} delay={3} />
          <CardHeader>
            <Users className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>User Management</CardTitle>
            <CardDescription>Kelola users & roles</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/users">
              <Button className="w-full">Kelola Users</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow relative overflow-hidden">
          <BorderBeam size={200} duration={12} delay={6} />
          <CardHeader>
            <FileText className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>Log aktivitas users</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/audit-trail">
              <Button className="w-full">Lihat Audit Trail</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

