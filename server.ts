import { Hono } from 'hono';
import { route } from './server/app.js';

const app = new Hono();

app.all('*', (context) => route(context.req.raw));

export default app;
