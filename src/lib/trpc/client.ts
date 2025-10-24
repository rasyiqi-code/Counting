'use client';

import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from './root';

/**
 * tRPC React Client
 * 
 * Digunakan di client components untuk memanggil tRPC procedures
 * 
 * Usage:
 * const { data, isLoading } = trpc.moduleName.procedureName.useQuery(input);
 * const mutation = trpc.moduleName.procedureName.useMutation();
 */
export const trpc = createTRPCReact<AppRouter>();

