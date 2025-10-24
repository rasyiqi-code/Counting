import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { type AppRouter } from './root';
import superjson from 'superjson';

/**
 * tRPC Server Client
 * 
 * Untuk memanggil tRPC procedures dari server components atau server actions
 */
export const serverClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/trpc`,
      transformer: superjson,
    }),
  ],
});

