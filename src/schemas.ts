import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: 'ID must be a positive integer' }),
});

export const listTodosQuerySchema = z.object({
  q: z.string().optional(),
  sortBy: z
    .enum(['created_at', 'updated_at', 'modified', 'creation'])
    .optional()
    .default('created_at')
    .transform((val) => (['updated_at', 'modified'].includes(val) ? 'updated_at' : 'created_at')),
  order: z
    .enum(['asc', 'desc', 'ASC', 'DESC'])
    .optional()
    .default('desc')
    .transform((val) => val.toUpperCase() as 'ASC' | 'DESC'),
});

export const createTodoSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, { message: 'Title cannot be empty' })
    .max(255, { message: 'Title cannot exceed 255 characters' }),
  description: z.string().optional().default(''),
  completed: z.boolean().optional().default(false),
});

export const updateTodoSchema = z
  .object({
    title: z.string().trim().min(1, { message: 'Title cannot be empty' }).max(255).optional(),
    description: z.string().optional(),
    completed: z.boolean().optional(),
  })
  .refine(
    (data) => data.title !== undefined || data.description !== undefined || data.completed !== undefined,
    { message: 'At least one field (title, description, completed) must be provided for update' }
  );

export type ListTodosQuery = z.infer<typeof listTodosQuerySchema>;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
