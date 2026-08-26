import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { route } from './app.js';

const port = Number(process.env.PORT || 3000);

createServer(async (request, response) => {
  try {
    const origin = `http://${request.headers.host || `localhost:${port}`}`;
    const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : Readable.toWeb(request) as ReadableStream;
    const result = await route(new Request(new URL(request.url || '/', origin), {
      method: request.method,
      headers: request.headers as HeadersInit,
      body,
      duplex: 'half',
    } as RequestInit));
    response.writeHead(result.status, Object.fromEntries(result.headers));
    if (result.body) Readable.fromWeb(result.body as never).pipe(response);
    else response.end();
  } catch (error) {
    console.error(error);
    response.writeHead(500, { 'content-type': 'text/html; charset=utf-8' });
    response.end('<h1>Внутренняя ошибка сервера</h1>');
  }
}).listen(port, () => console.log(`HTMX server listening on http://localhost:${port}`));
