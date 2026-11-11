import { serve } from '@hono/node-server';
import { Hono, type Context } from 'hono';
import { logger } from 'hono/logger';
import { initDb } from './db.js';
import {
  createTodoSchema,
  idParamSchema,
  listTodosQuerySchema,
  updateTodoSchema,
} from './schemas.js';
import {
  createTodo,
  deleteTodo,
  getTodoById,
  listTodos,
  updateTodo,
} from './queries.js';

const app = new Hono();

app.use('*', logger());

app.get('/health', (c) => c.json({ status: 'ok' }));

app.get('/', async (c) => {
  const queryResult = listTodosQuerySchema.safeParse(c.req.query());
  if (!queryResult.success) {
    return c.json({ error: 'Invalid query parameters', issues: queryResult.error.flatten() }, 400);
  }

  const todos = await listTodos(queryResult.data);
  return c.json(todos);
});

app.post('/', async (c) => {
  const rawBody: unknown = await c.req.json().catch(() => null);
  const bodyResult = createTodoSchema.safeParse(rawBody);

  if (!bodyResult.success) {
    return c.json({ error: 'Validation failed', issues: bodyResult.error.flatten() }, 400);
  }

  const todo = await createTodo(bodyResult.data);
  return c.json(todo, 201);
});

app.get('/:id', async (c) => {
  const paramResult = idParamSchema.safeParse({ id: c.req.param('id') });
  if (!paramResult.success) {
    return c.json({ error: 'Invalid ID', issues: paramResult.error.flatten() }, 400);
  }

  const todo = await getTodoById(paramResult.data.id);
  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404);
  }

  return c.json(todo);
});

const updateHandler = async (c: Context) => {
  const paramResult = idParamSchema.safeParse({ id: c.req.param('id') });
  if (!paramResult.success) {
    return c.json({ error: 'Invalid ID', issues: paramResult.error.flatten() }, 400);
  }

  const rawBody: unknown = await c.req.json().catch(() => null);
  const bodyResult = updateTodoSchema.safeParse(rawBody);
  if (!bodyResult.success) {
    return c.json({ error: 'Validation failed', issues: bodyResult.error.flatten() }, 400);
  }

  const updated = await updateTodo(paramResult.data.id, bodyResult.data);
  if (!updated) {
    return c.json({ error: 'Todo not found' }, 404);
  }

  return c.json(updated);
};

app.put('/:id', updateHandler);
app.patch('/:id', updateHandler);

app.delete('/:id', async (c) => {
  const paramResult = idParamSchema.safeParse({ id: c.req.param('id') });
  if (!paramResult.success) {
    return c.json({ error: 'Invalid ID', issues: paramResult.error.flatten() }, 400);
  }

  const deleted = await deleteTodo(paramResult.data.id);
  if (!deleted) {
    return c.json({ error: 'Todo not found' }, 404);
  }

  return c.json({ message: 'Todo deleted successfully', deleted });
});

const port = Number(process.env.PORT) || 3000;

async function start() {
  await initDb();
  serve({
    fetch: app.fetch,
    port,
  });
  console.log(`Server is running on http://0.0.0.0:${port}`);
}

start().catch((err: unknown) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
