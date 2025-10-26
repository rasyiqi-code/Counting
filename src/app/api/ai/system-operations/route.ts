import { NextRequest } from 'next/server';
import { AISystemOperations } from '@/lib/ai/system-operations';
import { AIBusinessLogic } from '@/lib/ai/business-logic';

export async function POST(req: NextRequest) {
  try {
    const { operation, data, companyId, module } = await req.json();

    if (!companyId) {
      return new Response('Company ID is required', { status: 400 });
    }

    if (!operation) {
      return new Response('Operation is required', { status: 400 });
    }

    // Validate data using business logic
    if (module) {
      const validation = AIBusinessLogic.validateData(module, data);
      if (!validation.valid) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }

    // Execute the operation
    const result = await AISystemOperations.executeOperation(operation, data, companyId);

    return new Response(JSON.stringify({
      success: true,
      result,
      message: 'Operation completed successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error executing system operation:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to execute operation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const module = searchParams.get('module');
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return new Response('Company ID is required', { status: 400 });
    }

    let operations;
    if (module) {
      operations = AISystemOperations.getOperationsByModule(module);
    } else {
      operations = AISystemOperations.getAvailableOperations();
    }

    return new Response(JSON.stringify({
      success: true,
      operations: operations.map(op => ({
        id: op.id,
        name: op.name,
        description: op.description,
        module: op.module
      }))
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error getting system operations:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to get operations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
