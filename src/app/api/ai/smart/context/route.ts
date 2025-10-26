import { NextRequest, NextResponse } from 'next/server';
import { AIDatabaseContext } from '@/lib/ai/database-context';
import { AISystemOperations } from '@/lib/ai/system-operations';

export async function POST(request: NextRequest) {
  try {
    const { companyId, module = 'general' } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    console.log('Loading system context for:', { companyId, module });

    // Get database context - use full context instead of module-specific
    const databaseContext = await AIDatabaseContext.getContext(companyId);
    
    // Get system operations
    const systemOperations = AISystemOperations.getOperationsByModule(module);

    console.log('Database context loaded successfully:', {
      coaCount: databaseContext.coa?.length || 0,
      customerCount: databaseContext.customers?.length || 0,
      vendorCount: databaseContext.vendors?.length || 0,
      productCount: databaseContext.products?.length || 0,
      transactionCount: databaseContext.recentTransactions?.length || 0
    });

    return NextResponse.json({
      success: true,
      databaseContext,
      systemOperations
    });

  } catch (error) {
    console.error('Error loading system context:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load system context',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
