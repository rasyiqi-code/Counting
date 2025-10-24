import { prisma } from '@/shared/database/prisma';
import type { NextRequest } from 'next/server';

/**
 * tRPC Context
 * Berisi Prisma client dan session info yang akan tersedia di semua procedures
 */
export async function createContext(opts?: { req?: NextRequest }) {
  // TODO: Add session from next-auth when implemented
  const session = null;

  return {
    prisma,
    session,
    req: opts?.req,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

