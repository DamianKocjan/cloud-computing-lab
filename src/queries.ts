import { pool } from './db.js';
import type { CreateTodoInput, ListTodosQuery, UpdateTodoInput } from './schemas.js';

export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export async function listTodos(filter: ListTodosQuery): Promise<Todo[]> {
  const { q, sortBy, order } = filter;
  let query = 'SELECT * FROM todos';
  const params: (string | number)[] = [];

  if (q && q.trim()) {
    query += ' WHERE title ILIKE $1 OR description ILIKE $1';
    params.push(`%${q.trim()}%`);
  }

  query += ` ORDER BY ${sortBy} ${order}`;

  const result = await pool.query<Todo>(query, params);
  return result.rows;
}

export async function getTodoById(id: number): Promise<Todo | null> {
  const result = await pool.query<Todo>('SELECT * FROM todos WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const { title, description, completed } = input;
  const result = await pool.query<Todo>(
    `INSERT INTO todos (title, description, completed)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [title, description, completed]
  );
  return result.rows[0];
}

export async function updateTodo(id: number, input: UpdateTodoInput): Promise<Todo | null> {
  const existing = await getTodoById(id);
  if (!existing) {
    return null;
  }

  const title = input.title !== undefined ? input.title : existing.title;
  const description = input.description !== undefined ? input.description : existing.description;
  const completed = input.completed !== undefined ? input.completed : existing.completed;

  const result = await pool.query<Todo>(
    `UPDATE todos
     SET title = $1, description = $2, completed = $3, updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING *`,
    [title, description, completed, id]
  );

  return result.rows[0] ?? null;
}

export async function deleteTodo(id: number): Promise<Todo | null> {
  const result = await pool.query<Todo>(
    'DELETE FROM todos WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] ?? null;
}
