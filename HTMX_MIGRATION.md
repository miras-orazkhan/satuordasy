# HTMX migration

The replacement application lives in `server/` and renders HTML directly. It does not import React, React DOM, Next.js, Radix UI, or client-side state libraries.

## Run the replacement server

```bash
pnpm install
pnpm dev:htmx
```

Required environment variables:

- `DATABASE_URL` — existing PostgreSQL database;
- `AUTH_SECRET` — long random string used to sign admin sessions;
- `PORT` — optional, defaults to `3000`.

## Migrated routes

- `GET /`
- `GET /zhk/:slug`
- `GET /privacy`
- `POST /api/leads`
- `GET|POST /admin/login`
- `POST /admin/logout`
- `GET /admin`
- `GET /admin/projects`
- `POST /admin/projects/:id/toggle`
- `DELETE /admin/projects/:id`
- `GET /admin/leads`
- `PATCH|DELETE /admin/leads/:id`
- `GET|POST /admin/users`
- `DELETE /admin/users/:id`

The HTMX server is now the active application. `package.json` contains no React, React DOM, Next.js, Radix UI, or client-state dependencies. Historical source files under `src/app`, `src/components`, `src/actions`, and `src/hooks` are not included by TypeScript and cannot enter the runtime bundle; they are retained temporarily only as a migration reference and can be deleted after production acceptance.

## Build and production start

```bash
pnpm db:generate
pnpm typecheck
pnpm build
AUTH_SECRET='a-long-random-secret' DATABASE_URL='postgresql://...' pnpm start
```

## Security notes

- Admin sessions are signed, `HttpOnly`, `SameSite=Lax` cookies.
- Mutating admin requests enforce same-origin checks.
- HTML output is escaped by default.
- User-provided URLs are restricted to HTTP(S), root-relative paths, and anchors.
- Bitrix embed code is accepted only when it references known Bitrix hosts.
