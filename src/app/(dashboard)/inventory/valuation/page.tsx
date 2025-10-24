'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { trpc } from '@/lib/trpc/client';
import { formatCurrency } from '@/shared/utils/currency';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

export default function StockValuationPage() {
  const { data: valuation, isLoading } = trpc.inventory.getValuation.useQuery({});

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          Stock Valuation
        </AnimatedGradientText>
        <p className="text-sm sm:text-base text-muted-foreground">Nilai persediaan (FIFO/Average)</p>
      </div>

      <Card className="relative overflow-hidden">
        <BorderBeam size={300} duration={15} />
        <CardHeader>
          <CardTitle>Inventory Valuation Report</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : valuation && valuation.items.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Avg Cost</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead className="text-center">Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {valuation.items.map((item: any) => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-mono">{item.productSku}</TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-right">{item.quantity.toString()}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.averageCost.toString())}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.totalValue.toString())}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                          {item.stockMethod}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={4} className="text-right">TOTAL INVENTORY VALUE:</TableCell>
                    <TableCell className="text-right">{formatCurrency(valuation.totalValue.toString())}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">No inventory data</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

