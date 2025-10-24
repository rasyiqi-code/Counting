'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Building, CreditCard, Calendar } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useParams, useRouter } from 'next/navigation';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';
import Link from 'next/link';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  // Debug: Log customer ID
  console.log('Customer ID:', customerId);

  const { data: customer, isLoading, error } = trpc.masterData.contact.getById.useQuery({
    id: customerId,
  });

  // TODO: Implement AR aging procedure
  const arAging = null;

  // Debug error
  if (error) {
    console.error('Customer detail error:', error);
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Error Loading Customer</h2>
          <p className="text-muted-foreground mb-6">Error: {error.message}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12 text-muted-foreground">
          Loading customer details...
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Customer Not Found</h2>
          <p className="text-muted-foreground mb-6">The customer you're looking for doesn't exist.</p>
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
            {customer.name}
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">
            Customer Code: {customer.code}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Link href={`/master/customers/${customerId}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="relative overflow-hidden">
            <BorderBeam size={250} duration={12} />
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Basic customer details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Company</p>
                    <p className="text-sm text-muted-foreground">{customer.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Code</p>
                    <p className="text-sm text-muted-foreground">{customer.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{customer.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{customer.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {customer.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.address}
                      {customer.city && `, ${customer.city}`}
                      {customer.province && `, ${customer.province}`}
                      {customer.postalCode && ` ${customer.postalCode}`}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Financial Info */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
              <CardDescription>Credit terms and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Credit Limit</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(customer.creditLimit?.toString() || '0')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Payment Terms</p>
                  <p className="text-lg font-semibold">
                    {customer.paymentTerms || 0} days
                  </p>
                </div>
              </div>
              
              {customer.npwp && (
                <div>
                  <p className="text-sm font-medium">NPWP</p>
                  <p className="text-sm text-muted-foreground">{customer.npwp}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AR Aging */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AR Aging</CardTitle>
              <CardDescription>Outstanding receivables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No AR aging data available
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for this customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/sales/invoices/new?customerId=${customerId}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </Link>
              <Link href={`/sales/payments/new?customerId=${customerId}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
