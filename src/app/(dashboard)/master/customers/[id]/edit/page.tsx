'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [npwp, setNpwp] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');

  const { data: customer, isLoading, error } = trpc.masterData.contact.getById.useQuery({
    id: customerId,
  });

  const updateMutation = trpc.masterData.contact.update.useMutation();

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setAddress(customer.address || '');
      setCity(customer.city || '');
      setProvince(customer.province || '');
      setPostalCode(customer.postalCode || '');
      setNpwp(customer.npwp || '');
      setCreditLimit(customer.creditLimit?.toString() || '');
      setPaymentTerms(customer.paymentTerms?.toString() || '');
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id: customerId,
        name,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
        province: province || undefined,
        postalCode: postalCode || undefined,
        npwp: npwp || undefined,
        creditLimit: creditLimit ? parseFloat(creditLimit) : undefined,
        paymentTerms: paymentTerms ? parseInt(paymentTerms) : undefined,
      });
      router.push(`/master/customers/${customerId}`);
    } catch (error) {
      console.error('Failed to update customer:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12 text-muted-foreground">
          Loading customer details...
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Customer Not Found</h2>
          <p className="text-muted-foreground mb-6">The customer you're trying to edit doesn't exist.</p>
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
            Edit Customer
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">
            Edit customer information for {customer.name}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card className="relative overflow-hidden">
        <BorderBeam size={250} duration={12} />
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Update customer details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="npwp">NPWP</Label>
                <Input
                  id="npwp"
                  value={npwp}
                  onChange={(e) => setNpwp(e.target.value)}
                  placeholder="Enter NPWP number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Enter province"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Enter postal code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditLimit">Credit Limit</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder="Enter credit limit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
                <Input
                  id="paymentTerms"
                  type="number"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="Enter payment terms"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
