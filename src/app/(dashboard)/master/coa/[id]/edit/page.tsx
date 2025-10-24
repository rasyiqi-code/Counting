'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function EditCOAPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accountType, setAccountType] = useState('');
  const [category, setCategory] = useState('');
  const [parentId, setParentId] = useState('');
  const [isActive, setIsActive] = useState(true);

  const { data: account, isLoading, error } = trpc.masterData.coa.getById.useQuery({
    id: accountId,
  });

  const { data: accounts } = trpc.masterData.coa.list.useQuery({
    page: 1,
    limit: 100,
  });

  const updateMutation = trpc.masterData.coa.update.useMutation();

  useEffect(() => {
    if (account) {
      setCode(account.code || '');
      setName(account.name || '');
      setDescription(account.description || '');
      setAccountType(account.accountType || '');
      setCategory(account.category || '');
      setParentId(account.parentId || 'none');
      setIsActive(account.isActive || true);
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id: accountId,
        code,
        name,
        description: description || undefined,
        accountType: accountType as any,
        category: category || undefined,
        parentId: parentId === 'none' ? undefined : parentId || undefined,
        isActive,
      });
      router.push('/master/coa');
    } catch (error) {
      console.error('Failed to update account:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12 text-muted-foreground">
          Loading account details...
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Account Not Found</h2>
          <p className="text-muted-foreground mb-6">The account you're trying to edit doesn't exist.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
            Edit Account
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">
            Edit account information for {account.name}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="relative overflow-hidden">
          <BorderBeam size={250} duration={12} />
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Update account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="code">Account Code *</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g., 1-1100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Account Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter account name"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter account description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type *</Label>
                <Select value={accountType} onValueChange={setAccountType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASSET">Asset</SelectItem>
                    <SelectItem value="LIABILITY">Liability</SelectItem>
                    <SelectItem value="EQUITY">Equity</SelectItem>
                    <SelectItem value="REVENUE">Revenue</SelectItem>
                    <SelectItem value="COGS">Cost of Goods Sold</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Enter category"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentId">Parent Account</Label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Parent</SelectItem>
                    {accounts?.data
                      ?.filter((acc: any) => acc.id !== accountId)
                      ?.map((acc: any) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.code} - {acc.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={(checked) => setIsActive(checked as boolean)}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active Account
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
