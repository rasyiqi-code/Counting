'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, Edit, Download, Mail, Printer } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { useParams, useRouter } from 'next/navigation';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';
import Link from 'next/link';

export default function SalesInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  // Fetch invoice data from tRPC
  const { data: invoice, isLoading, error } = trpc.sales.invoice.getById.useQuery({
    id: invoiceId,
  });

  if (isLoading) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12 text-muted-foreground">
          Loading invoice details...
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Invoice Not Found</h2>
          <p className="text-muted-foreground mb-6">The invoice you're looking for doesn't exist.</p>
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
            Sales Invoice
          </AnimatedGradientText>
          <p className="text-sm sm:text-base text-muted-foreground">
            Invoice #{invoice.invoiceNo}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Link href={`/sales/invoices/${invoice.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="outline"
            onClick={() => alert('Download PDF functionality will be implemented soon')}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="relative overflow-hidden">
            <BorderBeam size={250} duration={12} />
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
              <CardDescription>Invoice details and customer information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Invoice Number</p>
                  <p className="text-lg font-semibold">{invoice.invoiceNo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge 
                    variant={invoice.status === 'PAID' ? 'default' : 'secondary'}
                    className={
                      invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'PARTIAL_PAID' ? 'bg-blue-100 text-blue-800' :
                      invoice.status === 'SENT' ? 'bg-yellow-100 text-yellow-800' :
                      invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {invoice.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Invoice Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(invoice.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Due Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(invoice.dueDate)}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Bill To:</p>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">{invoice.contact?.name || 'N/A'}</p>
                  <p>{invoice.contact?.address || 'N/A'}</p>
                  {invoice.contact?.phone && <p>Phone: {invoice.contact.phone}</p>}
                  {invoice.contact?.email && <p>Email: {invoice.contact.email}</p>}
                </div>
              </div>

              {invoice.description && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Description:</p>
                  <p className="text-sm text-muted-foreground">{invoice.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
              <CardDescription>Products and services included in this invoice</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.product?.name || 'N/A'}</p>
                            {item.product?.sku && (
                              <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{item.quantity.toString()}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice.toString())}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.total.toString())}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal</span>
                  <span className="text-sm">{formatCurrency(invoice.subtotal.toString())}</span>
                </div>
                {invoice.taxAmount && Number(invoice.taxAmount.toString()) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Tax</span>
                    <span className="text-sm">{formatCurrency(invoice.taxAmount.toString())}</span>
                  </div>
                )}
                {invoice.discountAmount && Number(invoice.discountAmount.toString()) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Discount</span>
                    <span className="text-sm">-{formatCurrency(invoice.discountAmount.toString())}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total.toString())}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
              <CardDescription>Payment information and history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge 
                  variant={invoice.status === 'PAID' ? 'default' : 'secondary'}
                  className={
                    invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'PARTIAL_PAID' ? 'bg-blue-100 text-blue-800' :
                    invoice.status === 'SENT' ? 'bg-yellow-100 text-yellow-800' :
                    invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }
                >
                  {invoice.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Amount</span>
                <span className="font-medium">{formatCurrency(invoice.total.toString())}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Amount Paid</span>
                <span className="font-medium text-green-600">{formatCurrency(invoice.paidAmount.toString())}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Balance Due</span>
                <span className="font-medium text-red-600">
                  {formatCurrency((Number(invoice.total.toString()) - Number(invoice.paidAmount.toString())).toString())}
                </span>
              </div>
              {invoice.status !== 'PAID' && (
                <Button className="w-full mt-4" size="sm">
                  Receive Payment
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for this invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/sales/invoices/${invoice.id}/edit`}>
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Invoice
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => alert('Download PDF functionality will be implemented soon')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => alert('Send Email functionality will be implemented soon')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
            </CardContent>
          </Card>

          {/* Invoice Notes */}
          {(invoice.notes || invoice.description) && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>Additional information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {invoice.notes || invoice.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

