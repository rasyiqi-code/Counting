import { NextRequest } from 'next/server';
import { AIDocumentProcessor } from '@/lib/ai/document-processor';
import { AISystemOperations } from '@/lib/ai/system-operations';
import { AIDatabaseContext } from '@/lib/ai/database-context';

export async function POST(req: NextRequest) {
  try {
    const { imageData, text, companyId, module } = await req.json();

    if (!companyId) {
      return new Response('Company ID is required', { status: 400 });
    }

    if (!imageData && !text) {
      return new Response('Either imageData or text is required', { status: 400 });
    }

    // Process the document
    const documentResult = await AIDocumentProcessor.analyzeDocument(imageData, text);

    // Process for accounting operations
    const accountingResult = await AIDocumentProcessor.processDocumentForAccounting(
      documentResult,
      companyId,
      module || 'general'
    );

    return new Response(JSON.stringify({
      success: true,
      documentAnalysis: documentResult,
      accountingOperation: accountingResult,
      suggestions: [
        ...documentResult.suggestions,
        ...accountingResult.suggestions
      ]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to process document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
