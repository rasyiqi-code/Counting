import { initTRPC, TRPCError } from '@trpc/server';
import { type Context } from './context';
import superjson from 'superjson';
import { ZodError } from 'zod';

/**
 * Inisialisasi tRPC dengan context dan transformer
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - membutuhkan authentication
 * TODO: Implement proper authentication check when next-auth is ready
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  // Temporary: Allow all requests until auth is implemented
  // if (!ctx.session || !ctx.session.user) {
  //   throw new TRPCError({ code: 'UNAUTHORIZED' });
  // }

  return next({
    ctx: {
      ...ctx,
      // session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Admin procedure - membutuhkan admin role
 * TODO: Implement proper role check when RBAC is ready
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // Temporary: Allow all requests until RBAC is implemented
  // if (ctx.session.user.role !== 'ADMIN' && ctx.session.user.role !== 'SUPER_ADMIN') {
  //   throw new TRPCError({ code: 'FORBIDDEN' });
  // }

  return next({
    ctx,
  });
});

/**
 * Middleware untuk logging (optional, untuk development)
 */
export const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[tRPC] ${type} ${path} - ${durationMs}ms`);
  }

  return result;
});

export const publicProcedureWithLogging = publicProcedure.use(loggerMiddleware);
export const protectedProcedureWithLogging = protectedProcedure.use(loggerMiddleware);

