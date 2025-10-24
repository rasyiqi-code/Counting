'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { Building, Save, Edit } from 'lucide-react';
import { useState } from 'react';

export default function CompanySettingsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    npwp: '',
    baseCurrency: 'IDR',
  });

  const { data: company, isLoading } = trpc.settings.getCompany.useQuery();
  const updateMutation = trpc.settings.updateCompany.useMutation();

  // Populate form when company data loads
  useState(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        legalName: company.legalName || '',
        address: company.address || '',
        city: company.city || '',
        province: company.province || '',
        postalCode: company.postalCode || '',
        country: company.country || '',
        phone: company.phone || '',
        email: company.email || '',
        npwp: company.npwp || '',
        baseCurrency: company.baseCurrency || 'IDR',
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update company:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-muted-foreground">Loading company information...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Company Information</h1>
          <p className="text-muted-foreground">Kelola informasi perusahaan</p>
        </div>
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6 text-blue-600" />
              <CardTitle>Company Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div>
                <Label htmlFor="legalName">Legal Name *</Label>
                <Input
                  id="legalName"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div>
                <Label htmlFor="province">Province *</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div>
                <Label htmlFor="baseCurrency">Base Currency *</Label>
                <select
                  id="baseCurrency"
                  value={formData.baseCurrency}
                  onChange={(e) => setFormData({ ...formData, baseCurrency: e.target.value })}
                  disabled={!isEditing}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="IDR">IDR - Indonesian Rupiah</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="npwp">NPWP (Tax ID)</Label>
              <Input
                id="npwp"
                value={formData.npwp}
                onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                disabled={!isEditing}
                placeholder="01.234.567.8-910.000"
              />
            </div>

            {isEditing && (
              <div className="flex gap-4 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
