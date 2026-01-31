
import { z } from 'zod';
import { insertTransactionSchema, insertCategorySchema, insertSavingsSchema, insertContactSchema, insertUserSchema, transactions, categories, savings, contacts, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/settings',
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
      },
    },
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories',
      responses: {
        200: z.array(z.custom<typeof categories.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/categories',
      input: insertCategorySchema,
      responses: {
        201: z.custom<typeof categories.$inferSelect>(),
      },
    },
  },
  transactions: {
    list: {
      method: 'GET' as const,
      path: '/api/transactions',
      input: z.object({
        month: z.string().optional(), // YYYY-MM
        type: z.string().optional(),
        categoryId: z.string().optional(),
        paymentMethod: z.string().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect & { category: typeof categories.$inferSelect | null }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/transactions',
      input: insertTransactionSchema,
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/transactions/:id',
      input: insertTransactionSchema.partial(),
      responses: {
        200: z.custom<typeof transactions.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/transactions/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  savings: {
    list: {
      method: 'GET' as const,
      path: '/api/savings',
      responses: {
        200: z.array(z.custom<typeof savings.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/savings',
      input: insertSavingsSchema,
      responses: {
        201: z.custom<typeof savings.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/savings/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  contacts: {
    list: {
      method: 'GET' as const,
      path: '/api/contacts',
      responses: {
        200: z.array(z.custom<typeof contacts.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/contacts',
      input: insertContactSchema,
      responses: {
        201: z.custom<typeof contacts.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/contacts/:id',
      input: insertContactSchema.partial(),
      responses: {
        200: z.custom<typeof contacts.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/contacts/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  reports: {
    monthly: {
      method: 'GET' as const,
      path: '/api/reports/monthly',
      input: z.object({
        month: z.string(), // YYYY-MM
      }),
      responses: {
        200: z.object({
          income: z.number(),
          expense: z.number(),
          balance: z.number(),
          savings: z.number(),
          payable: z.number(),
          receivable: z.number(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
