import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { HTTPException } from 'hono/http-exception';
import aiRoute from './ai';
import documentRoute from './document';
import importRoute from './import';

export const runtime = 'nodejs';

const app = new Hono();

app.use('*', logger());

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return c.json({ error: 'internal error' });
});

app.basePath('/api').route('/document', documentRoute).route('/ai', aiRoute).route('/import', importRoute);

app.get('/', c => {
  return c.json({
    message: 'Hello from Ai Resume!',
  });
});

export type AppType = typeof app;

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
